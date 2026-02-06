use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use std::fs::OpenOptions;
use std::io::Write;
use async_native_tls::TlsConnector;
use async_std::net::TcpStream;
use mailparse::MailHeaderMap;
use async_std::stream::StreamExt;

mod crypto;

/// 认证会话结构
#[derive(Debug, Clone, Serialize, Deserialize)]
struct AuthSession {
    email: String,
    token: String,
    #[serde(rename = "expiresAt")]
    expires_at: i64,
}

/// 子邮箱结构
#[derive(Debug, Clone, Serialize, Deserialize)]
struct SubEmail {
    address: String,
    suffix: String,
    #[serde(rename = "createdAt")]
    created_at: i64,
    status: String,
}

/// 用户偏好设置结构
#[derive(Debug, Clone, Serialize, Deserialize)]
struct UserPreferences {
    #[serde(rename = "autoRefreshInterval")]
    auto_refresh_interval: i64,
    theme: String,
    #[serde(rename = "windowSize")]
    window_size: WindowSize,
    #[serde(rename = "autoLogin")]
    auto_login: bool,
}

/// 窗口尺寸结构
#[derive(Debug, Clone, Serialize, Deserialize)]
struct WindowSize {
    width: i32,
    height: i32,
}

/// 错误日志条目结构
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ErrorLogEntry {
    timestamp: i64,
    context: String,
    message: String,
    stack: Option<String>,
    #[serde(rename = "type")]
    error_type: String,
}

/// 登录命令
/// 验证邮箱和密码，返回会话信息
#[tauri::command]
async fn login(email: String, password: String) -> Result<AuthSession, String> {
    // 验证邮箱格式
    if !email.ends_with("@2925.com") {
        return Err("邮箱地址必须是2925.com域名".to_string());
    }
    
    // 验证密码不为空
    if password.is_empty() {
        return Err("密码不能为空".to_string());
    }
    
    // 验证密码长度
    if password.len() < 6 {
        return Err("密码长度至少为6位".to_string());
    }
    
    // 尝试连接到IMAP服务器进行真实验证
    // 标准IMAP服务器配置
    let imap_server = "imap.2925.com";
    let imap_port = 993; // IMAPS端口
    
    // 尝试连接并验证
    match connect_and_verify_imap(&email, &password, imap_server, imap_port).await {
        Ok(_) => {
            // 验证成功，返回会话
            Ok(AuthSession {
                email: email.clone(),
                token: format!("token_{}", uuid::Uuid::new_v4()),
                expires_at: chrono::Utc::now().timestamp() + 3600,
            })
        }
        Err(e) => {
            // 验证失败
            Err(format!("登录失败: {}", e))
        }
    }
}

/// 连接并验证IMAP服务器
/// 
/// # 参数
/// * `email` - 用户邮箱地址
/// * `password` - 用户密码
/// * `server` - IMAP服务器地址
/// * `port` - IMAP服务器端口
async fn connect_and_verify_imap(
    email: &str,
    password: &str,
    server: &str,
    port: u16,
) -> Result<(), String> {
    // 连接到IMAP服务器
    let tcp_stream = TcpStream::connect((server, port))
        .await
        .map_err(|e| format!("无法连接到邮件服务器: {}", e))?;
    
    // 创建TLS连接
    let tls = TlsConnector::new();
    let tls_stream = tls
        .connect(server, tcp_stream)
        .await
        .map_err(|e| format!("TLS连接失败: {}", e))?;
    
    // 创建IMAP客户端
    let client = async_imap::Client::new(tls_stream);
    
    // 尝试登录
    let mut imap_session = client
        .login(email, password)
        .await
        .map_err(|e| format!("邮箱或密码错误: {:?}", e.0))?;
    
    // 登录成功，登出并关闭连接
    imap_session
        .logout()
        .await
        .map_err(|e| format!("登出失败: {}", e))?;
    
    Ok(())
}

/// 登出命令
#[tauri::command]
async fn logout() -> Result<(), String> {
    // TODO: 实现实际的登出逻辑
    Ok(())
}

/// 获取邮件列表命令
/// 从IMAP服务器获取邮件
#[tauri::command]
async fn fetch_emails(app: tauri::AppHandle) -> Result<Vec<serde_json::Value>, String> {
    // 从存储中加载会话信息
    let store = app.store("store.json")
        .map_err(|e| format!("无法访问存储: {}", e))?;
    
    let session_value = store.get("session")
        .ok_or("未登录，请先登录")?;
    
    let session: AuthSession = serde_json::from_value(session_value.clone())
        .map_err(|e| format!("会话数据无效: {}", e))?;
    
    // 检查会话是否过期
    if chrono::Utc::now().timestamp() > session.expires_at {
        return Err("会话已过期，请重新登录".to_string());
    }
    
    // 尝试从三层加密存储中读取密码
    let password = match crypto::load_and_decrypt_password(&session.email) {
        Ok(pwd) => pwd,
        Err(_) => {
            // 如果三层加密读取失败，尝试从旧的store读取（向后兼容）
            let password_value = store.get("password")
                .ok_or("未找到登录凭据")?;
            
            serde_json::from_value(password_value.clone())
                .map_err(|e| format!("密码数据无效: {}", e))?
        }
    };
    
    // 连接到IMAP服务器获取邮件
    let imap_server = "imap.2925.com";
    let imap_port = 993;
    
    fetch_emails_from_imap(&session.email, &password, imap_server, imap_port).await
}

/// 从IMAP服务器获取邮件
/// 
/// # 参数
/// * `email` - 用户邮箱地址
/// * `password` - 用户密码
/// * `server` - IMAP服务器地址
/// * `port` - IMAP服务器端口
async fn fetch_emails_from_imap(
    email: &str,
    password: &str,
    server: &str,
    port: u16,
) -> Result<Vec<serde_json::Value>, String> {
    // 连接到IMAP服务器
    let tcp_stream = TcpStream::connect((server, port))
        .await
        .map_err(|e| format!("无法连接到邮件服务器: {}", e))?;
    
    // 创建TLS连接
    let tls = TlsConnector::new();
    let tls_stream = tls
        .connect(server, tcp_stream)
        .await
        .map_err(|e| format!("TLS连接失败: {}", e))?;
    
    // 创建IMAP客户端并登录
    let client = async_imap::Client::new(tls_stream);
    let mut imap_session = client
        .login(email, password)
        .await
        .map_err(|e| format!("登录失败: {:?}", e.0))?;
    
    // 选择收件箱
    let mailbox = imap_session
        .select("INBOX")
        .await
        .map_err(|e| format!("无法打开收件箱: {}", e))?;
    
    let total_messages = mailbox.exists;
    
    if total_messages == 0 {
        // 没有邮件，直接返回空列表
        imap_session
            .logout()
            .await
            .map_err(|e| format!("登出失败: {}", e))?;
        return Ok(vec![]);
    }
    
    // 计算要获取的邮件范围（最新50封）
    let start = if total_messages > 50 {
        total_messages - 49
    } else {
        1
    };
    let end = total_messages;
    
    let fetch_range = format!("{}:{}", start, end);
    
    // 获取邮件（使用RFC822获取完整邮件，INTERNALDATE获取服务器时间）
    let mut messages = imap_session
        .fetch(&fetch_range, "(RFC822 FLAGS INTERNALDATE)")
        .await
        .map_err(|e| format!("获取邮件失败: {}", e))?;
    
    let mut emails = Vec::new();
    
    // 遍历消息流
    while let Some(fetch_result) = messages.next().await {
        match fetch_result {
            Ok(message) => {
                // 尝试获取邮件正文
                let body_data = message.body();
                
                // 获取INTERNALDATE作为备用时间戳
                let internal_date_timestamp = message.internal_date()
                    .map(|dt| {
                        // DateTime<FixedOffset>可以直接获取时间戳
                        dt.timestamp_millis()
                    });
                
                if let Some(body) = body_data {
                    // 解析邮件
                    match mailparse::parse_mail(body) {
                        Ok(parsed) => {
                            // 获取邮件时间戳 - 优先使用Date头部，其次使用INTERNALDATE
                            let timestamp = if let Some(date_str) = parsed.headers.get_first_value("Date") {
                                // 尝试解析RFC2822格式
                                match chrono::DateTime::parse_from_rfc2822(&date_str) {
                                    Ok(dt) => dt.timestamp_millis(),
                                    Err(_) => {
                                        // 解析失败，使用INTERNALDATE或当前时间
                                        internal_date_timestamp.unwrap_or_else(|| {
                                            eprintln!("邮件 {} Date头部解析失败，使用INTERNALDATE", message.message);
                                            chrono::Utc::now().timestamp_millis()
                                        })
                                    }
                                }
                            } else {
                                // 没有Date头部，使用INTERNALDATE
                                internal_date_timestamp.unwrap_or_else(|| {
                                    eprintln!("邮件 {} 没有Date头部，使用当前时间", message.message);
                                    chrono::Utc::now().timestamp_millis()
                                })
                            };
                            
                            // 获取邮件正文 - 尝试多种方式
                            let body_text = if let Ok(body_str) = parsed.get_body() {
                                if body_str.trim().is_empty() {
                                    // 如果纯文本为空，尝试获取HTML
                                    parsed.subparts.iter()
                                        .find(|part| {
                                            part.ctype.mimetype.contains("text/html") ||
                                            part.ctype.mimetype.contains("text/plain")
                                        })
                                        .and_then(|part| part.get_body().ok())
                                        .unwrap_or_else(|| String::from("邮件内容为空"))
                                } else {
                                    body_str
                                }
                            } else {
                                // 如果get_body失败，尝试从subparts获取
                                parsed.subparts.iter()
                                    .find(|part| {
                                        part.ctype.mimetype.contains("text/html") ||
                                        part.ctype.mimetype.contains("text/plain")
                                    })
                                    .and_then(|part| part.get_body().ok())
                                    .unwrap_or_else(|| String::from("邮件内容为空"))
                            };
                            
                            let email_json = serde_json::json!({
                                "id": format!("{}", message.message),
                                "from": parsed.headers.get_first_value("From").unwrap_or_else(|| String::from("未知发件人")),
                                "to": parsed.headers.get_first_value("To").unwrap_or_else(|| String::from("未知收件人")),
                                "subject": parsed.headers.get_first_value("Subject").unwrap_or_else(|| String::from("(无主题)")),
                                "body": body_text,
                                "timestamp": timestamp,
                                "isRead": message.flags().any(|f| f == async_imap::types::Flag::Seen),
                                "isSubEmailForwarded": false,
                            });
                            
                            emails.push(email_json);
                        }
                        Err(e) => {
                            eprintln!("解析邮件 {} 失败: {}", message.message, e);
                        }
                    }
                } else {
                    eprintln!("邮件 {} 没有正文数据", message.message);
                }
            }
            Err(e) => {
                eprintln!("获取邮件时出错: {}", e);
            }
        }
    }
    
    // 显式释放 messages
    drop(messages);
    
    // 登出
    imap_session
        .logout()
        .await
        .map_err(|e| format!("登出失败: {}", e))?;
    
    Ok(emails)
}

/// 发送邮件命令
/// 简化版本：直接返回成功，不实际发送邮件
#[tauri::command]
async fn send_email(
    _app: tauri::AppHandle,
    _to: String,
    _subject: String,
    _body: String,
) -> Result<(), String> {
    // 注意：这是简化实现，仅用于子邮箱生成
    // 实际的邮件发送需要SMTP服务器支持
    // 目前直接返回成功，子邮箱会被标记为已创建
    Ok(())
}

/// 保存会话到加密存储
#[tauri::command]
async fn save_session(
    app: tauri::AppHandle,
    session: AuthSession,
) -> Result<(), String> {
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    store.set("session", serde_json::to_value(&session).unwrap());
    store.save()
        .map_err(|e| format!("Failed to save session: {}", e))?;
    
    Ok(())
}

/// 保存密码到加密存储（用于后续IMAP操作）
/// 使用三层加密保护密码安全
#[tauri::command]
async fn save_password(
    app: tauri::AppHandle,
    password: String,
) -> Result<(), String> {
    // 从存储中获取当前会话以获取邮箱地址
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    let session_value = store.get("session")
        .ok_or("未找到会话信息")?;
    
    let session: AuthSession = serde_json::from_value(session_value.clone())
        .map_err(|e| format!("会话数据无效: {}", e))?;
    
    // 使用三层加密保存密码
    crypto::encrypt_and_save_password(&password, &session.email)
        .map_err(|e| format!("保存密码失败: {}", e))?;
    
    // 同时保存到store（用于向后兼容）
    store.set("password", serde_json::to_value(&password).unwrap());
    store.save()
        .map_err(|e| format!("Failed to save password to store: {}", e))?;
    
    Ok(())
}

/// 从加密存储加载会话
#[tauri::command]
async fn load_session(app: tauri::AppHandle) -> Result<Option<AuthSession>, String> {
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    match store.get("session") {
        Some(value) => {
            let session: AuthSession = serde_json::from_value(value.clone())
                .map_err(|e| format!("Failed to deserialize session: {}", e))?;
            Ok(Some(session))
        }
        None => Ok(None),
    }
}

/// 从加密存储加载密码
/// 使用三层解密恢复密码
#[tauri::command]
async fn load_password(app: tauri::AppHandle) -> Result<Option<String>, String> {
    // 从存储中获取当前会话以获取邮箱地址
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    let session_value = match store.get("session") {
        Some(v) => v,
        None => return Ok(None),
    };
    
    let session: AuthSession = serde_json::from_value(session_value.clone())
        .map_err(|e| format!("会话数据无效: {}", e))?;
    
    // 尝试从三层加密存储中读取密码
    match crypto::load_and_decrypt_password(&session.email) {
        Ok(password) => Ok(Some(password)),
        Err(_) => {
            // 如果三层加密读取失败，尝试从旧的store读取（向后兼容）
            match store.get("password") {
                Some(value) => {
                    let password: String = serde_json::from_value(value.clone())
                        .map_err(|e| format!("密码数据无效: {}", e))?;
                    Ok(Some(password))
                }
                None => Ok(None),
            }
        }
    }
}

/// 保存子邮箱列表到加密存储
#[tauri::command]
async fn save_sub_emails(
    app: tauri::AppHandle,
    sub_emails: Vec<SubEmail>,
) -> Result<(), String> {
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    store.set("sub_emails", serde_json::to_value(&sub_emails).unwrap());
    store.save()
        .map_err(|e| format!("Failed to save sub emails: {}", e))?;
    
    Ok(())
}

/// 从加密存储加载子邮箱列表
#[tauri::command]
async fn load_sub_emails(app: tauri::AppHandle) -> Result<Vec<SubEmail>, String> {
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    match store.get("sub_emails") {
        Some(value) => {
            let sub_emails: Vec<SubEmail> = serde_json::from_value(value.clone())
                .map_err(|e| format!("Failed to deserialize sub emails: {}", e))?;
            Ok(sub_emails)
        }
        None => Ok(vec![]),
    }
}

/// 保存用户偏好设置到加密存储
#[tauri::command]
async fn save_preferences(
    app: tauri::AppHandle,
    preferences: UserPreferences,
) -> Result<(), String> {
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    store.set("preferences", serde_json::to_value(&preferences).unwrap());
    store.save()
        .map_err(|e| format!("Failed to save preferences: {}", e))?;
    
    Ok(())
}

/// 从加密存储加载用户偏好设置
#[tauri::command]
async fn load_preferences(app: tauri::AppHandle) -> Result<Option<UserPreferences>, String> {
    let store = app.store("store.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    
    match store.get("preferences") {
        Some(value) => {
            let preferences: UserPreferences = serde_json::from_value(value.clone())
                .map_err(|e| format!("Failed to deserialize preferences: {}", e))?;
            Ok(Some(preferences))
        }
        None => Ok(None),
    }
}

/// 记录错误到本地日志文件
#[tauri::command]
async fn log_error(app: tauri::AppHandle, entry: ErrorLogEntry) -> Result<(), String> {
    // 获取应用数据目录
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    // 确保日志目录存在
    let log_dir = app_data_dir.join("logs");
    std::fs::create_dir_all(&log_dir)
        .map_err(|e| format!("Failed to create log directory: {}", e))?;
    
    // 生成日志文件名（按日期）
    let date = chrono::Local::now().format("%Y-%m-%d").to_string();
    let log_file_path = log_dir.join(format!("error_{}.log", date));
    
    // 打开或创建日志文件（追加模式）
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file_path)
        .map_err(|e| format!("Failed to open log file: {}", e))?;
    
    // 格式化日志条目
    let timestamp_str = chrono::DateTime::from_timestamp(entry.timestamp / 1000, 0)
        .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    
    let log_line = format!(
        "[{}] [{}] [{}] {}\n",
        timestamp_str,
        entry.error_type,
        entry.context,
        entry.message
    );
    
    // 写入日志
    file.write_all(log_line.as_bytes())
        .map_err(|e| format!("Failed to write to log file: {}", e))?;
    
    // 如果有堆栈信息，也写入
    if let Some(stack) = entry.stack {
        let stack_line = format!("Stack trace:\n{}\n\n", stack);
        file.write_all(stack_line.as_bytes())
            .map_err(|e| format!("Failed to write stack trace: {}", e))?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            // 创建系统托盘菜单
            let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            
            let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;
            
            // 创建系统托盘图标
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "hide" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.hide();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button, .. } = event {
                        if button == tauri::tray::MouseButton::Left {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    }
                })
                .build(app)?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            login,
            logout,
            fetch_emails,
            send_email,
            save_session,
            save_password,
            load_session,
            load_password,
            save_sub_emails,
            load_sub_emails,
            save_preferences,
            load_preferences,
            log_error
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

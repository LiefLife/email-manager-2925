/// IMAP连接池模块
/// 复用IMAP连接以提高性能
use async_native_tls::TlsConnector;
use async_std::net::TcpStream;
use async_std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::time::{Duration, Instant};

/// IMAP连接包装器
pub struct ImapConnection {
    pub session: async_imap::Session<async_native_tls::TlsStream<TcpStream>>,
    pub last_used: Instant,
}

/// IMAP连接池
pub struct ImapPool {
    connections: Arc<Mutex<HashMap<String, ImapConnection>>>,
    max_idle_time: Duration,
}

impl ImapPool {
    /// 创建新的连接池
    pub fn new() -> Self {
        Self {
            connections: Arc::new(Mutex::new(HashMap::new())),
            max_idle_time: Duration::from_secs(300), // 5分钟空闲超时
        }
    }

    /// 获取或创建IMAP连接
    pub async fn get_connection(
        &self,
        email: &str,
        password: &str,
        server: &str,
        port: u16,
    ) -> Result<async_imap::Session<async_native_tls::TlsStream<TcpStream>>, String> {
        let key = format!("{}@{}:{}", email, server, port);
        
        // 尝试从池中获取现有连接
        {
            let mut pool = self.connections.lock().await;
            
            if let Some(conn) = pool.remove(&key) {
                // 检查连接是否过期
                if conn.last_used.elapsed() < self.max_idle_time {
                    // 连接仍然有效，返回
                    return Ok(conn.session);
                }
                // 连接已过期，继续创建新连接
            }
        }
        
        // 创建新连接
        let tcp_stream = TcpStream::connect((server, port))
            .await
            .map_err(|e| format!("无法连接到邮件服务器: {}", e))?;
        
        let tls = TlsConnector::new();
        let tls_stream = tls
            .connect(server, tcp_stream)
            .await
            .map_err(|e| format!("TLS连接失败: {}", e))?;
        
        let client = async_imap::Client::new(tls_stream);
        
        let session = client
            .login(email, password)
            .await
            .map_err(|e| format!("登录失败: {:?}", e.0))?;
        
        Ok(session)
    }

    /// 归还连接到池中
    pub async fn return_connection(
        &self,
        email: &str,
        server: &str,
        port: u16,
        session: async_imap::Session<async_native_tls::TlsStream<TcpStream>>,
    ) {
        let key = format!("{}@{}:{}", email, server, port);
        let mut pool = self.connections.lock().await;
        
        pool.insert(
            key,
            ImapConnection {
                session,
                last_used: Instant::now(),
            },
        );
    }

    /// 清理过期连接
    pub async fn cleanup_expired(&self) {
        let mut pool = self.connections.lock().await;
        pool.retain(|_, conn| conn.last_used.elapsed() < self.max_idle_time);
    }
}

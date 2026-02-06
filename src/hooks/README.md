# Hooks 自定义钩子目录

存放React自定义Hooks，用于封装可复用的业务逻辑：

- **useAuth**: 认证相关Hook，封装AuthContext的使用
- **useAutoRefresh**: 自动刷新Hook，提供定时刷新功能（5秒间隔）
- **useSubEmailGenerator**: 子邮箱生成Hook，提供子邮箱生成功能（生成后缀、构造地址、发送创建邮件）
- **useSubEmail**: 子邮箱管理Hook，封装SubEmailContext的使用
- **useAppLifecycle**: 应用生命周期管理Hook，处理应用启动、关闭和状态保存
- **useBeforeUnload**: 应用关闭前处理Hook，在应用关闭前保存所有数据
- **useTauriWindowEvents**: Tauri窗口事件监听Hook，处理Tauri特定的窗口事件
- **useSystemTray**: 系统托盘控制Hook，提供系统托盘相关的操作接口
- useEmailFetch: 邮件获取Hook（待实现）


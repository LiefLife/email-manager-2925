# 2925邮箱管理系统

基于 Tauri 2 + React 19 + TypeScript 的桌面邮件客户端，专为 2925.com 邮箱服务设计。

## 功能特性

- IMAP 邮件收取与展示
- 子邮箱管理（通过邮箱别名实现）
- 三层加密密码存储（AES-GCM + PBKDF2 + 系统密钥环）
- 系统托盘集成
- 自动刷新邮件列表
- 响应式三栏布局

## 技术栈

### 前端
- React 19.1.0
- TypeScript 5.8.3
- Styled Components 6.3.8
- Framer Motion 12.31.1
- Vite 7.0.4

### 后端
- Tauri 2
- Rust 2021 Edition
- async-imap 0.9（IMAP 客户端）
- aes-gcm 0.10（加密）
- keyring 2.3（系统密钥环）

### 测试
- Vitest 4.0.18
- Testing Library
- fast-check 4.5.3（属性测试）

## 开发环境要求

- Node.js 18+
- Rust 1.70+
- npm 或其他包管理器

## 安装与运行

安装依赖：
```bash
npm install
```

开发模式：
```bash
npm run tauri dev
```

运行测试：
```bash
npm test
```

构建应用：
```bash
npm run tauri build
```

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Auth/           # 登录表单
│   ├── Email/          # 邮件列表与详情
│   ├── SubEmail/       # 子邮箱管理
│   └── Common/         # 通用组件
├── contexts/           # React Context
├── hooks/              # 自定义 Hooks
├── services/           # Tauri 命令封装
├── types/              # TypeScript 类型定义
└── utils/              # 工具函数

src-tauri/
├── src/
│   ├── lib.rs          # Tauri 命令实现
│   ├── crypto.rs       # 加密模块
│   └── main.rs         # 应用入口
└── Cargo.toml          # Rust 依赖配置
```

## 核心功能说明

### 邮件收取
通过 IMAP 协议连接到 `imap.2925.com:993`，支持 TLS 加密连接。默认获取收件箱最新 50 封邮件。

### 子邮箱
利用邮箱别名功能，用户可以创建形如 `username+suffix@2925.com` 的子邮箱地址。所有发送到子邮箱的邮件会自动转发到主邮箱。

### 密码安全
采用三层加密方案：
1. 使用 PBKDF2 从机器 ID 派生密钥
2. 使用 AES-GCM 加密密码
3. 将加密密钥存储在系统密钥环中

### 系统托盘
应用最小化到系统托盘，支持：
- 左键点击切换窗口显示/隐藏
- 右键菜单快速操作

## 开发工具推荐

- VS Code
- Tauri 扩展
- rust-analyzer 扩展

## 注意事项

- 仅支持 2925.com 域名邮箱
- 需要有效的 IMAP 服务器访问权限
- 密码存储依赖系统密钥环服务
- 子邮箱功能需要邮件服务器支持别名转发

## 许可证

本项目为私有项目。

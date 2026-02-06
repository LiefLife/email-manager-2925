/**
 * 类型定义统一导出文件
 * 提供所有核心数据模型和接口的导出
 */

// 认证相关类型
export type {
  LoginCredentials,
  AuthSession,
  AuthService,
} from './auth.types';

// 邮件相关类型
export type {
  Email,
  EmailService,
} from './email.types';

// 子邮箱相关类型
export type {
  SubEmail,
  SubEmailStatus,
  SubEmailService,
} from './subEmail.types';

// 应用状态相关类型
export type {
  AppState,
  AuthState,
  EmailsState,
  SubEmailsState,
  UIState,
  UITheme,
} from './app.types';

// 用户偏好设置相关类型
export type {
  UserPreferences,
  WindowSize,
} from './preferences.types';
export { DEFAULT_PREFERENCES } from './preferences.types';

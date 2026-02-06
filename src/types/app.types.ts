import { AuthSession } from './auth.types';
import { Email } from './email.types';
import { SubEmail } from './subEmail.types';

/**
 * 认证状态接口
 */
export interface AuthState {
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 当前会话信息 */
  session: AuthSession | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 邮件状态接口
 */
export interface EmailsState {
  /** 邮件列表 */
  list: Email[];
  /** 加载状态 */
  loading: boolean;
  /** 最后获取时间戳 */
  lastFetchTime: number;
  /** 错误信息 */
  error: string | null;
}

/**
 * 子邮箱状态接口
 */
export interface SubEmailsState {
  /** 子邮箱列表 */
  list: SubEmail[];
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * UI主题类型
 */
export type UITheme = 'glass';

/**
 * UI状态接口
 */
export interface UIState {
  /** 当前选中的邮件ID */
  selectedEmail: string | null;
  /** 侧边栏是否打开 */
  sidebarOpen: boolean;
  /** UI主题 */
  theme: UITheme;
}

/**
 * 全局应用状态接口
 * 包含所有模块的状态信息
 */
export interface AppState {
  /** 认证状态 */
  auth: AuthState;
  /** 邮件状态 */
  emails: EmailsState;
  /** 子邮箱状态 */
  subEmails: SubEmailsState;
  /** UI状态 */
  ui: UIState;
}

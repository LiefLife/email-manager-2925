/**
 * Tauri命令封装模块
 * 提供类型安全的Tauri IPC命令调用接口
 */

import { invoke } from '@tauri-apps/api/core';
import type { LoginCredentials, AuthSession } from '../types/auth.types';
import type { Email } from '../types/email.types';
import type { SubEmail } from '../types/subEmail.types';
import type { UserPreferences } from '../types/preferences.types';
import type { ErrorLogEntry } from '../utils/errorHandler';

/**
 * Tauri命令错误类
 * 用于封装Tauri命令调用过程中的错误
 */
export class TauriCommandError extends Error {
  constructor(
    message: string,
    public readonly command: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'TauriCommandError';
  }
}

/**
 * 认证相关的Tauri命令
 */
export const authCommands = {
  /**
   * 登录命令
   * @param credentials 登录凭据
   * @returns 认证会话信息
   * @throws {TauriCommandError} 当登录失败时抛出
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const session = await invoke<AuthSession>('login', {
        email: credentials.email,
        password: credentials.password,
      });
      return session;
    } catch (error) {
      throw new TauriCommandError(
        '登录失败',
        'login',
        error
      );
    }
  },

  /**
   * 登出命令
   * @throws {TauriCommandError} 当登出失败时抛出
   */
  async logout(): Promise<void> {
    try {
      await invoke<void>('logout');
    } catch (error) {
      throw new TauriCommandError(
        '登出失败',
        'logout',
        error
      );
    }
  },
};

/**
 * 邮件相关的Tauri命令
 */
export const emailCommands = {
  /**
   * 获取邮件列表命令
   * @returns 邮件数组
   * @throws {TauriCommandError} 当获取邮件失败时抛出
   */
  async fetchEmails(): Promise<Email[]> {
    try {
      const emails = await invoke<Email[]>('fetch_emails');
      return emails;
    } catch (error) {
      throw new TauriCommandError(
        '获取邮件失败',
        'fetch_emails',
        error
      );
    }
  },

  /**
   * 发送邮件命令
   * @param to 收件人地址
   * @param subject 邮件主题
   * @param body 邮件正文
   * @throws {TauriCommandError} 当发送邮件失败时抛出
   */
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await invoke<void>('send_email', {
        to,
        subject,
        body,
      });
    } catch (error) {
      throw new TauriCommandError(
        '发送邮件失败',
        'send_email',
        error
      );
    }
  },
};

/**
 * 存储相关的Tauri命令
 */
export const storageCommands = {
  /**
   * 保存会话信息到本地存储
   * @param session 认证会话信息
   * @throws {TauriCommandError} 当保存失败时抛出
   */
  async saveSession(session: AuthSession): Promise<void> {
    try {
      await invoke<void>('save_session', { session });
    } catch (error) {
      throw new TauriCommandError(
        '保存会话失败',
        'save_session',
        error
      );
    }
  },

  /**
   * 保存密码到本地存储（使用三层加密）
   * @param password 密码
   * @throws {TauriCommandError} 当保存失败时抛出
   */
  async savePassword(password: string): Promise<void> {
    try {
      await invoke<void>('save_password', { password });
    } catch (error) {
      throw new TauriCommandError(
        '保存密码失败',
        'save_password',
        error
      );
    }
  },

  /**
   * 从本地存储加载会话信息
   * @returns 会话信息，如果不存在则返回null
   * @throws {TauriCommandError} 当加载失败时抛出
   */
  async loadSession(): Promise<AuthSession | null> {
    try {
      const session = await invoke<AuthSession | null>('load_session');
      return session;
    } catch (error) {
      throw new TauriCommandError(
        '加载会话失败',
        'load_session',
        error
      );
    }
  },

  /**
   * 从本地存储加载密码（使用三层解密）
   * @returns 密码，如果不存在则返回null
   * @throws {TauriCommandError} 当加载失败时抛出
   */
  async loadPassword(): Promise<string | null> {
    try {
      const password = await invoke<string | null>('load_password');
      return password;
    } catch (error) {
      throw new TauriCommandError(
        '加载密码失败',
        'load_password',
        error
      );
    }
  },

  /**
   * 保存子邮箱列表到本地存储
   * @param subEmails 子邮箱数组
   * @throws {TauriCommandError} 当保存失败时抛出
   */
  async saveSubEmails(subEmails: SubEmail[]): Promise<void> {
    try {
      await invoke<void>('save_sub_emails', { subEmails });
    } catch (error) {
      throw new TauriCommandError(
        '保存子邮箱列表失败',
        'save_sub_emails',
        error
      );
    }
  },

  /**
   * 从本地存储加载子邮箱列表
   * @returns 子邮箱数组
   * @throws {TauriCommandError} 当加载失败时抛出
   */
  async loadSubEmails(): Promise<SubEmail[]> {
    try {
      const subEmails = await invoke<SubEmail[]>('load_sub_emails');
      return subEmails;
    } catch (error) {
      throw new TauriCommandError(
        '加载子邮箱列表失败',
        'load_sub_emails',
        error
      );
    }
  },

  /**
   * 保存用户偏好设置到本地存储
   * @param preferences 用户偏好设置
   * @throws {TauriCommandError} 当保存失败时抛出
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await invoke<void>('save_preferences', { preferences });
    } catch (error) {
      throw new TauriCommandError(
        '保存用户偏好设置失败',
        'save_preferences',
        error
      );
    }
  },

  /**
   * 从本地存储加载用户偏好设置
   * @returns 用户偏好设置，如果不存在则返回null
   * @throws {TauriCommandError} 当加载失败时抛出
   */
  async loadPreferences(): Promise<UserPreferences | null> {
    try {
      const preferences = await invoke<UserPreferences | null>('load_preferences');
      return preferences;
    } catch (error) {
      throw new TauriCommandError(
        '加载用户偏好设置失败',
        'load_preferences',
        error
      );
    }
  },
};

/**
 * 日志相关的Tauri命令
 */
export const logCommands = {
  /**
   * 记录错误到本地日志文件
   * @param entry 错误日志条目
   * @throws {TauriCommandError} 当记录失败时抛出
   */
  async logError(entry: ErrorLogEntry): Promise<void> {
    try {
      await invoke<void>('log_error', { entry });
    } catch (error) {
      throw new TauriCommandError(
        '记录错误日志失败',
        'log_error',
        error
      );
    }
  },
};

/**
 * 统一导出所有Tauri命令
 */
export const tauriCommands = {
  auth: authCommands,
  email: emailCommands,
  storage: storageCommands,
  log: logCommands,
};

export default tauriCommands;

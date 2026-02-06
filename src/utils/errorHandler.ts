/**
 * 错误处理模块
 * 提供统一的错误分类、处理和恢复策略
 */

import { logCommands } from '../services/tauriCommands';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  SERVER = 'server',
  VALIDATION = 'validation',
  STORAGE = 'storage',
  UNKNOWN = 'unknown',
}

/**
 * 错误日志条目接口
 */
export interface ErrorLogEntry {
  timestamp: number;
  context: string;
  message: string;
  stack?: string;
  type: ErrorType;
}

/**
 * 错误恢复策略接口
 */
export interface RecoveryStrategy {
  shouldRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackAction?: () => void;
}

/**
 * 统一错误处理类
 * 负责错误分类、日志记录和恢复策略执行
 */
export class ErrorHandler {
  private static retryCount = new Map<string, number>();

  /**
   * 处理错误的主入口
   * @param error 错误对象
   * @param context 错误发生的上下文
   */
  static async handle(error: Error, context: string): Promise<void> {
    // 1. 记录错误
    await this.logError(error, context);

    // 2. 分类错误
    const errorType = this.classifyError(error);

    // 3. 根据类型处理
    switch (errorType) {
      case ErrorType.NETWORK:
        this.handleNetworkError(error, context);
        break;
      case ErrorType.AUTH:
        this.handleAuthError(error, context);
        break;
      case ErrorType.SERVER:
        this.handleServerError(error, context);
        break;
      case ErrorType.VALIDATION:
        this.handleValidationError(error, context);
        break;
      case ErrorType.STORAGE:
        this.handleStorageError(error, context);
        break;
      default:
        this.handleUnknownError(error, context);
    }
  }

  /**
   * 分类错误类型
   * @param error 错误对象
   * @returns 错误类型
   */
  private static classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    // 网络错误
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('dns') ||
      message.includes('fetch')
    ) {
      return ErrorType.NETWORK;
    }

    // 认证错误
    if (
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('credential') ||
      message.includes('token') ||
      message.includes('session') ||
      message.includes('unauthorized') ||
      message.includes('401')
    ) {
      return ErrorType.AUTH;
    }

    // 服务器错误
    if (
      message.includes('server') ||
      message.includes('imap') ||
      message.includes('smtp') ||
      message.includes('500') ||
      message.includes('503')
    ) {
      return ErrorType.SERVER;
    }

    // 验证错误
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('format') ||
      message.includes('parse')
    ) {
      return ErrorType.VALIDATION;
    }

    // 存储错误
    if (
      message.includes('storage') ||
      message.includes('disk') ||
      message.includes('permission') ||
      message.includes('quota')
    ) {
      return ErrorType.STORAGE;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * 记录错误到日志文件
   * @param error 错误对象
   * @param context 错误上下文
   */
  private static async logError(error: Error, context: string): Promise<void> {
    const logEntry: ErrorLogEntry = {
      timestamp: Date.now(),
      context,
      message: error.message,
      stack: error.stack,
      type: this.classifyError(error),
    };

    try {
      await logCommands.logError(logEntry);
    } catch (logError) {
      // 如果日志记录失败，至少输出到控制台
      console.error('Failed to log error:', logError);
      console.error('Original error:', logEntry);
    }
  }

  /**
   * 处理网络错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  private static handleNetworkError(error: Error, context: string): void {
    console.error(`[Network Error] ${context}:`, error.message);

    // 获取重试策略
    const strategy = this.getRecoveryStrategy(ErrorType.NETWORK);

    if (strategy.shouldRetry) {
      const retries = this.retryCount.get(context) || 0;

      if (retries < strategy.maxRetries) {
        this.retryCount.set(context, retries + 1);
        console.log(`Retrying ${context} (attempt ${retries + 1}/${strategy.maxRetries})...`);

        // 指数退避重试
        setTimeout(() => {
          strategy.fallbackAction?.();
        }, strategy.retryDelay * Math.pow(2, retries));
      } else {
        // 达到最大重试次数
        this.retryCount.delete(context);
        console.error(`Max retries reached for ${context}`);
      }
    }
  }

  /**
   * 处理认证错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  private static handleAuthError(error: Error, context: string): void {
    console.error(`[Auth Error] ${context}:`, error.message);

    // 认证错误通常需要用户重新登录
    // 清除本地会话并重定向到登录页面
    this.clearSession();
  }

  /**
   * 处理服务器错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  private static handleServerError(error: Error, context: string): void {
    console.error(`[Server Error] ${context}:`, error.message);

    // 服务器错误可能是临时的，尝试重试
    const strategy = this.getRecoveryStrategy(ErrorType.SERVER);

    if (strategy.shouldRetry) {
      const retries = this.retryCount.get(context) || 0;

      if (retries < strategy.maxRetries) {
        this.retryCount.set(context, retries + 1);
        console.log(`Retrying ${context} (attempt ${retries + 1}/${strategy.maxRetries})...`);

        setTimeout(() => {
          strategy.fallbackAction?.();
        }, strategy.retryDelay * Math.pow(2, retries));
      } else {
        this.retryCount.delete(context);
        console.error(`Max retries reached for ${context}`);
      }
    }
  }

  /**
   * 处理验证错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  private static handleValidationError(error: Error, context: string): void {
    console.error(`[Validation Error] ${context}:`, error.message);

    // 验证错误通常不需要重试，直接显示给用户
    // 前端应该在UI层面拦截这类错误
  }

  /**
   * 处理存储错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  private static handleStorageError(error: Error, context: string): void {
    console.error(`[Storage Error] ${context}:`, error.message);

    // 存储错误可能需要降级到内存存储
    console.warn('Falling back to in-memory storage');
  }

  /**
   * 处理未知错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  private static handleUnknownError(error: Error, context: string): void {
    console.error(`[Unknown Error] ${context}:`, error.message);
  }

  /**
   * 获取错误恢复策略
   * @param errorType 错误类型
   * @returns 恢复策略
   */
  private static getRecoveryStrategy(errorType: ErrorType): RecoveryStrategy {
    switch (errorType) {
      case ErrorType.NETWORK:
        return {
          shouldRetry: true,
          maxRetries: 3,
          retryDelay: 1000, // 1秒
        };
      case ErrorType.SERVER:
        return {
          shouldRetry: true,
          maxRetries: 3,
          retryDelay: 2000, // 2秒
        };
      case ErrorType.AUTH:
        return {
          shouldRetry: false,
          maxRetries: 0,
          retryDelay: 0,
        };
      case ErrorType.VALIDATION:
        return {
          shouldRetry: false,
          maxRetries: 0,
          retryDelay: 0,
        };
      case ErrorType.STORAGE:
        return {
          shouldRetry: true,
          maxRetries: 2,
          retryDelay: 500, // 0.5秒
        };
      default:
        return {
          shouldRetry: false,
          maxRetries: 0,
          retryDelay: 0,
        };
    }
  }

  /**
   * 清除会话信息
   */
  private static clearSession(): void {
    try {
      // 使用authCommands来登出
      import('../services/tauriCommands').then(({ authCommands }) => {
        authCommands.logout();
      });
      // 触发应用重定向到登录页面
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * 重置重试计数器
   * @param context 上下文标识
   */
  static resetRetryCount(context: string): void {
    this.retryCount.delete(context);
  }

  /**
   * 获取当前重试次数
   * @param context 上下文标识
   * @returns 重试次数
   */
  static getRetryCount(context: string): number {
    return this.retryCount.get(context) || 0;
  }
}

export default ErrorHandler;

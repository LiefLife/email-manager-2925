/**
 * 邮件上下文模块
 * 提供全局邮件状态管理和邮件操作接口
 */

import React, { createContext, useCallback, useState } from 'react';
import type { Email } from '../types/email.types';
import type { EmailsState } from '../types/app.types';
import { tauriCommands } from '../services/tauriCommands';
import { identifyForwardedEmails } from '../utils/emailForwardIdentifier';

/**
 * 邮件上下文值接口
 * 定义EmailContext提供的所有方法和状态
 */
interface EmailContextValue extends EmailsState {
  /**
   * 获取邮件列表
   * @param mainEmail 主邮箱地址（用于识别子邮箱格式）
   * @throws 当获取邮件失败时抛出错误
   */
  fetchEmails: (mainEmail?: string) => Promise<void>;
  
  /**
   * 标记邮件为已读
   * @param emailId 邮件ID
   */
  markAsRead: (emailId: string) => Promise<void>;
  
  /**
   * 设置邮件列表（用于外部更新）
   * @param emails 邮件数组
   */
  setEmails: (emails: Email[]) => void;
  
  /**
   * 刷新邮件并识别转发
   * @param mainEmail 主邮箱地址
   */
  refreshWithMainEmail: (mainEmail: string) => Promise<void>;
}

/**
 * 邮件上下文
 * 用于在组件树中共享邮件状态
 */
export const EmailContext = createContext<EmailContextValue | undefined>(undefined);

/**
 * 邮件上下文提供者属性接口
 */
interface EmailProviderProps {
  children: React.ReactNode;
}

/**
 * 邮件上下文提供者组件
 * 管理邮件状态并提供邮件操作方法
 */
export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  // 邮件状态
  const [emailState, setEmailState] = useState<EmailsState>({
    list: [],
    loading: false,
    lastFetchTime: 0,
    error: null,
  });

  /**
   * 获取邮件列表
   * @param mainEmail 主邮箱地址（用于识别子邮箱格式）
   */
  const fetchEmails = useCallback(async (mainEmail?: string): Promise<void> => {
    try {
      // 设置加载状态
      setEmailState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // 调用Tauri命令获取邮件
      let emails = await tauriCommands.email.fetchEmails();

      // 如果提供了主邮箱地址，识别转发邮件
      if (mainEmail) {
        emails = identifyForwardedEmails(emails, mainEmail);
      }

      // 按时间戳降序排序（最新的在前）
      emails.sort((a, b) => b.timestamp - a.timestamp);

      // 保留本地已读状态
      setEmailState(prev => {
        // 创建一个已读邮件ID的Set
        const readEmailIds = new Set(
          prev.list.filter(email => email.isRead).map(email => email.id)
        );
        
        // 合并服务器数据和本地已读状态
        const mergedEmails = emails.map(email => ({
          ...email,
          isRead: readEmailIds.has(email.id) ? true : email.isRead,
        }));
        
        return {
          list: mergedEmails,
          loading: false,
          lastFetchTime: Date.now(),
          error: null,
        };
      });
    } catch (error) {
      // 获取邮件失败，更新错误状态
      const errorMessage = error instanceof Error ? error.message : '获取邮件失败';
      setEmailState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * 标记邮件为已读
   * @param emailId 邮件ID
   */
  const markAsRead = useCallback(async (emailId: string): Promise<void> => {
    try {
      // 在本地状态中立即更新（乐观更新）
      setEmailState(prev => ({
        ...prev,
        list: prev.list.map(email =>
          email.id === emailId ? { ...email, isRead: true } : email
        ),
      }));

      // TODO: 调用Tauri命令标记邮件为已读
      // 注意：当前tauriCommands中没有markAsRead命令
      // 这里仅做本地状态更新
      // await tauriCommands.email.markAsRead(emailId);
    } catch (error) {
      console.error('标记邮件为已读失败:', error);
      // 如果失败，可以考虑回滚状态
    }
  }, []);

  /**
   * 设置邮件列表
   * @param emails 邮件数组
   */
  const setEmails = useCallback((emails: Email[]): void => {
    setEmailState(prev => ({
      ...prev,
      list: emails,
      lastFetchTime: Date.now(),
    }));
  }, []);

  /**
   * 刷新邮件并识别转发
   * @param mainEmail 主邮箱地址
   */
  const refreshWithMainEmail = useCallback(async (mainEmail: string): Promise<void> => {
    await fetchEmails(mainEmail);
  }, [fetchEmails]);

  // 上下文值 - 使用useMemo避免不必要的重渲染
  const contextValue: EmailContextValue = React.useMemo(() => ({
    ...emailState,
    fetchEmails,
    markAsRead,
    setEmails,
    refreshWithMainEmail,
  }), [emailState, fetchEmails, markAsRead, setEmails, refreshWithMainEmail]);

  return (
    <EmailContext.Provider value={contextValue}>
      {children}
    </EmailContext.Provider>
  );
};

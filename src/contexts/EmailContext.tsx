/**
 * 邮件上下文模块
 * 提供全局邮件状态管理和邮件操作接口
 */

import React, { createContext, useCallback, useState } from 'react';
import type { Email } from '../types/email.types';
import type { EmailsState } from '../types/app.types';
import type { SubEmail } from '../types/subEmail.types';
import { tauriCommands } from '../services/tauriCommands';
import { identifyForwardedEmails } from '../utils/emailForwardIdentifier';

/**
 * 邮件上下文值接口
 * 定义EmailContext提供的所有方法和状态
 */
interface EmailContextValue extends EmailsState {
  /**
   * 获取邮件列表
   * @param subEmails 子邮箱列表（用于识别转发邮件）
   * @throws 当获取邮件失败时抛出错误
   */
  fetchEmails: (subEmails?: SubEmail[]) => Promise<void>;
  
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
   * @param subEmails 子邮箱列表
   */
  refreshWithSubEmails: (subEmails: SubEmail[]) => Promise<void>;
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
   * @param subEmails 子邮箱列表（用于识别转发邮件）
   */
  const fetchEmails = useCallback(async (subEmails?: SubEmail[]): Promise<void> => {
    try {
      // 设置加载状态
      setEmailState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // 调用Tauri命令获取邮件
      let emails = await tauriCommands.email.fetchEmails();

      // 如果提供了子邮箱列表，识别转发邮件
      if (subEmails && subEmails.length > 0) {
        emails = identifyForwardedEmails(emails, subEmails);
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
   * @param subEmails 子邮箱列表
   */
  const refreshWithSubEmails = useCallback(async (subEmails: SubEmail[]): Promise<void> => {
    await fetchEmails(subEmails);
  }, [fetchEmails]);

  // 上下文值
  const contextValue: EmailContextValue = {
    ...emailState,
    fetchEmails,
    markAsRead,
    setEmails,
    refreshWithSubEmails,
  };

  return (
    <EmailContext.Provider value={contextValue}>
      {children}
    </EmailContext.Provider>
  );
};

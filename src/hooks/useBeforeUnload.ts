/**
 * 应用关闭前处理Hook
 * 在应用关闭前保存所有数据
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSubEmail } from './useSubEmail';
import { useAppLifecycle } from './useAppLifecycle';
import { tauriCommands } from '../services/tauriCommands';

/**
 * 应用关闭前处理Hook
 * 
 * 功能：
 * - 监听窗口关闭事件
 * - 保存会话数据
 * - 保存子邮箱列表
 * - 保存用户偏好设置
 * 
 * 注意：此Hook应在应用根组件中使用
 */
export function useBeforeUnload(): void {
  const { session } = useAuth();
  const { list: subEmails } = useSubEmail();
  const { preferences } = useAppLifecycle();

  /**
   * 保存所有应用数据
   */
  const saveAllData = useCallback(async (): Promise<void> => {
    try {
      // 保存会话数据
      if (session) {
        await tauriCommands.storage.saveSession(session);
      }

      // 保存子邮箱列表
      await tauriCommands.storage.saveSubEmails(subEmails);

      // 保存用户偏好设置
      await tauriCommands.storage.savePreferences(preferences);

      console.log('应用数据保存成功');
    } catch (error) {
      console.error('保存应用数据失败:', error);
      // 即使保存失败，也不阻止应用关闭
    }
  }, [session, subEmails, preferences]);

  /**
   * 监听窗口关闭事件
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 保存数据（同步操作）
      // 注意：在beforeunload中异步操作可能不会完成
      // 因此我们在其他地方也会定期保存数据
      saveAllData();
      
      // 不显示确认对话框
      // 如果需要确认，可以设置 event.returnValue
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveAllData]);

  /**
   * 定期保存数据（每30秒）
   * 确保数据不会因为意外关闭而丢失
   */
  useEffect(() => {
    const interval = setInterval(() => {
      saveAllData();
    }, 30000); // 30秒

    return () => clearInterval(interval);
  }, [saveAllData]);
}

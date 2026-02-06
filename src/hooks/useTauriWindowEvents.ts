/**
 * Tauri窗口事件监听Hook
 * 处理Tauri特定的窗口事件
 */

import { useEffect, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useAuth } from './useAuth';
import { useSubEmail } from './useSubEmail';
import { useAppLifecycle } from './useAppLifecycle';
import { tauriCommands } from '../services/tauriCommands';

/**
 * Tauri窗口事件监听Hook
 * 
 * 功能：
 * - 监听窗口关闭请求事件
 * - 在窗口关闭前保存所有数据
 * - 确保数据持久化
 */
export function useTauriWindowEvents(): void {
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
    }
  }, [session, subEmails, preferences]);

  /**
   * 监听Tauri窗口关闭请求事件
   */
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const appWindow = getCurrentWindow();
        
        // 监听窗口关闭请求
        unlisten = await appWindow.onCloseRequested(async (event) => {
          console.log('窗口关闭请求，保存数据...');
          
          // 阻止默认关闭行为
          event.preventDefault();
          
          // 保存所有数据
          await saveAllData();
          
          // 数据保存完成后，允许窗口关闭
          await appWindow.close();
        });
      } catch (error) {
        console.error('设置窗口事件监听失败:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [saveAllData]);
}

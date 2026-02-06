/**
 * 系统托盘控制Hook
 * 提供系统托盘相关的操作接口
 */

import { useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

/**
 * 系统托盘Hook返回值接口
 */
interface UseSystemTrayReturn {
  /**
   * 显示应用窗口
   */
  showWindow: () => Promise<void>;
  
  /**
   * 隐藏应用窗口
   */
  hideWindow: () => Promise<void>;
  
  /**
   * 切换窗口显示/隐藏状态
   */
  toggleWindow: () => Promise<void>;
  
  /**
   * 退出应用
   */
  quitApp: () => Promise<void>;
}

/**
 * 系统托盘控制Hook
 * 
 * 功能：
 * - 显示/隐藏窗口
 * - 切换窗口状态
 * - 退出应用
 * 
 * 注意：系统托盘图标和菜单在Rust后端配置
 * 
 * @returns 系统托盘操作方法
 */
export function useSystemTray(): UseSystemTrayReturn {
  /**
   * 显示应用窗口
   */
  const showWindow = useCallback(async (): Promise<void> => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.show();
      await appWindow.setFocus();
    } catch (error) {
      console.error('显示窗口失败:', error);
    }
  }, []);

  /**
   * 隐藏应用窗口
   */
  const hideWindow = useCallback(async (): Promise<void> => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.hide();
    } catch (error) {
      console.error('隐藏窗口失败:', error);
    }
  }, []);

  /**
   * 切换窗口显示/隐藏状态
   */
  const toggleWindow = useCallback(async (): Promise<void> => {
    try {
      const appWindow = getCurrentWindow();
      const isVisible = await appWindow.isVisible();
      
      if (isVisible) {
        await appWindow.hide();
      } else {
        await appWindow.show();
        await appWindow.setFocus();
      }
    } catch (error) {
      console.error('切换窗口状态失败:', error);
    }
  }, []);

  /**
   * 退出应用
   */
  const quitApp = useCallback(async (): Promise<void> => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (error) {
      console.error('退出应用失败:', error);
    }
  }, []);

  return {
    showWindow,
    hideWindow,
    toggleWindow,
    quitApp,
  };
}

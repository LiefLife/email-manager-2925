/**
 * 窗口管理Hook
 * 提供窗口操作的React Hook封装
 */

import { useState, useEffect, useCallback } from 'react';
import { WindowManager, WindowSize } from '../utils/windowManager';

/**
 * 窗口管理Hook返回值接口
 */
export interface UseWindowManagerReturn {
  windowSize: WindowSize | null;
  isMaximized: boolean;
  isVisible: boolean;
  setSize: (width: number, height: number) => Promise<void>;
  center: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  unmaximize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  show: () => Promise<void>;
  hide: () => Promise<void>;
  setTitle: (title: string) => Promise<void>;
  refreshState: () => Promise<void>;
}

/**
 * 窗口管理Hook
 * 
 * 功能：
 * - 提供窗口尺寸状态
 * - 提供窗口最大化状态
 * - 提供窗口可见性状态
 * - 提供窗口操作方法
 * 
 * @returns 窗口管理接口
 */
export function useWindowManager(): UseWindowManagerReturn {
  const [windowSize, setWindowSize] = useState<WindowSize | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  /**
   * 刷新窗口状态
   */
  const refreshState = useCallback(async () => {
    try {
      const [size, maximized, visible] = await Promise.all([
        WindowManager.getSize(),
        WindowManager.isMaximized(),
        WindowManager.isVisible(),
      ]);

      setWindowSize(size);
      setIsMaximized(maximized);
      setIsVisible(visible);
    } catch (error) {
      console.error('刷新窗口状态失败:', error);
    }
  }, []);

  /**
   * 设置窗口大小
   */
  const setSize = useCallback(async (width: number, height: number) => {
    await WindowManager.setSize(width, height);
    await refreshState();
  }, [refreshState]);

  /**
   * 居中窗口
   */
  const center = useCallback(async () => {
    await WindowManager.center();
    await refreshState();
  }, [refreshState]);

  /**
   * 最小化窗口
   */
  const minimize = useCallback(async () => {
    await WindowManager.minimize();
    await refreshState();
  }, [refreshState]);

  /**
   * 最大化窗口
   */
  const maximize = useCallback(async () => {
    await WindowManager.maximize();
    await refreshState();
  }, [refreshState]);

  /**
   * 取消最大化窗口
   */
  const unmaximize = useCallback(async () => {
    await WindowManager.unmaximize();
    await refreshState();
  }, [refreshState]);

  /**
   * 切换最大化状态
   */
  const toggleMaximize = useCallback(async () => {
    await WindowManager.toggleMaximize();
    await refreshState();
  }, [refreshState]);

  /**
   * 显示窗口
   */
  const show = useCallback(async () => {
    await WindowManager.show();
    await refreshState();
  }, [refreshState]);

  /**
   * 隐藏窗口
   */
  const hide = useCallback(async () => {
    await WindowManager.hide();
    await refreshState();
  }, [refreshState]);

  /**
   * 设置窗口标题
   */
  const setTitle = useCallback(async (title: string) => {
    await WindowManager.setTitle(title);
  }, []);

  /**
   * 初始化窗口状态
   */
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  return {
    windowSize,
    isMaximized,
    isVisible,
    setSize,
    center,
    minimize,
    maximize,
    unmaximize,
    toggleMaximize,
    show,
    hide,
    setTitle,
    refreshState,
  };
}

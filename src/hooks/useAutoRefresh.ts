/**
 * 自动刷新Hook
 * 提供定时自动刷新邮件的功能
 */

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 自动刷新Hook配置接口
 */
interface UseAutoRefreshOptions {
  /**
   * 刷新间隔（毫秒）
   * @default 5000
   */
  interval?: number;
  
  /**
   * 是否在挂载时立即执行一次
   * @default true
   */
  immediate?: boolean;
  
  /**
   * 是否启用自动刷新
   * @default true
   */
  enabled?: boolean;
}

/**
 * 自动刷新Hook返回值接口
 */
interface UseAutoRefreshReturn {
  /**
   * 是否正在刷新
   */
  isRefreshing: boolean;
  
  /**
   * 是否激活自动刷新
   */
  isActive: boolean;
  
  /**
   * 启用自动刷新
   */
  enable: () => void;
  
  /**
   * 禁用自动刷新
   */
  disable: () => void;
  
  /**
   * 切换自动刷新状态
   */
  toggle: () => void;
  
  /**
   * 手动触发刷新
   */
  refresh: () => Promise<void>;
  
  /**
   * 最后一次刷新的错误
   */
  lastError: Error | null;
}

/**
 * 自动刷新Hook
 * 
 * @param refreshFn 刷新函数，返回Promise
 * @param options 配置选项
 * @returns 自动刷新控制接口
 * 
 * @example
 * ```tsx
 * const { isActive, enable, disable, refresh } = useAutoRefresh(
 *   async () => {
 *     await fetchEmails();
 *   },
 *   { interval: 5000 }
 * );
 * ```
 */
export function useAutoRefresh(
  refreshFn: () => Promise<void>,
  options: UseAutoRefreshOptions = {}
): UseAutoRefreshReturn {
  const {
    interval = 5000,
    immediate = true,
    enabled = true,
  } = options;

  // 状态管理
  const [isActive, setIsActive] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  // 使用ref存储定时器ID和刷新函数，避免闭包问题
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshFnRef = useRef(refreshFn);

  // 更新刷新函数引用
  useEffect(() => {
    refreshFnRef.current = refreshFn;
  }, [refreshFn]);

  /**
   * 执行刷新操作
   */
  const refresh = useCallback(async (): Promise<void> => {
    // 如果正在刷新，跳过本次
    if (isRefreshing) {
      return;
    }

    try {
      setIsRefreshing(true);
      setLastError(null);
      await refreshFnRef.current();
    } catch (error) {
      // 刷新失败，记录错误但不中断定时器
      const err = error instanceof Error ? error : new Error('刷新失败');
      setLastError(err);
      console.error('自动刷新失败:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  /**
   * 启用自动刷新
   */
  const enable = useCallback(() => {
    setIsActive(true);
  }, []);

  /**
   * 禁用自动刷新
   */
  const disable = useCallback(() => {
    setIsActive(false);
  }, []);

  /**
   * 切换自动刷新状态
   */
  const toggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  /**
   * 设置定时器
   */
  useEffect(() => {
    // 如果未激活，清除定时器
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 如果需要立即执行
    if (immediate) {
      refresh();
    }

    // 设置定时器
    timerRef.current = setInterval(() => {
      refresh();
    }, interval);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, interval, immediate, refresh]);

  return {
    isRefreshing,
    isActive,
    enable,
    disable,
    toggle,
    refresh,
    lastError,
  };
}

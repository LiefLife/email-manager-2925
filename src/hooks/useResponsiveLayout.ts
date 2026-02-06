/**
 * 响应式布局Hook
 * 监听窗口大小变化并提供布局相关的状态和工具函数
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 布局断点定义
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1200,
} as const;

/**
 * 布局模式类型
 */
export type LayoutMode = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * 窗口尺寸接口
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * 响应式布局状态接口
 */
export interface ResponsiveLayoutState {
  windowSize: WindowSize;
  layoutMode: LayoutMode;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

/**
 * 根据窗口宽度确定布局模式
 */
function getLayoutMode(width: number): LayoutMode {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.desktop) return 'desktop';
  return 'wide';
}

/**
 * 响应式布局Hook
 * 
 * 功能：
 * - 监听窗口大小变化
 * - 提供当前窗口尺寸
 * - 提供当前布局模式（mobile/tablet/desktop/wide）
 * - 提供布局模式判断标志
 * 
 * @returns 响应式布局状态
 */
export function useResponsiveLayout(): ResponsiveLayoutState {
  // 初始化窗口尺寸
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  /**
   * 处理窗口大小变化
   */
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  /**
   * 监听窗口resize事件
   */
  useEffect(() => {
    // 添加resize事件监听
    window.addEventListener('resize', handleResize);

    // 初始化时触发一次
    handleResize();

    // 清理监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 计算布局模式
  const layoutMode = getLayoutMode(windowSize.width);

  // 返回响应式布局状态
  return {
    windowSize,
    layoutMode,
    isMobile: layoutMode === 'mobile',
    isTablet: layoutMode === 'tablet',
    isDesktop: layoutMode === 'desktop',
    isWide: layoutMode === 'wide',
  };
}

/**
 * 用户偏好设置类型定义
 */

/**
 * 窗口尺寸配置
 */
export interface WindowSize {
  /** 窗口宽度 */
  width: number;
  /** 窗口高度 */
  height: number;
}

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  /** 自动刷新间隔（毫秒） */
  autoRefreshInterval: number;
  /** UI主题 */
  theme: 'glass';
  /** 窗口尺寸 */
  windowSize: WindowSize;
  /** 是否启用自动登录 */
  autoLogin: boolean;
}

/**
 * 默认用户偏好设置
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  autoRefreshInterval: 5000,
  theme: 'glass',
  windowSize: {
    width: 1200,
    height: 800,
  },
  autoLogin: true,
};

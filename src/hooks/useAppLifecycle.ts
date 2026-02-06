/**
 * 应用生命周期管理Hook
 * 处理应用启动、关闭和状态保存
 */

import { useEffect, useCallback, useState } from 'react';
import { tauriCommands } from '../services/tauriCommands';
import type { UserPreferences } from '../types/preferences.types';
import { DEFAULT_PREFERENCES } from '../types/preferences.types';

/**
 * 应用生命周期状态接口
 */
interface AppLifecycleState {
  /** 应用是否已初始化 */
  initialized: boolean;
  /** 用户偏好设置 */
  preferences: UserPreferences;
  /** 初始化错误信息 */
  error: string | null;
}

/**
 * 应用生命周期Hook返回值接口
 */
interface UseAppLifecycleReturn extends AppLifecycleState {
  /**
   * 更新用户偏好设置
   * @param updates 要更新的偏好设置字段
   */
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  
  /**
   * 保存应用状态（会话、子邮箱、偏好设置）
   */
  saveAppState: () => Promise<void>;
}

/**
 * 应用生命周期管理Hook
 * 
 * 功能：
 * - 应用启动时加载用户偏好设置
 * - 提供更新偏好设置的方法
 * - 提供保存应用状态的方法
 * 
 * @returns 应用生命周期状态和操作方法
 */
export function useAppLifecycle(): UseAppLifecycleReturn {
  const [state, setState] = useState<AppLifecycleState>({
    initialized: false,
    preferences: DEFAULT_PREFERENCES,
    error: null,
  });

  /**
   * 加载用户偏好设置
   */
  const loadPreferences = useCallback(async (): Promise<void> => {
    try {
      const storedPreferences = await tauriCommands.storage.loadPreferences();
      
      if (storedPreferences) {
        setState(prev => ({
          ...prev,
          preferences: storedPreferences,
          initialized: true,
          error: null,
        }));
      } else {
        // 没有存储的偏好设置，使用默认值并保存
        await tauriCommands.storage.savePreferences(DEFAULT_PREFERENCES);
        setState(prev => ({
          ...prev,
          preferences: DEFAULT_PREFERENCES,
          initialized: true,
          error: null,
        }));
      }
    } catch (error) {
      console.error('加载用户偏好设置失败:', error);
      setState(prev => ({
        ...prev,
        preferences: DEFAULT_PREFERENCES,
        initialized: true,
        error: '加载用户偏好设置失败',
      }));
    }
  }, []);

  /**
   * 更新用户偏好设置
   * @param updates 要更新的偏好设置字段
   */
  const updatePreferences = useCallback(async (
    updates: Partial<UserPreferences>
  ): Promise<void> => {
    try {
      const newPreferences: UserPreferences = {
        ...state.preferences,
        ...updates,
      };
      
      // 保存到本地存储
      await tauriCommands.storage.savePreferences(newPreferences);
      
      // 更新状态
      setState(prev => ({
        ...prev,
        preferences: newPreferences,
        error: null,
      }));
    } catch (error) {
      console.error('更新用户偏好设置失败:', error);
      setState(prev => ({
        ...prev,
        error: '更新用户偏好设置失败',
      }));
      throw error;
    }
  }, [state.preferences]);

  /**
   * 保存应用状态
   * 注意：会话和子邮箱由各自的Context管理，这里只保存偏好设置
   */
  const saveAppState = useCallback(async (): Promise<void> => {
    try {
      await tauriCommands.storage.savePreferences(state.preferences);
    } catch (error) {
      console.error('保存应用状态失败:', error);
      throw error;
    }
  }, [state.preferences]);

  /**
   * 应用启动时加载偏好设置
   */
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    ...state,
    updatePreferences,
    saveAppState,
  };
}

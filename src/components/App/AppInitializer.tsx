/**
 * 应用初始化组件
 * 处理应用启动逻辑：检查会话、自动登录、加载偏好设置
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppLifecycle } from '../../hooks/useAppLifecycle';
import LoadingSpinner from '../Common/LoadingSpinner';

/**
 * 应用初始化组件属性接口
 */
interface AppInitializerProps {
  /** 初始化完成后渲染的子组件 */
  children: React.ReactNode;
  /** 初始化完成回调 */
  onInitialized?: () => void;
}

/**
 * 应用初始化组件
 * 
 * 功能：
 * - 检查存储的会话
 * - 自动登录或显示登录界面
 * - 加载用户偏好设置
 * - 显示加载状态
 * 
 * @param props 组件属性
 * @returns 初始化组件或子组件
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({
  children,
  onInitialized,
}) => {
  const { isAuthenticated, loading: authLoading, validateSession } = useAuth();
  const { initialized: preferencesInitialized, preferences } = useAppLifecycle();
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * 应用启动初始化逻辑
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // 等待偏好设置加载完成
        if (!preferencesInitialized) {
          return;
        }

        // 等待认证状态加载完成
        if (authLoading) {
          return;
        }

        // 如果启用了自动登录且有会话，验证会话
        if (preferences.autoLogin && isAuthenticated) {
          await validateSession();
        }

        // 初始化完成
        setIsInitializing(false);
        
        // 调用初始化完成回调
        if (onInitialized) {
          onInitialized();
        }
      } catch (error) {
        console.error('应用初始化失败:', error);
        // 即使初始化失败，也继续加载应用
        setIsInitializing(false);
      }
    };

    initialize();
  }, [
    preferencesInitialized,
    authLoading,
    isAuthenticated,
    preferences.autoLogin,
    validateSession,
    onInitialized,
  ]);

  // 显示加载状态
  if (isInitializing || authLoading || !preferencesInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  // 初始化完成，渲染子组件
  return <>{children}</>;
};

/**
 * 认证上下文模块
 * 提供全局认证状态管理和认证操作接口
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { LoginCredentials, AuthSession } from '../types/auth.types';
import type { AuthState } from '../types/app.types';
import { tauriCommands } from '../services/tauriCommands';

/**
 * 认证上下文值接口
 * 定义AuthContext提供的所有方法和状态
 */
interface AuthContextValue extends AuthState {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @param autoLogin 是否自动登录
   * @throws 当登录失败时抛出错误
   */
  login: (credentials: LoginCredentials, autoLogin?: boolean) => Promise<void>;
  
  /**
   * 用户登出
   */
  logout: () => Promise<void>;
  
  /**
   * 验证当前会话是否有效
   * @returns 会话是否有效
   */
  validateSession: () => Promise<boolean>;
}

/**
 * 认证上下文
 * 用于在组件树中共享认证状态
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 认证上下文提供者属性接口
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 认证上下文提供者组件
 * 管理认证状态并提供认证操作方法
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 认证状态
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    session: null,
    loading: true,
    error: null,
  });

  /**
   * 验证会话是否过期
   * @param session 会话信息
   * @returns 会话是否有效
   */
  const isSessionValid = useCallback((session: AuthSession | null): boolean => {
    if (!session) return false;
    return Date.now() < session.expiresAt;
  }, []);

  /**
   * 验证当前会话
   * @returns 会话是否有效
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { session } = authState;
      
      if (!session) {
        return false;
      }

      // 检查会话是否过期
      const valid = isSessionValid(session);
      
      if (!valid) {
        // 会话过期，清除状态
        setAuthState({
          isAuthenticated: false,
          session: null,
          loading: false,
          error: '会话已过期，请重新登录',
        });
      }
      
      return valid;
    } catch (error) {
      console.error('验证会话失败:', error);
      return false;
    }
  }, [authState, isSessionValid]);

  /**
   * 用户登录
   * @param credentials 登录凭据
   * @param autoLogin 是否自动登录
   */
  const login = useCallback(async (credentials: LoginCredentials, autoLogin: boolean = false): Promise<void> => {
    try {
      // 设置加载状态
      setAuthState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // 调用Tauri登录命令
      const session = await tauriCommands.auth.login(credentials);

      // 保存会话到本地存储
      await tauriCommands.storage.saveSession(session);
      
      // 保存密码到本地存储（用于后续IMAP操作）
      await tauriCommands.storage.savePassword(credentials.password);
      
      // 保存自动登录偏好
      if (autoLogin) {
        try {
          await tauriCommands.storage.savePreferences({
            autoRefreshInterval: 5000,
            theme: 'glass',
            windowSize: { width: 1200, height: 800 },
            autoLogin: true,
          });
        } catch (error) {
          console.error('保存自动登录偏好失败:', error);
        }
      } else {
        try {
          await tauriCommands.storage.savePreferences({
            autoRefreshInterval: 5000,
            theme: 'glass',
            windowSize: { width: 1200, height: 800 },
            autoLogin: false,
          });
        } catch (error) {
          console.error('保存偏好失败:', error);
        }
      }

      // 更新认证状态
      setAuthState({
        isAuthenticated: true,
        session,
        loading: false,
        error: null,
      });
    } catch (error) {
      // 登录失败，更新错误状态
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      setAuthState({
        isAuthenticated: false,
        session: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  /**
   * 用户登出
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // 调用Tauri登出命令
      await tauriCommands.auth.logout();

      // 清除认证状态
      setAuthState({
        isAuthenticated: false,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('登出失败:', error);
      // 即使登出失败，也清除本地状态
      setAuthState({
        isAuthenticated: false,
        session: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  /**
   * 组件挂载时加载存储的会话
   */
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        // 从本地存储加载会话
        const storedSession = await tauriCommands.storage.loadSession().catch(() => null);

        if (storedSession && isSessionValid(storedSession)) {
          // 会话有效，恢复认证状态
          setAuthState({
            isAuthenticated: true,
            session: storedSession,
            loading: false,
            error: null,
          });
        } else {
          // 会话无效或不存在，检查是否启用了自动登录
          const preferences = await tauriCommands.storage.loadPreferences().catch(() => null);
          
          if (preferences?.autoLogin && storedSession) {
            // 启用了自动登录，尝试使用保存的密码重新登录
            try {
              const savedPassword = await tauriCommands.storage.loadPassword();
              
              if (savedPassword) {
                // 使用保存的密码自动登录
                await login({ email: storedSession.email, password: savedPassword }, true);
              } else {
                // 没有保存的密码，清除状态
                setAuthState({
                  isAuthenticated: false,
                  session: null,
                  loading: false,
                  error: null,
                });
              }
            } catch (error) {
              console.error('自动登录失败:', error);
              setAuthState({
                isAuthenticated: false,
                session: null,
                loading: false,
                error: null,
              });
            }
          } else {
            // 没有启用自动登录，清除状态
            setAuthState({
              isAuthenticated: false,
              session: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('加载会话失败:', error);
        setAuthState({
          isAuthenticated: false,
          session: null,
          loading: false,
          error: null,
        });
      }
    };

    loadStoredSession();
  }, [isSessionValid, login]);

  // 上下文值
  const contextValue: AuthContextValue = {
    ...authState,
    login,
    logout,
    validateSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

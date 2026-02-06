/**
 * useAuth Hook
 * 提供便捷的认证操作接口
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * 使用认证上下文的Hook
 * 封装AuthContext的使用，提供类型安全的认证操作接口
 * 
 * @returns 认证上下文值，包含认证状态和操作方法
 * @throws 当在AuthProvider外部使用时抛出错误
 * 
 * @example
 * ```tsx
 * function LoginComponent() {
 *   const { login, isAuthenticated, loading, error } = useAuth();
 *   
 *   const handleLogin = async () => {
 *     try {
 *       await login({ email: 'user@2925.com', password: 'password' });
 *     } catch (error) {
 *       console.error('登录失败:', error);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {loading && <p>加载中...</p>}
 *       {error && <p>错误: {error}</p>}
 *       {!isAuthenticated && <button onClick={handleLogin}>登录</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  
  return context;
};

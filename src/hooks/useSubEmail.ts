/**
 * 子邮箱Hook
 * 提供便捷的子邮箱上下文访问接口
 */

import { useContext } from 'react';
import { SubEmailContext } from '../contexts/SubEmailContext';

/**
 * 使用子邮箱上下文的Hook
 * 
 * @returns 子邮箱上下文值
 * @throws 当在SubEmailProvider外部使用时抛出错误
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { list, addSubEmail, getSubEmailDetails } = useSubEmail();
 *   
 *   // 使用子邮箱功能
 *   const handleCreate = async () => {
 *     const newSubEmail = await generateSubEmail();
 *     await addSubEmail(newSubEmail);
 *   };
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSubEmail() {
  const context = useContext(SubEmailContext);
  
  if (!context) {
    throw new Error('useSubEmail必须在SubEmailProvider内部使用');
  }
  
  return context;
}

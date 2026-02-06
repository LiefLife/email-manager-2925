/**
 * 子邮箱生成Hook
 * 提供子邮箱生成和管理功能
 */

import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { SubEmail } from '../types/subEmail.types';
import { generateSuffixWithConfig, type SuffixGeneratorConfig } from '../utils/suffixGenerator';
import { tauriCommands } from '../services/tauriCommands';

/**
 * 子邮箱生成Hook返回值接口
 */
interface UseSubEmailGeneratorReturn {
  /**
   * 当前正在生成的子邮箱
   */
  generatingSubEmail: SubEmail | null;
  
  /**
   * 是否正在生成中
   */
  isGenerating: boolean;
  
  /**
   * 生成过程中的错误信息
   */
  error: string | null;
  
  /**
   * 生成新的子邮箱
   * @param config - 生成配置
   * @returns 生成的子邮箱信息
   */
  generateSubEmail: (config?: SuffixGeneratorConfig) => Promise<SubEmail>;
  
  /**
   * 清除错误信息
   */
  clearError: () => void;
}

/**
 * 子邮箱生成Hook
 * 实现子邮箱的生成逻辑，包括：
 * 1. 生成随机后缀
 * 2. 构造子邮箱地址
 * 3. 发送创建邮件
 * 4. 更新子邮箱状态
 * 
 * @returns 子邮箱生成相关的状态和方法
 */
export function useSubEmailGenerator(): UseSubEmailGeneratorReturn {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('useSubEmailGenerator必须在AuthProvider内部使用');
  }

  const { session } = authContext;
  
  // 状态管理
  const [generatingSubEmail, setGeneratingSubEmail] = useState<SubEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 从邮箱地址中提取用户名和域名
   * @param email 完整邮箱地址
   * @returns 用户名和域名
   */
  const parseEmail = useCallback((email: string): { username: string; domain: string } => {
    const parts = email.split('@');
    if (parts.length !== 2) {
      throw new Error('无效的邮箱地址格式');
    }
    return {
      username: parts[0],
      domain: parts[1],
    };
  }, []);

  /**
   * 构造子邮箱地址
   * @param primaryEmail 主邮箱地址
   * @param suffix 后缀字符串
   * @returns 完整的子邮箱地址
   */
  const constructSubEmailAddress = useCallback((primaryEmail: string, suffix: string): string => {
    const { username, domain } = parseEmail(primaryEmail);
    return `${username}${suffix}@${domain}`;
  }, [parseEmail]);

  /**
   * 生成新的子邮箱
   * 
   * 流程：
   * 1. 验证用户已登录
   * 2. 根据配置生成随机后缀
   * 3. 构造子邮箱地址（用户名+后缀@域名）
   * 4. 创建SubEmail对象，状态为'creating'
   * 5. 发送创建邮件到子邮箱地址
   * 6. 更新状态为'active'
   * 
   * @param config - 生成配置
   * @returns 生成的子邮箱信息
   * @throws 当用户未登录或生成失败时抛出错误
   */
  const generateSubEmail = useCallback(async (config?: SuffixGeneratorConfig): Promise<SubEmail> => {
    try {
      // 验证用户已登录
      if (!session || !session.email) {
        throw new Error('用户未登录，无法生成子邮箱');
      }

      // 设置生成中状态
      setIsGenerating(true);
      setError(null);

      // 1. 根据配置生成随机后缀
      const suffix = generateSuffixWithConfig(config || {
        useRandomLength: true,
        includeLetters: true,
        includeSymbols: false
      });

      // 2. 构造子邮箱地址（用户名+后缀@域名）
      const subEmailAddress = constructSubEmailAddress(session.email, suffix);

      // 3. 创建SubEmail对象，初始状态为'creating'
      const subEmail: SubEmail = {
        address: subEmailAddress,
        suffix: suffix,
        createdAt: Date.now(),
        status: 'creating',
      };

      // 更新当前生成的子邮箱状态
      setGeneratingSubEmail(subEmail);

      // 4. 发送创建邮件
      await tauriCommands.email.sendEmail(
        subEmailAddress,
        'Create New Email',
        'If you see this message,this email has been created'
      );

      // 5. 发送成功，更新状态为'active'
      const activeSubEmail: SubEmail = {
        ...subEmail,
        status: 'active',
      };

      setGeneratingSubEmail(activeSubEmail);
      setIsGenerating(false);

      return activeSubEmail;
    } catch (err) {
      // 生成失败，更新错误状态
      const errorMessage = err instanceof Error ? err.message : '生成子邮箱失败';
      setError(errorMessage);
      setIsGenerating(false);

      // 如果有正在生成的子邮箱，将其状态更新为'failed'
      if (generatingSubEmail) {
        const failedSubEmail: SubEmail = {
          ...generatingSubEmail,
          status: 'failed',
        };
        setGeneratingSubEmail(failedSubEmail);
      }

      throw err;
    }
  }, [session, constructSubEmailAddress, generatingSubEmail]);

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generatingSubEmail,
    isGenerating,
    error,
    generateSubEmail,
    clearError,
  };
}

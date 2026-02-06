/**
 * 子邮箱上下文模块
 * 提供全局子邮箱列表管理和操作接口
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { SubEmail } from '../types/subEmail.types';
import { tauriCommands } from '../services/tauriCommands';

/**
 * 子邮箱状态接口
 */
interface SubEmailState {
  /**
   * 子邮箱列表
   */
  list: SubEmail[];
  
  /**
   * 是否正在加载
   */
  loading: boolean;
  
  /**
   * 错误信息
   */
  error: string | null;
}

/**
 * 子邮箱上下文值接口
 * 定义SubEmailContext提供的所有方法和状态
 */
interface SubEmailContextValue extends SubEmailState {
  /**
   * 获取所有子邮箱列表
   * @returns 子邮箱数组
   */
  listSubEmails: () => Promise<SubEmail[]>;
  
  /**
   * 获取指定子邮箱的详细信息
   * @param address 子邮箱地址
   * @returns 子邮箱详细信息，如果不存在则返回undefined
   */
  getSubEmailDetails: (address: string) => Promise<SubEmail | undefined>;
  
  /**
   * 添加新的子邮箱到列表
   * @param subEmail 子邮箱信息
   */
  addSubEmail: (subEmail: SubEmail) => Promise<void>;
  
  /**
   * 更新子邮箱信息
   * @param address 子邮箱地址
   * @param updates 要更新的字段
   */
  updateSubEmail: (address: string, updates: Partial<SubEmail>) => Promise<void>;
  
  /**
   * 删除子邮箱
   * @param address 子邮箱地址
   */
  deleteSubEmail: (address: string) => Promise<void>;
  
  /**
   * 刷新子邮箱列表（从本地存储重新加载）
   */
  refreshSubEmails: () => Promise<void>;
}

/**
 * 子邮箱上下文
 * 用于在组件树中共享子邮箱状态
 */
export const SubEmailContext = createContext<SubEmailContextValue | undefined>(undefined);

/**
 * 子邮箱上下文提供者属性接口
 */
interface SubEmailProviderProps {
  children: React.ReactNode;
}

/**
 * 子邮箱上下文提供者组件
 * 管理子邮箱列表状态并提供操作方法
 */
export const SubEmailProvider: React.FC<SubEmailProviderProps> = ({ children }) => {
  // 子邮箱状态
  const [subEmailState, setSubEmailState] = useState<SubEmailState>({
    list: [],
    loading: true,
    error: null,
  });

  /**
   * 保存子邮箱列表到本地存储
   * @param subEmails 子邮箱数组
   */
  const saveToStorage = useCallback(async (subEmails: SubEmail[]): Promise<void> => {
    try {
      await tauriCommands.storage.saveSubEmails(subEmails);
    } catch (error) {
      console.error('保存子邮箱列表失败:', error);
      throw error;
    }
  }, []);

  /**
   * 从本地存储加载子邮箱列表
   * @returns 子邮箱数组
   */
  const loadFromStorage = useCallback(async (): Promise<SubEmail[]> => {
    try {
      const subEmails = await tauriCommands.storage.loadSubEmails();
      return subEmails || [];
    } catch (error) {
      console.error('加载子邮箱列表失败:', error);
      return [];
    }
  }, []);

  /**
   * 获取所有子邮箱列表
   * @returns 子邮箱数组
   */
  const listSubEmails = useCallback(async (): Promise<SubEmail[]> => {
    return subEmailState.list;
  }, [subEmailState.list]);

  /**
   * 获取指定子邮箱的详细信息
   * @param address 子邮箱地址
   * @returns 子邮箱详细信息，如果不存在则返回undefined
   */
  const getSubEmailDetails = useCallback(async (address: string): Promise<SubEmail | undefined> => {
    const subEmail = subEmailState.list.find(se => se.address === address);
    return subEmail;
  }, [subEmailState.list]);

  /**
   * 添加新的子邮箱到列表
   * @param subEmail 子邮箱信息
   */
  const addSubEmail = useCallback(async (subEmail: SubEmail): Promise<void> => {
    try {
      // 检查是否已存在
      const exists = subEmailState.list.some(se => se.address === subEmail.address);
      if (exists) {
        throw new Error('子邮箱已存在');
      }

      // 添加到列表
      const updatedList = [...subEmailState.list, subEmail];
      
      // 保存到本地存储
      await saveToStorage(updatedList);
      
      // 更新状态
      setSubEmailState(prev => ({
        ...prev,
        list: updatedList,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '添加子邮箱失败';
      setSubEmailState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, [subEmailState.list, saveToStorage]);

  /**
   * 更新子邮箱信息
   * @param address 子邮箱地址
   * @param updates 要更新的字段
   */
  const updateSubEmail = useCallback(async (
    address: string,
    updates: Partial<SubEmail>
  ): Promise<void> => {
    try {
      // 查找要更新的子邮箱
      const index = subEmailState.list.findIndex(se => se.address === address);
      if (index === -1) {
        throw new Error('子邮箱不存在');
      }

      // 更新子邮箱信息
      const updatedList = [...subEmailState.list];
      updatedList[index] = {
        ...updatedList[index],
        ...updates,
      };
      
      // 保存到本地存储
      await saveToStorage(updatedList);
      
      // 更新状态
      setSubEmailState(prev => ({
        ...prev,
        list: updatedList,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新子邮箱失败';
      setSubEmailState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, [subEmailState.list, saveToStorage]);

  /**
   * 删除子邮箱
   * @param address 子邮箱地址
   */
  const deleteSubEmail = useCallback(async (address: string): Promise<void> => {
    try {
      // 查找要删除的子邮箱
      const index = subEmailState.list.findIndex(se => se.address === address);
      if (index === -1) {
        throw new Error('子邮箱不存在');
      }

      // 从列表中移除
      const updatedList = subEmailState.list.filter(se => se.address !== address);
      
      // 保存到本地存储
      await saveToStorage(updatedList);
      
      // 更新状态
      setSubEmailState(prev => ({
        ...prev,
        list: updatedList,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除子邮箱失败';
      setSubEmailState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, [subEmailState.list, saveToStorage]);

  /**
   * 刷新子邮箱列表（从本地存储重新加载）
   */
  const refreshSubEmails = useCallback(async (): Promise<void> => {
    try {
      setSubEmailState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const subEmails = await loadFromStorage();
      
      setSubEmailState({
        list: subEmails,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '刷新子邮箱列表失败';
      setSubEmailState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [loadFromStorage]);

  /**
   * 组件挂载时加载子邮箱列表
   */
  useEffect(() => {
    const initializeSubEmails = async () => {
      try {
        const subEmails = await loadFromStorage();
        setSubEmailState({
          list: subEmails,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('初始化子邮箱列表失败:', error);
        setSubEmailState({
          list: [],
          loading: false,
          error: '初始化子邮箱列表失败',
        });
      }
    };

    initializeSubEmails();
  }, [loadFromStorage]);

  // 上下文值
  const contextValue: SubEmailContextValue = {
    ...subEmailState,
    listSubEmails,
    getSubEmailDetails,
    addSubEmail,
    updateSubEmail,
    deleteSubEmail,
    refreshSubEmails,
  };

  return (
    <SubEmailContext.Provider value={contextValue}>
      {children}
    </SubEmailContext.Provider>
  );
};

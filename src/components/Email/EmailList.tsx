/**
 * EmailList组件
 * 显示邮件列表，集成自动刷新功能
 */

import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { EmailContext } from '../../contexts/EmailContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import LoadingSpinner from '../Common/LoadingSpinner';
import GlassCard from '../Common/GlassCard';
import EmailItem from './EmailItem';

/**
 * 邮件列表容器样式
 */
const EmailListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  box-sizing: border-box;
  position: relative;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(139, 92, 246, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.5);
  }
`;

/**
 * 顶部工具栏样式
 */
const TopToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
`;

/**
 * 刷新按钮样式
 */
const RefreshButton = styled.button<{ $isRefreshing: boolean }>`
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: #6366f1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 14px;
    height: 14px;
    animation: ${props => props.$isRefreshing ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * 加载状态容器样式
 */
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
`;

/**
 * 空状态容器样式
 */
const EmptyStateContainer = styled(GlassCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  gap: 12px;
`;

/**
 * 空状态文本样式
 */
const EmptyStateText = styled.p`
  color: #6b7280;
  font-size: 16px;
  margin: 0;
`;

/**
 * 错误状态容器样式
 */
const ErrorContainer = styled(GlassCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  text-align: center;
  gap: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
`;

/**
 * 错误文本样式
 */
const ErrorText = styled.p`
  color: rgba(239, 68, 68, 0.9);
  font-size: 14px;
  margin: 0;
`;

/**
 * 刷新状态指示器样式
 */
const RefreshIndicator = styled.div<{ $isActive: boolean }>`
  padding: 6px 12px;
  background: ${props => 
    props.$isActive 
      ? 'rgba(34, 197, 94, 0.15)' 
      : 'rgba(156, 163, 175, 0.15)'
  };
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$isActive 
      ? 'rgba(34, 197, 94, 0.4)' 
      : 'rgba(156, 163, 175, 0.3)'
  };
  color: ${props => 
    props.$isActive 
      ? '#16a34a' 
      : '#6b7280'
  };
  font-size: 11px;
  font-weight: 500;
  pointer-events: none;
`;

/**
 * EmailList组件属性接口
 */
interface EmailListProps {
  /**
   * 选中的邮件ID
   */
  selectedEmailId?: string;
  
  /**
   * 邮件选中回调
   */
  onEmailSelect?: (emailId: string) => void;
  
  /**
   * 自动刷新间隔（毫秒）
   * @default 5000
   */
  refreshInterval?: number;
}

/**
 * EmailList - 邮件列表组件
 * 
 * 显示邮件列表，集成自动刷新功能和加载状态
 * 
 * @param selectedEmailId - 当前选中的邮件ID
 * @param onEmailSelect - 邮件选中回调函数
 * @param refreshInterval - 自动刷新间隔（默认5000毫秒）
 * 
 * @example
 * <EmailList 
 *   selectedEmailId={selectedId}
 *   onEmailSelect={handleSelect}
 *   refreshInterval={5000}
 * />
 */
const EmailList: React.FC<EmailListProps> = ({
  selectedEmailId,
  onEmailSelect,
  refreshInterval = 5000,
}) => {
  // 获取邮件上下文和认证上下文
  const emailContext = useContext(EmailContext);
  const authContext = useContext(AuthContext);

  if (!emailContext) {
    throw new Error('EmailList必须在EmailProvider内使用');
  }

  if (!authContext) {
    throw new Error('EmailList必须在AuthProvider内使用');
  }

  const { list: emails, loading, error, refreshWithMainEmail } = emailContext;
  const { session } = authContext;

  // 初始加载状态
  const [initialLoading, setInitialLoading] = useState(true);

  /**
   * 刷新邮件函数
   */
  const handleRefresh = async () => {
    if (session?.email) {
      await refreshWithMainEmail(session.email);
    }
  };

  /**
   * 手动刷新按钮点击
   */
  const handleManualRefresh = async () => {
    await handleRefresh();
  };

  // 集成自动刷新Hook
  const { isActive: isAutoRefreshActive, isRefreshing } = useAutoRefresh(
    handleRefresh,
    {
      interval: refreshInterval,
      immediate: true,
      enabled: true,
    }
  );

  /**
   * 初始加载完成后更新状态
   */
  useEffect(() => {
    if (!loading && initialLoading) {
      setInitialLoading(false);
    }
  }, [loading, initialLoading]);

  /**
   * 渲染加载状态
   */
  if (initialLoading && loading) {
    return (
      <EmailListContainer>
        <LoadingContainer>
          <LoadingSpinner size="large" text="加载邮件中..." />
        </LoadingContainer>
      </EmailListContainer>
    );
  }

  /**
   * 渲染错误状态
   */
  if (error && emails.length === 0) {
    return (
      <EmailListContainer>
        <ErrorContainer>
          <ErrorText>加载邮件失败</ErrorText>
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      </EmailListContainer>
    );
  }

  /**
   * 渲染空状态
   */
  if (emails.length === 0) {
    return (
      <EmailListContainer>
        <EmptyStateContainer>
          <EmptyStateText>📭</EmptyStateText>
          <EmptyStateText>暂无邮件</EmptyStateText>
        </EmptyStateContainer>
      </EmailListContainer>
    );
  }

  /**
   * 渲染邮件列表
   */
  return (
    <EmailListContainer>
      <TopToolbar>
        <RefreshIndicator $isActive={isAutoRefreshActive}>
          {isRefreshing ? '刷新中...' : isAutoRefreshActive ? '自动刷新' : '已禁用'}
        </RefreshIndicator>
        
        <RefreshButton 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          $isRefreshing={isRefreshing}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
          </svg>
          {isRefreshing ? '刷新中' : '手动刷新'}
        </RefreshButton>
      </TopToolbar>

      {emails.map(email => (
        <EmailItem
          key={email.id}
          email={email}
          isSelected={email.id === selectedEmailId}
          onClick={(email) => onEmailSelect?.(email.id)}
        />
      ))}
    </EmailListContainer>
  );
};

export default EmailList;

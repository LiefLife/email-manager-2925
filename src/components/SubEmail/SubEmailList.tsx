/**
 * SubEmailList组件
 * 显示子邮箱列表
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useSubEmail } from '../../hooks/useSubEmail';
import type { SubEmail } from '../../types/subEmail.types';

/**
 * 列表容器样式
 */
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  
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
    
    &:hover {
      background: rgba(139, 92, 246, 0.5);
    }
  }
`;

/**
 * 列表外层容器
 */
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

/**
 * 列表标题样式
 */
const ListTitle = styled.h3`
  color: #4b5563;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-align: left;
  flex-shrink: 0;
`;

/**
 * 子邮箱项容器样式
 */
const SubEmailItem = styled(motion.div)`
  padding: 12px;
  background: rgba(139, 92, 246, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  
  &:hover {
    background: rgba(139, 92, 246, 0.12);
    border-color: rgba(139, 92, 246, 0.3);
  }
`;

/**
 * 邮箱地址容器样式
 */
const EmailAddressContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/**
 * 子邮箱地址样式
 */
const EmailAddress = styled.div`
  color: #1f2937;
  font-size: 12px;
  font-family: 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-weight: 500;
  overflow-wrap: break-word;
  line-height: 1.4;
  word-break: break-all;
  letter-spacing: 0.02em;
`;

/**
 * 创建时间样式
 */
const CreatedTime = styled.div`
  color: #9ca3af;
  font-size: 10px;
  font-weight: 400;
`;

/**
 * 复制按钮样式
 */
const CopyButton = styled.button<{ $copied: boolean }>`
  padding: 6px 10px;
  background: ${props => props.$copied 
    ? 'rgba(34, 197, 94, 0.15)' 
    : 'rgba(99, 102, 241, 0.1)'
  };
  border: 1px solid ${props => props.$copied 
    ? 'rgba(34, 197, 94, 0.4)' 
    : 'rgba(99, 102, 241, 0.3)'
  };
  border-radius: 8px;
  color: ${props => props.$copied ? '#16a34a' : '#6366f1'};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$copied 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'rgba(99, 102, 241, 0.2)'
    };
    border-color: ${props => props.$copied 
      ? 'rgba(34, 197, 94, 0.5)' 
      : 'rgba(99, 102, 241, 0.4)'
    };
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

/**
 * 空状态容器样式
 */
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
`;

/**
 * 空状态文本样式
 */
const EmptyText = styled.p`
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  margin: 0;
`;

/**
 * 列表项动画变体
 */
const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: (index: number) => ({ 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3,
      delay: index * 0.05
    }
  })
};

/**
 * SubEmailList组件属性接口
 */
interface SubEmailListProps {
  className?: string;
  onItemClick?: (subEmail: SubEmail) => void;
}

/**
 * 格式化时间戳为可读日期
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化的日期字符串
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('复制到剪贴板失败:', error);
    return false;
  }
};

/**
 * SubEmailList - 子邮箱列表组件
 * 
 * 功能：
 * 1. 显示所有子邮箱
 * 2. 显示子邮箱地址和创建时间
 * 3. 提供复制按钮复制邮箱地址
 * 
 * @param className - 自定义CSS类名
 * @param onItemClick - 子邮箱项点击回调
 */
const SubEmailList: React.FC<SubEmailListProps> = ({
  className,
  onItemClick
}) => {
  const { list, loading, error } = useSubEmail();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /**
   * 处理复制按钮点击
   * @param address 邮箱地址
   * @param event 点击事件
   */
  const handleCopy = async (address: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedId(address);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <ListWrapper className={className}>
        <ListTitle>子邮箱列表</ListTitle>
        <EmptyState>
          <LoadingSpinner size="medium" text="加载中..." />
        </EmptyState>
      </ListWrapper>
    );
  }

  // 错误状态
  if (error) {
    return (
      <ListWrapper className={className}>
        <ListTitle>子邮箱列表</ListTitle>
        <EmptyState>
          <EmptyText>{error}</EmptyText>
        </EmptyState>
      </ListWrapper>
    );
  }

  // 空列表状态
  if (list.length === 0) {
    return (
      <ListWrapper className={className}>
        <ListTitle>子邮箱列表</ListTitle>
        <EmptyState>
          <EmptyText>暂无子邮箱</EmptyText>
          <EmptyText>点击上方按钮创建第一个子邮箱</EmptyText>
        </EmptyState>
      </ListWrapper>
    );
  }

  // 显示子邮箱列表
  return (
    <ListWrapper className={className}>
      <ListTitle>子邮箱列表 ({list.length})</ListTitle>
      <ListContainer>
        {list.map((subEmail, index) => (
          <SubEmailItem
            key={subEmail.address}
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            onClick={() => onItemClick?.(subEmail)}
          >
            <EmailAddressContainer>
              <EmailAddress>{subEmail.address}</EmailAddress>
              <CreatedTime>{formatDate(subEmail.createdAt)}</CreatedTime>
            </EmailAddressContainer>
            
            <CopyButton
              $copied={copiedId === subEmail.address}
              onClick={(e) => handleCopy(subEmail.address, e)}
            >
              {copiedId === subEmail.address ? '已复制' : '复制'}
            </CopyButton>
          </SubEmailItem>
        ))}
      </ListContainer>
    </ListWrapper>
  );
};

export default SubEmailList;

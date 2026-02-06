/**
 * SubEmailList组件
 * 显示子邮箱列表
 */

import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useSubEmail } from '../../hooks/useSubEmail';
import { SubEmailContext } from '../../contexts/SubEmailContext';
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
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px 0 rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 
      0 6px 20px 0 rgba(139, 92, 246, 0.15),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
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
 * 右键菜单容器样式
 */
const ContextMenu = styled(motion.div)<{ $x: number; $y: number }>`
  position: fixed;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px 0 rgba(139, 92, 246, 0.2),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  padding: 6px;
  min-width: 120px;
  z-index: 1000;
`;

/**
 * 右键菜单项样式
 */
const ContextMenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: ${props => props.$danger ? '#ef4444' : '#374151'};
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.$danger 
      ? 'rgba(239, 68, 68, 0.1)' 
      : 'rgba(139, 92, 246, 0.1)'
    };
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

/**
 * 确认对话框遮罩层
 */
const ConfirmOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

/**
 * 确认对话框样式
 */
const ConfirmDialog = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 20px 60px rgba(139, 92, 246, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  padding: 24px;
  width: 90%;
  max-width: 400px;
`;

/**
 * 确认对话框标题
 */
const ConfirmTitle = styled.h3`
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

/**
 * 确认对话框内容
 */
const ConfirmContent = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  word-break: break-all;
`;

/**
 * 确认对话框按钮容器
 */
const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

/**
 * 确认对话框按钮
 */
const ConfirmButton = styled.button<{ $variant?: 'danger' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.$variant === 'danger' ? `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: #6366f1;
    border: 1px solid rgba(139, 92, 246, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.7);
    }
  `}
  
  &:active {
    transform: translateY(0);
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
 * 4. 提供右键菜单支持删除操作
 * 
 * @param className - 自定义CSS类名
 * @param onItemClick - 子邮箱项点击回调
 */
const SubEmailList: React.FC<SubEmailListProps> = ({
  className,
  onItemClick
}) => {
  const { list, loading, error } = useSubEmail();
  const subEmailContext = useContext(SubEmailContext);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; address: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!subEmailContext) {
    throw new Error('SubEmailList必须在SubEmailProvider内使用');
  }

  const { deleteSubEmail } = subEmailContext;

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

  /**
   * 处理右键菜单
   * @param event 鼠标事件
   * @param address 子邮箱地址
   */
  const handleContextMenu = (event: React.MouseEvent, address: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      address
    });
  };

  /**
   * 关闭右键菜单
   */
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  /**
   * 处理删除操作
   * @param address 子邮箱地址
   */
  const handleDelete = (address: string) => {
    setConfirmDelete(address);
    closeContextMenu();
  };

  /**
   * 确认删除
   */
  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    
    try {
      await deleteSubEmail(confirmDelete);
      setConfirmDelete(null);
    } catch (error) {
      console.error('删除子邮箱失败:', error);
    }
  };

  /**
   * 取消删除
   */
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  /**
   * 点击其他地方关闭右键菜单
   */
  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

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
            onContextMenu={(e) => handleContextMenu(e, subEmail.address)}
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

      {/* 右键菜单 */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            $x={contextMenu.x}
            $y={contextMenu.y}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <ContextMenuItem
              $danger
              onClick={() => handleDelete(contextMenu.address)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              删除
            </ContextMenuItem>
          </ContextMenu>
        )}
      </AnimatePresence>

      {/* 删除确认对话框 */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDelete}
          >
            <ConfirmDialog
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ConfirmTitle>确认删除</ConfirmTitle>
              <ConfirmContent>
                确定要删除子邮箱 <strong>{confirmDelete}</strong> 吗？此操作无法撤销。
              </ConfirmContent>
              <ConfirmButtons>
                <ConfirmButton $variant="secondary" onClick={cancelDelete}>
                  取消
                </ConfirmButton>
                <ConfirmButton $variant="danger" onClick={confirmDeleteAction}>
                  删除
                </ConfirmButton>
              </ConfirmButtons>
            </ConfirmDialog>
          </ConfirmOverlay>
        )}
      </AnimatePresence>
    </ListWrapper>
  );
};

export default SubEmailList;

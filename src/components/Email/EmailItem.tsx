/**
 * EmailItem组件
 * 显示单个邮件项，包含发件人、主题、时间和预览
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { Email } from '../../types/email.types';

/**
 * 邮件项容器样式
 */
const EmailItemContainer = styled(motion.div)<{ $isRead: boolean; $isSelected: boolean }>`
  background: ${props => 
    props.$isSelected 
      ? 'rgba(99, 102, 241, 0.15)' 
      : props.$isRead 
        ? 'rgba(255, 255, 255, 0.7)' 
        : 'rgba(255, 255, 255, 0.85)'
  };
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid ${props => 
    props.$isSelected 
      ? 'rgba(99, 102, 241, 0.4)' 
      : 'rgba(139, 92, 246, 0.2)'
  };
  box-shadow: 0 2px 8px 0 rgba(139, 92, 246, 0.1);
  padding: 12px;
  padding-left: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &:hover {
    background: ${props => 
      props.$isSelected 
        ? 'rgba(99, 102, 241, 0.2)' 
        : 'rgba(255, 255, 255, 0.95)'
    };
    box-shadow: 0 4px 12px 0 rgba(139, 92, 246, 0.2);
    transform: translateX(2px);
  }

  /* 未读邮件左侧指示器 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${props => 
      props.$isRead 
        ? 'transparent' 
        : 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)'
    };
    border-radius: 12px 0 0 12px;
  }
`;

/**
 * 邮件头部容器样式
 */
const EmailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
`;

/**
 * 发件人样式
 */
const EmailFrom = styled.div<{ $isRead: boolean }>`
  color: ${props => props.$isRead ? '#6b7280' : '#1f2937'};
  font-size: 13px;
  font-weight: ${props => props.$isRead ? '400' : '600'};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
`;

/**
 * 时间戳样式
 */
const EmailTimestamp = styled.div`
  color: #9ca3af;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
`;

/**
 * 邮件主题样式
 */
const EmailSubject = styled.div<{ $isRead: boolean }>`
  color: ${props => props.$isRead ? '#6b7280' : '#374151'};
  font-size: 14px;
  font-weight: ${props => props.$isRead ? '400' : '600'};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * 邮件预览样式
 */
const EmailPreview = styled.div`
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 6px;
`;

/**
 * 子邮箱转发标识样式
 */
const ForwardedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  color: #6366f1;
  font-size: 10px;
  font-weight: 500;
  margin-top: 2px;
  align-self: flex-start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

/**
 * 动画变体配置
 */
const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' as const
    }
  },
  hover: {
    scale: 1.01,
    transition: { 
      duration: 0.2 
    }
  },
  tap: {
    scale: 0.98,
    transition: { 
      duration: 0.1 
    }
  }
};

/**
 * EmailItem组件属性接口
 */
interface EmailItemProps {
  /**
   * 邮件数据
   */
  email: Email;
  
  /**
   * 是否被选中
   */
  isSelected?: boolean;
  
  /**
   * 点击回调
   */
  onClick?: (email: Email) => void;
  
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 格式化时间戳为相对时间或绝对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }
  
  // 24小时内
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }
  
  // 7天内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }
  
  // 超过7天，显示具体日期
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * 生成邮件预览文本
 * @param body 邮件正文
 * @param maxLength 最大长度
 * @returns 预览文本
 */
const generatePreview = (body: string, maxLength: number = 100): string => {
  // 移除HTML标签（如果有）
  const plainText = body.replace(/<[^>]*>/g, '');
  
  // 移除多余空白字符
  const cleaned = plainText.replace(/\s+/g, ' ').trim();
  
  // 截断到最大长度
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  return cleaned.substring(0, maxLength) + '...';
};

/**
 * EmailItem - 单个邮件项组件
 * 
 * 显示邮件的发件人、主题、时间和内容预览
 * 支持标识子邮箱转发邮件，添加点击动画
 * 
 * @param email - 邮件数据对象
 * @param isSelected - 是否被选中
 * @param onClick - 点击回调函数
 * @param className - 自定义CSS类名
 * 
 * @example
 * <EmailItem 
 *   email={emailData}
 *   isSelected={selectedId === emailData.id}
 *   onClick={handleEmailClick}
 * />
 */
const EmailItem: React.FC<EmailItemProps> = ({
  email,
  isSelected = false,
  onClick,
  className,
}) => {
  /**
   * 处理点击事件
   */
  const handleClick = () => {
    onClick?.(email);
  };

  return (
    <EmailItemContainer
      className={className}
      $isRead={email.isRead}
      $isSelected={isSelected}
      onClick={handleClick}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      {/* 邮件头部：发件人和时间 */}
      <EmailHeader>
        <EmailFrom $isRead={email.isRead}>
          {email.from}
        </EmailFrom>
        <EmailTimestamp>
          {formatTimestamp(email.timestamp)}
        </EmailTimestamp>
      </EmailHeader>

      {/* 邮件主题 */}
      <EmailSubject $isRead={email.isRead}>
        {email.subject || '(无主题)'}
      </EmailSubject>

      {/* 邮件预览 */}
      <EmailPreview>
        {generatePreview(email.body)}
      </EmailPreview>

      {/* 子邮箱转发标识 */}
      {email.isSubEmailForwarded && email.originalSubEmail && (
        <ForwardedBadge>
          🔄 转发自 {email.originalSubEmail}
        </ForwardedBadge>
      )}
    </EmailItemContainer>
  );
};

export default EmailItem;

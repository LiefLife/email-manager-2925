/**
 * EmailDetail组件
 * 显示邮件的完整内容，支持标记已读
 */

import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { Email } from '../../types/email.types';
import { EmailContext } from '../../contexts/EmailContext';
import GlassCard from '../Common/GlassCard';

/**
 * 邮件详情容器样式
 */
const EmailDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  box-sizing: border-box;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

/**
 * 邮件详情卡片样式
 */
const DetailCard = styled(GlassCard)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex-shrink: 0;
`;

/**
 * 邮件头部样式
 */
const EmailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * 邮件主题样式
 */
const EmailSubject = styled.h2`
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
`;

/**
 * 邮件元信息容器样式
 */
const EmailMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

/**
 * 元信息行样式
 */
const MetaRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
`;

/**
 * 元信息标签样式
 */
const MetaLabel = styled.span`
  font-weight: 600;
  color: #4b5563;
  min-width: 50px;
  flex-shrink: 0;
`;

/**
 * 元信息值样式
 */
const MetaValue = styled.span`
  color: #1f2937;
  word-break: break-all;
  flex: 1;
`;

/**
 * 子邮箱转发标识样式
 */
const ForwardedBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: rgba(59, 130, 246, 0.95);
  font-size: 11px;
  font-weight: 500;
  align-self: flex-start;
  word-break: break-all;
`;

/**
 * 邮件正文容器样式
 */
const EmailBody = styled.div`
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  
  /* 处理HTML内容 */
  p {
    margin: 0 0 10px 0;
    max-width: 100%;
  }
  
  a {
    color: #6366f1;
    text-decoration: underline;
    word-break: break-all;
    
    &:hover {
      color: #4f46e5;
    }
  }
  
  img {
    max-width: 100% !important;
    width: 100% !important;
    height: auto !important;
    display: block;
    border-radius: 6px;
    margin: 10px 0;
    object-fit: contain;
  }
  
  code {
    background: rgba(139, 92, 246, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    word-break: break-all;
  }
  
  pre {
    background: rgba(139, 92, 246, 0.1);
    padding: 10px;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  div {
    max-width: 100%;
    overflow-wrap: break-word;
  }
  
  table {
    max-width: 100%;
    width: 100%;
    overflow-x: auto;
    display: block;
  }
  
  /* 强制所有子元素不溢出 */
  * {
    max-width: 100% !important;
    box-sizing: border-box;
  }
  
  /* 处理内联样式的图片 */
  [style*="width"] {
    width: 100% !important;
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
  height: 100%;
  gap: 12px;
  color: #9ca3af;
  font-size: 16px;
`;

/**
 * 动画变体配置
 */
const detailVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: 'easeOut' as const
    }
  }
};

const badgeVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' as const,
      delay: 0.2
    }
  }
};

/**
 * EmailDetail组件属性接口
 */
interface EmailDetailProps {
  /**
   * 要显示的邮件数据
   */
  email: Email | null;
  
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 格式化完整时间戳
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
const formatFullTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 处理邮件正文，将HTML转换为安全的显示内容
 * @param body 邮件正文
 * @returns 处理后的正文
 */
const processEmailBody = (body: string): string => {
  // 如果正文包含HTML标签，保留基本格式
  if (/<[^>]+>/.test(body)) {
    // 移除script和style标签
    let processed = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    processed = processed.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    return processed;
  }
  return body;
};

/**
 * EmailDetail - 邮件详情组件
 * 
 * 显示邮件的完整内容，包括发件人、收件人、主题、时间和正文
 * 自动标记邮件为已读，支持玻璃风格设计
 * 
 * @param email - 邮件数据对象（null表示未选中邮件）
 * @param className - 自定义CSS类名
 * 
 * @example
 * <EmailDetail email={selectedEmail} />
 */
const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  className,
}) => {
  // 获取邮件上下文
  const emailContext = useContext(EmailContext);

  if (!emailContext) {
    throw new Error('EmailDetail必须在EmailProvider内使用');
  }

  const { markAsRead } = emailContext;

  /**
   * 当邮件打开时自动标记为已读
   */
  useEffect(() => {
    if (email && !email.isRead) {
      // 延迟标记，给用户一点时间看到邮件
      const timer = setTimeout(() => {
        markAsRead(email.id);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [email, markAsRead]);

  /**
   * 渲染空状态
   */
  if (!email) {
    return (
      <EmailDetailContainer className={className}>
        <EmptyState>
          <div style={{ fontSize: '48px' }}>📧</div>
          <div>选择一封邮件查看详情</div>
        </EmptyState>
      </EmailDetailContainer>
    );
  }

  /**
   * 渲染邮件详情
   */
  return (
    <EmailDetailContainer className={className}>
      <DetailCard
        as={motion.div}
        variants={detailVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 邮件头部 */}
        <EmailHeader>
          {/* 邮件主题 */}
          <EmailSubject>
            {email.subject || '(无主题)'}
          </EmailSubject>

          {/* 邮件元信息 */}
          <EmailMeta>
            <MetaRow>
              <MetaLabel>发件人:</MetaLabel>
              <MetaValue>{email.from}</MetaValue>
            </MetaRow>
            <MetaRow>
              <MetaLabel>收件人:</MetaLabel>
              <MetaValue>{email.to}</MetaValue>
            </MetaRow>
            <MetaRow>
              <MetaLabel>时间:</MetaLabel>
              <MetaValue>{formatFullTimestamp(email.timestamp)}</MetaValue>
            </MetaRow>
          </EmailMeta>

          {/* 子邮箱转发标识 */}
          {email.isSubEmailForwarded && email.originalSubEmail && (
            <ForwardedBadge
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
            >
              🔄 此邮件转发自子邮箱: {email.originalSubEmail}
            </ForwardedBadge>
          )}
        </EmailHeader>

        {/* 邮件正文 */}
        <EmailBody dangerouslySetInnerHTML={{ __html: processEmailBody(email.body || '(邮件内容为空)') }} />
      </DetailCard>
    </EmailDetailContainer>
  );
};

export default EmailDetail;

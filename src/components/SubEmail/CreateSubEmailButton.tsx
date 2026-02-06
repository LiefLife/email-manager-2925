/**
 * CreateSubEmailButton组件
 * 一键生成子邮箱的按钮组件
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AnimatedButton from '../Common/AnimatedButton';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useSubEmailGenerator } from '../../hooks/useSubEmailGenerator';
import { useSubEmail } from '../../hooks/useSubEmail';
import type { SubEmailSettingsConfig } from './SubEmailSettings';

/**
 * 按钮容器样式
 */
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

/**
 * 状态消息样式
 */
const StatusMessage = styled(motion.div)<{ $type: 'success' | 'error' }>`
  padding: 12px 20px;
  border-radius: 12px;
  background: ${props => 
    props.$type === 'success' 
      ? 'rgba(34, 197, 94, 0.15)' 
      : 'rgba(239, 68, 68, 0.15)'
  };
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid ${props => 
    props.$type === 'success' 
      ? 'rgba(34, 197, 94, 0.4)' 
      : 'rgba(239, 68, 68, 0.4)'
  };
  color: ${props => 
    props.$type === 'success' 
      ? '#16a34a' 
      : '#dc2626'
  };
  font-size: 14px;
  text-align: center;
  box-shadow: 0 4px 16px 0 rgba(139, 92, 246, 0.15);
`;

/**
 * 生成中的状态容器
 */
const GeneratingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(139, 92, 246, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
`;

/**
 * 生成的子邮箱地址显示
 */
const GeneratedAddress = styled(motion.div)`
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #6366f1;
  font-size: 14px;
  font-family: monospace;
  text-align: center;
  box-shadow: 0 4px 16px 0 rgba(139, 92, 246, 0.15);
`;

/**
 * 消息动画变体
 */
const messageVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

/**
 * CreateSubEmailButton组件属性接口
 */
interface CreateSubEmailButtonProps {
  onSuccess?: (address: string) => void;
  onError?: (error: string) => void;
  className?: string;
  settings?: SubEmailSettingsConfig;
}

/**
 * CreateSubEmailButton - 一键生成子邮箱按钮组件
 * 
 * 功能：
 * 1. 点击按钮生成新的子邮箱
 * 2. 显示生成过程中的动画和状态
 * 3. 生成成功后显示子邮箱地址
 * 4. 自动添加到子邮箱列表
 * 
 * @param onSuccess - 生成成功回调函数
 * @param onError - 生成失败回调函数
 * @param className - 自定义CSS类名
 * @param settings - 子邮箱生成设置
 */
const CreateSubEmailButton: React.FC<CreateSubEmailButtonProps> = ({
  onSuccess,
  onError,
  className,
  settings
}) => {
  const { generateSubEmail, isGenerating, error, clearError } = useSubEmailGenerator();
  const { addSubEmail } = useSubEmail();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState<string | null>(null);

  /**
   * 处理生成子邮箱按钮点击
   */
  const handleGenerate = async () => {
    try {
      // 清除之前的状态
      clearError();
      setShowSuccess(false);
      setGeneratedAddress(null);

      // 生成子邮箱
      const subEmail = await generateSubEmail(settings);
      
      // 添加到子邮箱列表
      await addSubEmail(subEmail);
      
      // 自动复制到剪贴板
      try {
        await navigator.clipboard.writeText(subEmail.address);
        console.log('子邮箱地址已复制到剪贴板');
      } catch (clipboardError) {
        console.error('复制到剪贴板失败:', clipboardError);
      }
      
      // 显示成功状态
      setGeneratedAddress(subEmail.address);
      setShowSuccess(true);
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess(subEmail.address);
      }
      
      // 3秒后自动隐藏成功消息
      setTimeout(() => {
        setShowSuccess(false);
        setGeneratedAddress(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成子邮箱失败';
      
      // 调用错误回调
      if (onError) {
        onError(errorMessage);
      }
      
      // 3秒后自动清除错误消息
      setTimeout(() => {
        clearError();
      }, 3000);
    }
  };

  return (
    <ButtonContainer className={className}>
      <AnimatedButton
        onClick={handleGenerate}
        disabled={isGenerating}
        variant="primary"
        size="large"
      >
        {isGenerating ? '生成中...' : '生成新子邮箱'}
      </AnimatedButton>
      
      {isGenerating && (
        <GeneratingContainer>
          <LoadingSpinner size="medium" text="正在生成子邮箱..." />
          {generatedAddress && (
            <GeneratedAddress
              variants={messageVariants}
              initial="hidden"
              animate="visible"
            >
              {generatedAddress}
            </GeneratedAddress>
          )}
        </GeneratingContainer>
      )}
      
      {showSuccess && generatedAddress && !isGenerating && (
        <StatusMessage
          $type="success"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          子邮箱创建成功并已复制: {generatedAddress}
        </StatusMessage>
      )}
      
      {error && !isGenerating && (
        <StatusMessage
          $type="error"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {error}
        </StatusMessage>
      )}
    </ButtonContainer>
  );
};

export default CreateSubEmailButton;

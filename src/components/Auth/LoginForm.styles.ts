/**
 * LoginForm样式文件
 * 实现拟态玻璃风格的登录表单样式和动画
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import GlassCard from '../Common/GlassCard';

/**
 * 登录页面容器
 * 全屏居中布局，白色背景+蓝紫渐变
 */
export const LoginContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
`;

/**
 * 登录卡片容器
 * 使用GlassCard实现玻璃效果
 */
export const LoginCard = styled(GlassCard)`
  width: 100%;
  max-width: 450px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: ${p => p.theme.glass.backgroundStrong};
  backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  border: ${p => p.theme.glass.border};
  box-shadow:
    ${p => p.theme.shadow.soft},
    ${p => p.theme.glass.highlight},
    ${p => p.theme.shadow.glow};

  /* 响应式布局 - 小屏幕 */
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 30px 20px;
  }

  /* 响应式布局 - 超小屏幕 */
  @media (max-width: 480px) {
    padding: 24px 16px;
    gap: 20px;
  }
`;

/**
 * 登录标题
 * 带动画效果的标题文本
 */
export const LoginTitle = styled(motion.h1)`
  color: ${p => p.theme.colors.text.primary};
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin: 0;

  /* 响应式字体 */
  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

/**
 * 登录表单
 */
export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

/**
 * 输入框组容器
 */
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

/**
 * 输入框标签
 */
export const InputLabel = styled.label`
  color: ${p => p.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  margin-left: 4px;

  /* 响应式字体 */
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

/**
 * 输入框
 * 玻璃风格输入框，带动画和焦点效果
 */
export const Input = styled.input<{ $hasError: boolean }>`
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  color: ${p => p.theme.colors.text.primary};
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  border-radius: 12px;
  border: 1px solid ${props => 
    props.$hasError 
      ? 'rgba(239, 68, 68, 0.5)' 
      : 'rgba(255, 255, 255, 0.26)'
  };
  box-shadow: ${props =>
    props.$hasError
      ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
      : '0 10px 30px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
  };
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;

  /* 占位符样式 */
  &::placeholder {
    color: #9ca3af;
  }

  /* 焦点状态 */
  &:focus {
    background: rgba(255, 255, 255, 0.78);
    border-color: ${props =>
      props.$hasError
        ? 'rgba(239, 68, 68, 0.6)'
        : 'rgba(34, 211, 238, 0.55)'
    };
    box-shadow: ${props =>
      props.$hasError
        ? '0 0 0 3px rgba(239, 68, 68, 0.3)'
        : '0 0 0 3px rgba(34, 211, 238, 0.22)'
    };
    transform: translateY(-1px);
  }

  /* 悬停状态 */
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.9);
    border-color: ${props =>
      props.$hasError
        ? 'rgba(239, 68, 68, 0.6)'
        : 'rgba(139, 92, 246, 0.4)'
    };
  }

  /* 禁用状态 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.5);
  }

  /* 自动填充样式 */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: #1f2937;
    -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.8) inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* 响应式字体 */
  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 15px;
  }
`;

/**
 * 错误消息
 * 带动画的错误提示文本
 */
export const ErrorMessage = styled(motion.p)`
  color: rgba(239, 68, 68, 0.95);
  font-size: 13px;
  font-weight: 400;
  margin: 0;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  /* 响应式字体 */
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 10px;
  }
`;

/**
 * 按钮组容器
 */
export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  width: 100%;

  /* 确保按钮占满宽度 */
  button {
    width: 100%;
  }
`;

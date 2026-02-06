import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * AnimatedButton组件属性接口
 */
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * 拟态玻璃风格按钮样式组件
 * 实现玻璃效果和动画交互
 */
const StyledButton = styled(motion.button)<{
  $variant: 'primary' | 'secondary' | 'danger';
  $size: 'small' | 'medium' | 'large';
  disabled?: boolean;
}>`
  /* 玻璃效果基础样式 */
  background: ${props => {
    if (props.disabled) return 'rgba(200, 200, 200, 0.3)';
    switch (props.$variant) {
      case 'primary':
        return `linear-gradient(135deg, ${props.theme.colors.brand.indigo} 0%, ${props.theme.colors.brand.violet} 55%, ${props.theme.colors.brand.cyan} 120%)`;
      case 'secondary':
        return props.theme.glass.backgroundStrong;
      case 'danger':
        return 'rgba(239, 68, 68, 0.9)';
      default:
        return props.theme.glass.backgroundStrong;
    }
  }};
  backdrop-filter: blur(${props => props.theme.glass.blur}) saturate(${props => props.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${props => props.theme.glass.blur}) saturate(${props => props.theme.glass.saturation});
  border-radius: ${props => {
    switch (props.$size) {
      case 'small':
        return '8px';
      case 'large':
        return '16px';
      default:
        return '12px';
    }
  }};
  border: 1px solid ${props => {
    if (props.disabled) return 'rgba(200, 200, 200, 0.3)';
    switch (props.$variant) {
      case 'primary':
        return 'rgba(255, 255, 255, 0.26)';
      case 'secondary':
        return 'rgba(255, 255, 255, 0.24)';
      case 'danger':
        return 'rgba(239, 68, 68, 0.5)';
      default:
        return 'rgba(255, 255, 255, 0.24)';
    }
  }};
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    0 0 0 1px rgba(139, 92, 246, 0.14);
  
  /* 尺寸样式 */
  padding: ${props => {
    switch (props.$size) {
      case 'small':
        return '8px 16px';
      case 'large':
        return '16px 32px';
      default:
        return '12px 24px';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'small':
        return '14px';
      case 'large':
        return '18px';
      default:
        return '16px';
    }
  }};
  
  /* 文本样式 */
  color: ${props => {
    if (props.disabled) return 'rgba(150, 150, 150, 0.6)';
    if (props.$variant === 'secondary') return props.theme.colors.text.primary;
    return '#ffffff';
  }};
  font-weight: 500;
  text-align: center;
  
  /* 交互样式 */
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  outline: none;
  transition: all 0.3s ease;
  
  /* 悬停效果 */
  &:hover:not(:disabled) {
    background: ${props => {
      switch (props.$variant) {
        case 'primary':
          return `linear-gradient(135deg, ${props.theme.colors.brand.indigo} 0%, ${props.theme.colors.brand.violet} 40%, ${props.theme.colors.brand.pink} 115%)`;
        case 'secondary':
          return props.theme.glass.backgroundHover;
        case 'danger':
          return 'rgba(220, 38, 38, 0.9)';
        default:
          return props.theme.glass.backgroundHover;
      }
    }};
    box-shadow:
      0 14px 44px rgba(15, 23, 42, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.42),
      0 0 0 1px rgba(34, 211, 238, 0.16);
    transform: translateY(-1px);
  }
  
  /* 激活效果 */
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

/**
 * 按钮动画变体配置
 */
const buttonVariants = {
  initial: {
    scale: 1,
    opacity: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut' as const
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeInOut' as const
    }
  },
  disabled: {
    opacity: 0.5,
    scale: 1
  }
};

/**
 * AnimatedButton - 拟态玻璃风格动画按钮组件
 * 
 * @param children - 按钮文本或子元素
 * @param onClick - 点击事件处理函数
 * @param disabled - 是否禁用按钮
 * @param type - 按钮类型（button/submit/reset）
 * @param variant - 按钮变体（primary/secondary/danger）
 * @param size - 按钮尺寸（small/medium/large）
 * @param className - 自定义CSS类名
 * 
 * @example
 * <AnimatedButton onClick={handleClick} variant="primary" size="medium">
 *   点击我
 * </AnimatedButton>
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  className
}) => {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      $variant={variant}
      $size={size}
      className={className}
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      animate={disabled ? "disabled" : "initial"}
    >
      {children}
    </StyledButton>
  );
};

export default AnimatedButton;

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner组件属性接口
 */
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  className?: string;
}

/**
 * 加载动画容器样式
 */
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

/**
 * 拟态玻璃风格加载圆环样式
 */
const SpinnerRing = styled(motion.div)<{
  $size: 'small' | 'medium' | 'large';
  $color?: string;
}>`
  width: ${props => {
    switch (props.$size) {
      case 'small':
        return '32px';
      case 'large':
        return '64px';
      default:
        return '48px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small':
        return '32px';
      case 'large':
        return '64px';
      default:
        return '48px';
    }
  }};
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 3px solid transparent;
  border-top-color: ${props => props.$color || '#6366f1'};
  border-right-color: ${props => props.$color || 'rgba(99, 102, 241, 0.4)'};
  box-shadow: 0 4px 16px 0 rgba(139, 92, 246, 0.25);
  position: relative;
`;

/**
 * 加载文本样式
 */
const LoadingText = styled(motion.p)`
  color: #6b7280;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  text-align: center;
  background: rgba(139, 92, 246, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
`;

/**
 * 旋转动画配置
 */
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear' as const,
      repeat: Infinity
    }
  }
};

/**
 * 文本淡入淡出动画配置
 */
const textVariants = {
  initial: {
    opacity: 0.6
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeInOut' as const,
      repeat: Infinity,
      repeatType: 'reverse' as const
    }
  }
};

/**
 * LoadingSpinner - 拟态玻璃风格加载动画组件
 * 
 * @param size - 加载圆环尺寸（small/medium/large）
 * @param color - 加载圆环颜色（默认蓝色）
 * @param text - 加载提示文本（可选）
 * @param className - 自定义CSS类名
 * 
 * @example
 * <LoadingSpinner size="medium" text="加载中..." />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  text,
  className
}) => {
  return (
    <SpinnerContainer className={className}>
      <SpinnerRing
        $size={size}
        $color={color}
        variants={spinnerVariants}
        animate="animate"
      />
      {text && (
        <LoadingText
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          {text}
        </LoadingText>
      )}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;

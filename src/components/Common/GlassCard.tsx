import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * GlassCard组件属性接口
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: string;
  borderRadius?: string;
}

/**
 * 拟态玻璃风格卡片样式组件
 * 实现玻璃效果：半透明背景、背景模糊、边框和阴影
 */
const StyledGlassCard = styled(motion.div)<{
  $padding?: string;
  $borderRadius?: string;
}>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: ${props => props.$borderRadius || '20px'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: ${props => props.$padding || '20px'};
  transition: all 0.3s ease;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45);
    transform: translateY(-2px);
  }
`;

/**
 * 动画变体配置
 */
const cardVariants = {
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
  },
  hover: {
    scale: 1.02,
    transition: { 
      duration: 0.2 
    }
  }
};

/**
 * GlassCard - 拟态玻璃风格卡片组件
 * 
 * @param children - 子元素内容
 * @param className - 自定义CSS类名
 * @param onClick - 点击事件处理函数
 * @param padding - 内边距（默认20px）
 * @param borderRadius - 圆角半径（默认20px）
 * 
 * @example
 * <GlassCard>
 *   <h2>标题</h2>
 *   <p>内容</p>
 * </GlassCard>
 */
const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  onClick,
  padding,
  borderRadius
}) => {
  return (
    <StyledGlassCard
      className={className}
      onClick={onClick}
      $padding={padding}
      $borderRadius={borderRadius}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {children}
    </StyledGlassCard>
  );
};

export default GlassCard;

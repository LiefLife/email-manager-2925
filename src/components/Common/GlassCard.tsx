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
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.12) 100%),
    ${props => props.theme.glass.background};
  backdrop-filter: blur(${props => props.theme.glass.blur}) saturate(${props => props.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${props => props.theme.glass.blur}) saturate(${props => props.theme.glass.saturation});
  border-radius: ${props => props.$borderRadius || props.theme.radius.xl};
  border: ${props => props.theme.glass.border};
  box-shadow:
    ${props => props.theme.shadow.soft},
    ${props => props.theme.glass.highlight},
    ${props => props.theme.shadow.glow};
  padding: ${props => props.$padding || '20px'};
  transition: all 0.3s ease;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  &:hover {
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.10) 45%, rgba(255, 255, 255, 0.16) 100%),
      ${props => props.theme.glass.backgroundHover};
    border: ${props => props.theme.glass.borderStrong};
    box-shadow:
      ${props => props.theme.shadow.lift},
      ${props => props.theme.glass.highlight},
      ${props => props.theme.shadow.glow};
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

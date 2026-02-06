/**
 * 响应式容器组件
 * 根据窗口大小动态调整布局，防止内容溢出
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

/**
 * 响应式容器样式
 */
const StyledContainer = styled(motion.div)<{ $layoutMode: string }>`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: ${props => props.$layoutMode === 'mobile' ? 'column' : 'row'};
  padding: ${props => {
    switch (props.$layoutMode) {
      case 'mobile': return '8px';
      case 'tablet': return '12px';
      case 'desktop': return '16px';
      default: return '20px';
    }
  }};
  gap: ${props => {
    switch (props.$layoutMode) {
      case 'mobile': return '8px';
      case 'tablet': return '12px';
      default: return '16px';
    }
  }};
  box-sizing: border-box;
`;

/**
 * 响应式面板样式
 */
const StyledPanel = styled(motion.div)<{ 
  $layoutMode: string;
  $flex?: number;
  $minWidth?: string;
  $maxWidth?: string;
}>`
  flex: ${props => props.$flex || 1};
  min-width: ${props => props.$minWidth || '0'};
  max-width: ${props => props.$maxWidth || '100%'};
  height: ${props => props.$layoutMode === 'mobile' ? 'auto' : '100%'};
  overflow: auto;
  box-sizing: border-box;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

/**
 * 响应式容器组件Props
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 响应式容器组件
 * 
 * 功能：
 * - 根据窗口大小自动调整布局方向（移动端垂直，桌面端水平）
 * - 动态调整内边距和间距
 * - 防止内容溢出
 * 
 * @param props - 组件属性
 * @returns 响应式容器组件
 */
export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  const { layoutMode } = useResponsiveLayout();

  return (
    <StyledContainer
      $layoutMode={layoutMode}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </StyledContainer>
  );
}

/**
 * 响应式面板组件Props
 */
interface ResponsivePanelProps {
  children: React.ReactNode;
  flex?: number;
  minWidth?: string;
  maxWidth?: string;
  className?: string;
}

/**
 * 响应式面板组件
 * 
 * 功能：
 * - 可配置的flex布局
 * - 可设置最小/最大宽度
 * - 自动处理溢出（滚动）
 * - 自定义滚动条样式
 * 
 * @param props - 组件属性
 * @returns 响应式面板组件
 */
export function ResponsivePanel({ 
  children, 
  flex, 
  minWidth, 
  maxWidth, 
  className 
}: ResponsivePanelProps) {
  const { layoutMode } = useResponsiveLayout();

  return (
    <StyledPanel
      $layoutMode={layoutMode}
      $flex={flex}
      $minWidth={minWidth}
      $maxWidth={maxWidth}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </StyledPanel>
  );
}

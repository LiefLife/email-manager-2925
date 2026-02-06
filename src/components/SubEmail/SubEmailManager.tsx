/**
 * SubEmailManager组件
 * 子邮箱管理面板，集成子邮箱列表和生成按钮
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import CreateSubEmailButton from './CreateSubEmailButton';
import SubEmailList from './SubEmailList';
import SubEmailSettings, { SubEmailSettingsConfig } from './SubEmailSettings';
import type { SubEmail } from '../../types/subEmail.types';

/**
 * 管理器容器样式
 */
const ManagerContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
`;

/**
 * 标题区域样式
 */
const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
  position: relative;
`;

/**
 * 设置按钮样式
 */
const SettingsButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.7);
    transform: rotate(90deg);
  }
  
  &:active {
    transform: rotate(90deg) scale(0.95);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #6366f1;
  }
`;

/**
 * 主标题样式
 */
const MainTitle = styled.h2`
  color: #6366f1;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-align: center;
`;

/**
 * 副标题样式
 */
const Subtitle = styled.p`
  color: #6b7280;
  font-size: 12px;
  font-weight: 400;
  margin: 0;
  text-align: center;
  line-height: 1.4;
`;

/**
 * 操作区域样式
 */
const ActionSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

/**
 * 列表区域样式
 */
const ListSection = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

/**
 * 详情面板样式
 */
const DetailPanel = styled(motion.div)`
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px 0 rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
`;

/**
 * 详情标题样式
 */
const DetailTitle = styled.h4`
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

/**
 * 详情内容样式
 */
const DetailContent = styled.div`
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
  
  p {
    margin: 4px 0;
    word-break: break-all;
  }
  
  strong {
    color: #4b5563;
  }
`;

/**
 * 容器动画变体
 */
const containerVariants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
};

/**
 * 子元素动画变体
 */
const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeOut' as const
    }
  }
};

/**
 * 详情面板动画变体
 */
const detailVariants = {
  hidden: { 
    opacity: 0,
    height: 0,
    marginTop: 0
  },
  visible: { 
    opacity: 1,
    height: 'auto',
    marginTop: 16,
    transition: { 
      duration: 0.3,
      ease: 'easeOut' as const
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      duration: 0.2
    }
  }
};

/**
 * SubEmailManager组件属性接口
 */
interface SubEmailManagerProps {
  className?: string;
  isSettingsMode?: boolean;
  isSettingsOpen?: boolean;
  onCloseSettings?: () => void;
  onOpenSettings?: () => void;
}

/**
 * SubEmailManager - 子邮箱管理面板组件
 * 
 * 功能：
 * 1. 显示子邮箱管理面板
 * 2. 集成子邮箱生成按钮
 * 3. 集成子邮箱列表显示
 * 4. 支持查看子邮箱详情
 * 5. 提供生成设置功能
 * 
 * 需求: 4.1, 4.2
 * 
 * @param className - 自定义CSS类名
 * @param isSettingsMode - 是否为设置模式（仅显示设置弹窗）
 * @param isSettingsOpen - 设置弹窗是否打开
 * @param onCloseSettings - 关闭设置弹窗回调
 * @param onOpenSettings - 打开设置弹窗回调
 */
const SubEmailManager: React.FC<SubEmailManagerProps> = ({
  className,
  isSettingsMode = false,
  isSettingsOpen = false,
  onCloseSettings,
  onOpenSettings
}) => {
  const [selectedSubEmail, setSelectedSubEmail] = useState<SubEmail | null>(null);
  const [settings, setSettings] = useState<SubEmailSettingsConfig>({
    useRandomLength: true,
    fixedLength: 20,
    includeLetters: true,
    includeSymbols: false,
  });

  /**
   * 处理子邮箱生成成功
   * @param address 生成的子邮箱地址
   */
  const handleGenerateSuccess = (address: string) => {
    console.log('子邮箱生成成功:', address);
  };

  /**
   * 处理子邮箱生成失败
   * @param error 错误信息
   */
  const handleGenerateError = (error: string) => {
    console.error('子邮箱生成失败:', error);
  };

  /**
   * 处理子邮箱项点击
   * @param subEmail 被点击的子邮箱
   */
  const handleItemClick = (subEmail: SubEmail) => {
    // 如果点击的是当前选中的子邮箱，则取消选中
    if (selectedSubEmail?.address === subEmail.address) {
      setSelectedSubEmail(null);
    } else {
      setSelectedSubEmail(subEmail);
    }
  };

  /**
   * 处理设置保存
   * @param newSettings 新的设置
   */
  const handleSettingsSave = (newSettings: SubEmailSettingsConfig) => {
    setSettings(newSettings);
    // TODO: 保存设置到本地存储
  };

  // 如果是设置模式，只渲染设置弹窗
  if (isSettingsMode) {
    return (
      <SubEmailSettings
        isOpen={isSettingsOpen}
        onClose={onCloseSettings || (() => {})}
        settings={settings}
        onSave={handleSettingsSave}
        baseEmail="avemusica@2925.com"
      />
    );
  }

  return (
    <ManagerContainer
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <TitleSection>
          <SettingsButton onClick={onOpenSettings}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </SettingsButton>
          <MainTitle>子邮箱管理</MainTitle>
          <Subtitle>一键生成临时邮箱地址，保护您的隐私</Subtitle>
        </TitleSection>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ActionSection>
          <CreateSubEmailButton
            onSuccess={handleGenerateSuccess}
            onError={handleGenerateError}
            settings={settings}
          />
        </ActionSection>
      </motion.div>

      <motion.div variants={itemVariants} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ListSection>
          <SubEmailList onItemClick={handleItemClick} />
        </ListSection>
      </motion.div>

      {selectedSubEmail && (
        <DetailPanel
          variants={detailVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <DetailTitle>子邮箱详情</DetailTitle>
          <DetailContent>
            <p><strong>地址:</strong> {selectedSubEmail.address}</p>
            <p><strong>后缀:</strong> {selectedSubEmail.suffix}</p>
            <p><strong>状态:</strong> {selectedSubEmail.status}</p>
            <p><strong>创建时间:</strong> {new Date(selectedSubEmail.createdAt).toLocaleString('zh-CN')}</p>
          </DetailContent>
        </DetailPanel>
      )}
    </ManagerContainer>
  );
};

export default SubEmailManager;

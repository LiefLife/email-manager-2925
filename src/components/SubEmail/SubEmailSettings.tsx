/**
 * SubEmailSettings组件
 * 子邮箱生成设置弹窗
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 遮罩层样式
 */
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

/**
 * 弹窗容器样式
 */
const Modal = styled(motion.div)`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px 0 rgba(139, 92, 246, 0.2),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  padding: 24px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
`;

/**
 * 标题样式
 */
const Title = styled.h2`
  color: #6366f1;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
`;

/**
 * 设置项容器
 */
const SettingItem = styled.div`
  margin-bottom: 20px;
`;

/**
 * 设置项标签
 */
const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
`;

/**
 * 复选框样式
 */
const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6366f1;
`;

/**
 * 滑块容器
 */
const SliderContainer = styled.div`
  margin-top: 12px;
`;

/**
 * 滑块标签行
 */
const SliderLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

/**
 * 滑块标签
 */
const SliderLabel = styled.span`
  color: #6b7280;
  font-size: 13px;
`;

/**
 * 滑块值显示
 */
const SliderValue = styled.span`
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
`;

/**
 * 滑块样式
 */
const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #e0e7ff 0%, #6366f1 100%);
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.6);
    }
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.6);
    }
  }
`;

/**
 * 预览区域
 */
const PreviewSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: rgba(139, 92, 246, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
`;

/**
 * 预览标签
 */
const PreviewLabel = styled.div`
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
`;

/**
 * 预览内容
 */
const PreviewContent = styled.div`
  color: #1f2937;
  font-size: 13px;
  font-family: 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.6;
`;

/**
 * 按钮容器
 */
const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
`;

/**
 * 按钮样式
 */
const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: #6366f1;
    border: 1px solid rgba(139, 92, 246, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.7);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * 子邮箱设置接口
 */
export interface SubEmailSettingsConfig {
  useRandomLength: boolean;
  fixedLength: number;
  includeLetters: boolean;
  includeSymbols: boolean;
}

/**
 * 组件属性接口
 */
interface SubEmailSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SubEmailSettingsConfig;
  onSave: (settings: SubEmailSettingsConfig) => void;
  baseEmail: string;
}

/**
 * 生成预览邮箱地址
 */
const generatePreview = (baseEmail: string, settings: SubEmailSettingsConfig): string => {
  const [username, domain] = baseEmail.split('@');
  
  let suffix = '';
  const numbers = '0123456789';
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const symbols = '_-.';
  
  const length = settings.useRandomLength 
    ? Math.floor(Math.random() * 17) + 4 
    : settings.fixedLength;
  
  // 根据设置构建可用字符集
  let availableChars = '';
  
  if (settings.includeLetters) {
    availableChars += letters;
  }
  
  // 始终包含数字
  availableChars += numbers;
  
  if (settings.includeSymbols) {
    availableChars += symbols;
  }
  
  // 如果没有可用字符，至少使用数字
  if (availableChars.length === 0) {
    availableChars = numbers;
  }
  
  for (let i = 0; i < length; i++) {
    suffix += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
  }
  
  return `${username}${suffix}@${domain}`;
};

/**
 * SubEmailSettings - 子邮箱生成设置组件
 */
const SubEmailSettings: React.FC<SubEmailSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  baseEmail
}) => {
  const [localSettings, setLocalSettings] = useState<SubEmailSettingsConfig>(settings);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      setPreview(generatePreview(baseEmail, localSettings));
    }
  }, [isOpen, baseEmail, localSettings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <Modal
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Title>子邮箱生成设置</Title>

            <SettingItem>
              <SettingLabel>
                <Checkbox
                  type="checkbox"
                  checked={localSettings.useRandomLength}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    useRandomLength: e.target.checked
                  })}
                />
                使用随机长度 (4-20位)
              </SettingLabel>
            </SettingItem>

            {!localSettings.useRandomLength && (
              <SettingItem>
                <SliderContainer>
                  <SliderLabelRow>
                    <SliderLabel>固定长度:</SliderLabel>
                    <SliderValue>{localSettings.fixedLength}</SliderValue>
                  </SliderLabelRow>
                  <Slider
                    type="range"
                    min="4"
                    max="20"
                    value={localSettings.fixedLength}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      fixedLength: parseInt(e.target.value)
                    })}
                  />
                </SliderContainer>
              </SettingItem>
            )}

            <SettingItem>
              <SettingLabel>
                <Checkbox
                  type="checkbox"
                  checked={localSettings.includeLetters}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    includeLetters: e.target.checked
                  })}
                />
                包含字母
              </SettingLabel>
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <Checkbox
                  type="checkbox"
                  checked={localSettings.includeSymbols}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    includeSymbols: e.target.checked
                  })}
                />
                包含符号 (_ - .)
              </SettingLabel>
            </SettingItem>

            <PreviewSection>
              <PreviewLabel>效果预览:</PreviewLabel>
              <PreviewContent>{preview}</PreviewContent>
            </PreviewSection>

            <ButtonContainer>
              <Button $variant="secondary" onClick={onClose}>
                取消
              </Button>
              <Button $variant="primary" onClick={handleSave}>
                保存
              </Button>
            </ButtonContainer>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default SubEmailSettings;

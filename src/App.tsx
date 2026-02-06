/**
 * App主应用组件
 * 集成认证和邮件上下文，实现路由逻辑
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { EmailProvider, EmailContext } from './contexts/EmailContext';
import { SubEmailProvider } from './contexts/SubEmailContext';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import EmailList from './components/Email/EmailList';
import EmailDetail from './components/Email/EmailDetail';
import SubEmailManager from './components/SubEmail/SubEmailManager';
import LoadingSpinner from './components/Common/LoadingSpinner';
import AnimatedButton from './components/Common/AnimatedButton';

/**
 * 应用容器样式
 * 全屏白色背景+蓝紫渐变
 */
const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #ddd6fe 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
`;

/**
 * 主界面容器样式
 */
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

/**
 * 顶部导航栏样式
 */
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 2px 8px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
`;

/**
 * 应用标题样式
 */
const AppTitle = styled.h1`
  color: #6366f1;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

/**
 * 用户信息区域样式
 */
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

/**
 * 用户邮箱显示样式
 */
const UserEmail = styled.span`
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
`;

/**
 * 内容区域样式
 * 三栏布局：子邮箱管理 | 邮件列表 | 邮件详情
 */
const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 12px;
  padding: 12px;
  min-height: 0;
`;

/**
 * 左侧面板样式 - 子邮箱管理
 */
const LeftPanel = styled.div`
  width: 280px;
  min-width: 240px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px 0 rgba(139, 92, 246, 0.15),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
`;

/**
 * 中间面板样式 - 邮件列表
 */
const MiddlePanel = styled.div`
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px 0 rgba(139, 92, 246, 0.15),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
`;

/**
 * 右侧面板样式 - 邮件详情
 */
const RightPanel = styled.div`
  width: 400px;
  min-width: 320px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px 0 rgba(139, 92, 246, 0.15),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
`;

/**
 * 加载容器样式
 */
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

/**
 * MainApp内部组件
 * 处理认证状态和路由逻辑
 */
const MainApp: React.FC = () => {
  const { isAuthenticated, loading, session, logout } = useAuth();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  /**
   * 更新实时时间
   */
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /**
   * 格式化时间显示
   */
  const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  /**
   * 处理邮件选择
   * @param emailId 邮件ID
   */
  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  /**
   * 从EmailContext获取选中的邮件对象
   */
  const emailContext = React.useContext(EmailContext);
  const selectedEmail = selectedEmailId 
    ? emailContext?.list.find(e => e.id === selectedEmailId) || null
    : null;

  /**
   * 显示加载状态
   */
  if (loading) {
    return (
      <AppContainer>
        <LoadingContainer>
          <LoadingSpinner size="large" text="加载中..." />
        </LoadingContainer>
      </AppContainer>
    );
  }

  /**
   * 未认证 - 显示登录界面
   */
  if (!isAuthenticated) {
    return (
      <AppContainer>
        <LoginForm />
      </AppContainer>
    );
  }

  /**
   * 已认证 - 显示主界面
   */
  return (
    <AppContainer>
      <MainContainer>
        {/* 顶部导航栏 */}
        <TopBar>
          <AppTitle>{formatTime(currentTime)}</AppTitle>
          <UserInfo>
            <UserEmail>{session?.email}</UserEmail>
            <AnimatedButton
              variant="secondary"
              size="small"
              onClick={handleLogout}
            >
              登出
            </AnimatedButton>
          </UserInfo>
        </TopBar>

        {/* 主内容区域 - 三栏布局 */}
        <ContentArea>
          {/* 左侧：子邮箱管理面板 */}
          <LeftPanel>
            <SubEmailManager onOpenSettings={() => setIsSettingsOpen(true)} />
          </LeftPanel>

          {/* 中间：邮件列表 */}
          <MiddlePanel>
            <EmailList
              selectedEmailId={selectedEmailId || undefined}
              onEmailSelect={handleEmailSelect}
              refreshInterval={5000}
            />
          </MiddlePanel>

          {/* 右侧：邮件详情 */}
          <RightPanel>
            <EmailDetail email={selectedEmail} />
          </RightPanel>
        </ContentArea>

        {/* 设置弹窗 - 全局覆盖 */}
        <SubEmailManager 
          isSettingsMode 
          isSettingsOpen={isSettingsOpen}
          onCloseSettings={() => setIsSettingsOpen(false)}
        />
      </MainContainer>
    </AppContainer>
  );
};

/**
 * App根组件
 * 提供所有必需的Context Provider
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <EmailProvider>
        <SubEmailProvider>
          <MainApp />
        </SubEmailProvider>
      </EmailProvider>
    </AuthProvider>
  );
};

export default App;

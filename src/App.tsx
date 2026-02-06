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
  background: transparent;
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
  background: ${p => p.theme.glass.backgroundStrong};
  backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  border-bottom: ${p => p.theme.glass.border};
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.08),
    ${p => p.theme.glass.highlight},
    ${p => p.theme.shadow.glow};
  flex-shrink: 0;
`;

/**
 * 应用标题样式
 */
const AppTitle = styled.h1`
  color: ${p => p.theme.colors.text.primary};
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
  color: ${p => p.theme.colors.text.secondary};
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
  background: ${p => p.theme.glass.background};
  backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  border-radius: ${p => p.theme.radius.xl};
  border: ${p => p.theme.glass.border};
  box-shadow:
    ${p => p.theme.shadow.soft},
    ${p => p.theme.glass.highlight},
    ${p => p.theme.shadow.glow};
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
  background: ${p => p.theme.glass.background};
  backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  border-radius: ${p => p.theme.radius.xl};
  border: ${p => p.theme.glass.border};
  box-shadow:
    ${p => p.theme.shadow.soft},
    ${p => p.theme.glass.highlight},
    ${p => p.theme.shadow.glow};
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
  background: ${p => p.theme.glass.background};
  backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  -webkit-backdrop-filter: blur(${p => p.theme.glass.blur}) saturate(${p => p.theme.glass.saturation});
  border-radius: ${p => p.theme.radius.xl};
  border: ${p => p.theme.glass.border};
  box-shadow:
    ${p => p.theme.shadow.soft},
    ${p => p.theme.glass.highlight},
    ${p => p.theme.shadow.glow};
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
 * 时钟组件 - 独立渲染避免影响父组件
 */
const Clock: React.FC = React.memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return <AppTitle>{formatTime(currentTime)}</AppTitle>;
});

Clock.displayName = 'Clock';

/**
 * MainApp内部组件
 * 处理认证状态和路由逻辑
 */
const MainApp: React.FC = () => {
  const { isAuthenticated, loading, session, logout } = useAuth();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /**
   * 处理登出 - 使用useCallback避免重复创建
   */
  const handleLogout = React.useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  }, [logout]);

  /**
   * 处理邮件选择 - 使用useCallback避免重复创建
   * @param emailId 邮件ID
   */
  const handleEmailSelect = React.useCallback((emailId: string) => {
    setSelectedEmailId(emailId);
  }, []);

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
          <Clock />
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
              refreshInterval={10000}
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

/**
 * 应用主组件示例
 * 展示如何集成应用生命周期管理功能
 */

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SubEmailProvider } from './contexts/SubEmailContext';
import { AppInitializer } from './components/App/AppInitializer';
import { useBeforeUnload } from './hooks/useBeforeUnload';
import { useTauriWindowEvents } from './hooks/useTauriWindowEvents';
import { useSystemTray } from './hooks/useSystemTray';

/**
 * 应用内容组件
 * 包含实际的应用UI
 */
const AppContent: React.FC = () => {
  // 使用应用关闭前处理Hook
  useBeforeUnload();
  
  // 使用Tauri窗口事件监听Hook
  useTauriWindowEvents();
  
  // 使用系统托盘控制Hook
  const { showWindow, hideWindow, toggleWindow } = useSystemTray();

  return (
    <div>
      <h1>2925邮箱管理系统</h1>
      <div>
        <button onClick={showWindow}>显示窗口</button>
        <button onClick={hideWindow}>隐藏窗口</button>
        <button onClick={toggleWindow}>切换窗口</button>
      </div>
      {/* 其他应用内容 */}
    </div>
  );
};

/**
 * 应用主组件
 * 集成所有Context和生命周期管理
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <SubEmailProvider>
        <AppInitializer
          onInitialized={() => {
            console.log('应用初始化完成');
          }}
        >
          <AppContent />
        </AppInitializer>
      </SubEmailProvider>
    </AuthProvider>
  );
};

export default App;

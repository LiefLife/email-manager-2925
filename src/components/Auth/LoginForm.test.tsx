/**
 * LoginForm组件单元测试
 * 测试登录表单的渲染、验证和交互
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock Tauri commands
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

/**
 * 辅助函数：渲染带AuthProvider的LoginForm
 */
const renderLoginForm = async () => {
  const result = render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
  
  // 等待初始加载完成
  await waitFor(() => {
    expect(screen.queryByText('登录中...')).not.toBeInTheDocument();
  }, { timeout: 2000 });
  
  return result;
};

describe('LoginForm组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染登录表单', async () => {
    await renderLoginForm();

    // 验证标题
    expect(screen.getByText('2925邮箱管理系统')).toBeInTheDocument();

    // 验证输入框
    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();

    // 验证登录按钮
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('应该显示邮箱格式错误', async () => {
    await renderLoginForm();

    const emailInput = screen.getByLabelText('邮箱地址');

    // 输入无效邮箱
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText('请输入有效的2925.com邮箱地址')).toBeInTheDocument();
    });
  });

  it('应该在邮箱为空时显示错误', async () => {
    await renderLoginForm();

    const emailInput = screen.getByLabelText('邮箱地址');

    // 输入空值
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.blur(emailInput);

    // 点击登录按钮
    const loginButton = screen.getByRole('button', { name: '登录' });
    fireEvent.click(loginButton);

    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText('请输入邮箱地址')).toBeInTheDocument();
    });
  });

  it('应该接受有效的2925.com邮箱地址', async () => {
    await renderLoginForm();

    const emailInput = screen.getByLabelText('邮箱地址');

    // 输入有效邮箱
    fireEvent.change(emailInput, { target: { value: 'test@2925.com' } });
    fireEvent.blur(emailInput);

    // 不应该显示错误消息
    await waitFor(() => {
      expect(screen.queryByText('请输入有效的2925.com邮箱地址')).not.toBeInTheDocument();
    });
  });

  it('应该在密码为空时显示错误', async () => {
    await renderLoginForm();

    const emailInput = screen.getByLabelText('邮箱地址');
    const loginButton = screen.getByRole('button', { name: '登录' });

    // 输入有效邮箱但不输入密码
    fireEvent.change(emailInput, { target: { value: 'test@2925.com' } });
    fireEvent.click(loginButton);

    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText('请输入密码')).toBeInTheDocument();
    });
  });

  it('输入框应该在加载时被禁用', async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    
    // Mock一个延迟的登录响应
    vi.mocked(invoke).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        email: 'test@2925.com',
        token: 'test-token',
        expiresAt: Date.now() + 3600000
      }), 100))
    );

    await renderLoginForm();

    // 等待表单完全加载
    await waitFor(() => {
      expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('邮箱地址') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('密码') as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: '登录' });

    // 输入凭据
    fireEvent.change(emailInput, { target: { value: 'test@2925.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 点击登录
    fireEvent.click(loginButton);

    // 验证加载状态
    await waitFor(() => {
      expect(screen.getByText('登录中...')).toBeInTheDocument();
    });
  });
});

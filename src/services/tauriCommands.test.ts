/**
 * Tauri命令封装测试
 * 测试类型安全和错误处理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TauriCommandError, authCommands, emailCommands, storageCommands } from './tauriCommands';
import type { LoginCredentials, AuthSession } from '../types/auth.types';
import type { SubEmail } from '../types/subEmail.types';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('TauriCommandError', () => {
  it('应该创建带有命令名称的错误', () => {
    const error = new TauriCommandError('测试错误', 'test_command');
    expect(error.message).toBe('测试错误');
    expect(error.command).toBe('test_command');
    expect(error.name).toBe('TauriCommandError');
  });

  it('应该保存原始错误', () => {
    const originalError = new Error('原始错误');
    const error = new TauriCommandError('测试错误', 'test_command', originalError);
    expect(error.originalError).toBe(originalError);
  });
});

describe('authCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('应该成功调用登录命令', async () => {
      const credentials: LoginCredentials = {
        email: 'test@2925.com',
        password: 'password123',
      };
      const mockSession: AuthSession = {
        email: 'test@2925.com',
        token: 'mock_token',
        expiresAt: Date.now() + 3600000,
      };

      mockInvoke.mockResolvedValueOnce(mockSession);

      const result = await authCommands.login(credentials);

      expect(mockInvoke).toHaveBeenCalledWith('login', {
        email: credentials.email,
        password: credentials.password,
      });
      expect(result).toEqual(mockSession);
    });

    it('应该在登录失败时抛出TauriCommandError', async () => {
      const credentials: LoginCredentials = {
        email: 'test@2925.com',
        password: 'wrong_password',
      };

      mockInvoke.mockRejectedValue(new Error('Invalid credentials'));

      await expect(authCommands.login(credentials)).rejects.toThrow(TauriCommandError);
      await expect(authCommands.login(credentials)).rejects.toThrow('登录失败');
    });
  });

  describe('logout', () => {
    it('应该成功调用登出命令', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      await authCommands.logout();

      expect(mockInvoke).toHaveBeenCalledWith('logout');
    });

    it('应该在登出失败时抛出TauriCommandError', async () => {
      mockInvoke.mockRejectedValue(new Error('Logout failed'));

      await expect(authCommands.logout()).rejects.toThrow(TauriCommandError);
      await expect(authCommands.logout()).rejects.toThrow('登出失败');
    });
  });
});

describe('emailCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEmails', () => {
    it('应该成功获取邮件列表', async () => {
      const mockEmails = [
        {
          id: '1',
          from: 'sender@example.com',
          to: 'test@2925.com',
          subject: 'Test Email',
          body: 'Test body',
          timestamp: Date.now(),
          isRead: false,
          isSubEmailForwarded: false,
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockEmails);

      const result = await emailCommands.fetchEmails();

      expect(mockInvoke).toHaveBeenCalledWith('fetch_emails');
      expect(result).toEqual(mockEmails);
    });

    it('应该在获取邮件失败时抛出TauriCommandError', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));

      await expect(emailCommands.fetchEmails()).rejects.toThrow(TauriCommandError);
      await expect(emailCommands.fetchEmails()).rejects.toThrow('获取邮件失败');
    });
  });

  describe('sendEmail', () => {
    it('应该成功发送邮件', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      await emailCommands.sendEmail('recipient@example.com', 'Subject', 'Body');

      expect(mockInvoke).toHaveBeenCalledWith('send_email', {
        to: 'recipient@example.com',
        subject: 'Subject',
        body: 'Body',
      });
    });

    it('应该在发送邮件失败时抛出TauriCommandError', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(
        emailCommands.sendEmail('recipient@example.com', 'Subject', 'Body')
      ).rejects.toThrow(TauriCommandError);
    });
  });
});

describe('storageCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveSession', () => {
    it('应该成功保存会话', async () => {
      const mockSession: AuthSession = {
        email: 'test@2925.com',
        token: 'mock_token',
        expiresAt: Date.now() + 3600000,
      };

      mockInvoke.mockResolvedValueOnce(undefined);

      await storageCommands.saveSession(mockSession);

      expect(mockInvoke).toHaveBeenCalledWith('save_session', { session: mockSession });
    });

    it('应该在保存会话失败时抛出TauriCommandError', async () => {
      const mockSession: AuthSession = {
        email: 'test@2925.com',
        token: 'mock_token',
        expiresAt: Date.now() + 3600000,
      };

      mockInvoke.mockRejectedValueOnce(new Error('Storage error'));

      await expect(storageCommands.saveSession(mockSession)).rejects.toThrow(TauriCommandError);
    });
  });

  describe('loadSession', () => {
    it('应该成功加载会话', async () => {
      const mockSession: AuthSession = {
        email: 'test@2925.com',
        token: 'mock_token',
        expiresAt: Date.now() + 3600000,
      };

      mockInvoke.mockResolvedValueOnce(mockSession);

      const result = await storageCommands.loadSession();

      expect(mockInvoke).toHaveBeenCalledWith('load_session');
      expect(result).toEqual(mockSession);
    });

    it('应该在没有会话时返回null', async () => {
      mockInvoke.mockResolvedValueOnce(null);

      const result = await storageCommands.loadSession();

      expect(result).toBeNull();
    });
  });

  describe('saveSubEmails', () => {
    it('应该成功保存子邮箱列表', async () => {
      const mockSubEmails: SubEmail[] = [
        {
          address: 'testABC@2925.com',
          suffix: 'ABC',
          createdAt: Date.now(),
          status: 'active',
        },
      ];

      mockInvoke.mockResolvedValueOnce(undefined);

      await storageCommands.saveSubEmails(mockSubEmails);

      expect(mockInvoke).toHaveBeenCalledWith('save_sub_emails', { subEmails: mockSubEmails });
    });
  });

  describe('loadSubEmails', () => {
    it('应该成功加载子邮箱列表', async () => {
      const mockSubEmails: SubEmail[] = [
        {
          address: 'testABC@2925.com',
          suffix: 'ABC',
          createdAt: Date.now(),
          status: 'active',
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockSubEmails);

      const result = await storageCommands.loadSubEmails();

      expect(mockInvoke).toHaveBeenCalledWith('load_sub_emails');
      expect(result).toEqual(mockSubEmails);
    });

    it('应该在没有子邮箱时返回空数组', async () => {
      mockInvoke.mockResolvedValueOnce([]);

      const result = await storageCommands.loadSubEmails();

      expect(result).toEqual([]);
    });
  });
});

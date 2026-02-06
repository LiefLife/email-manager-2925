/**
 * ErrorHandler使用示例
 * 展示如何在应用中使用统一错误处理
 */

import ErrorHandler from './errorHandler';
import { tauriCommands } from '../services/tauriCommands';

/**
 * 示例1: 处理网络错误
 */
async function exampleNetworkError() {
  try {
    await tauriCommands.email.fetchEmails();
  } catch (error) {
    // 统一错误处理会自动分类、记录日志并执行重试策略
    await ErrorHandler.handle(error as Error, 'fetchEmails');
  }
}

/**
 * 示例2: 处理认证错误
 */
async function exampleAuthError() {
  try {
    await tauriCommands.auth.login({
      email: 'user@2925.com',
      password: 'wrongpassword',
    });
  } catch (error) {
    // 认证错误会自动清除会话并重定向到登录页
    await ErrorHandler.handle(error as Error, 'login');
  }
}

/**
 * 示例3: 处理存储错误
 */
async function exampleStorageError() {
  try {
    await tauriCommands.storage.saveSession({
      email: 'user@2925.com',
      token: 'token123',
      expiresAt: Date.now() + 3600000,
    });
  } catch (error) {
    // 存储错误会尝试降级到内存存储
    await ErrorHandler.handle(error as Error, 'saveSession');
  }
}

/**
 * 示例4: 在React组件中使用
 */
/*
import { useEffect } from 'react';
import ErrorHandler from '../utils/errorHandler';
import { tauriCommands } from '../services/tauriCommands';

function EmailListComponent() {
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const emails = await tauriCommands.email.fetchEmails();
        // 处理邮件...
      } catch (error) {
        await ErrorHandler.handle(error as Error, 'EmailListComponent.fetchEmails');
      }
    };

    fetchEmails();
  }, []);

  return <div>Email List</div>;
}
*/

/**
 * 示例5: 重置重试计数器
 */
function exampleResetRetry() {
  // 当操作成功后，重置重试计数器
  ErrorHandler.resetRetryCount('fetchEmails');
}

/**
 * 示例6: 获取当前重试次数
 */
function exampleGetRetryCount() {
  const retries = ErrorHandler.getRetryCount('fetchEmails');
  console.log(`Current retry count: ${retries}`);
}

export {
  exampleNetworkError,
  exampleAuthError,
  exampleStorageError,
  exampleResetRetry,
  exampleGetRetryCount,
};

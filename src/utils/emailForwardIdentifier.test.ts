/**
 * 邮件转发识别测试
 * 测试子邮箱转发邮件的识别功能
 */

import { describe, it, expect } from 'vitest';
import {
  identifyForwardedEmails,
  isEmailForwarded,
  getSubEmailForEmail,
  groupEmailsBySubEmail,
} from './emailForwardIdentifier';
import type { Email } from '../types/email.types';
import type { SubEmail } from '../types/subEmail.types';

describe('identifyForwardedEmails', () => {
  const mockSubEmails: SubEmail[] = [
    {
      address: 'userABC@2925.com',
      suffix: 'ABC',
      createdAt: Date.now(),
      status: 'active',
    },
    {
      address: 'userXYZ@2925.com',
      suffix: 'XYZ',
      createdAt: Date.now(),
      status: 'active',
    },
  ];

  it('应该正确标识转发到子邮箱的邮件', () => {
    const emails: Email[] = [
      {
        id: '1',
        from: 'sender@example.com',
        to: 'userABC@2925.com',
        subject: 'Test',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
    ];

    const result = identifyForwardedEmails(emails, mockSubEmails);

    expect(result[0].isSubEmailForwarded).toBe(true);
    expect(result[0].originalSubEmail).toBe('userABC@2925.com');
  });

  it('应该正确标识非转发邮件', () => {
    const emails: Email[] = [
      {
        id: '1',
        from: 'sender@example.com',
        to: 'user@2925.com',
        subject: 'Test',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
    ];

    const result = identifyForwardedEmails(emails, mockSubEmails);

    expect(result[0].isSubEmailForwarded).toBe(false);
    expect(result[0].originalSubEmail).toBeUndefined();
  });

  it('应该处理空邮件列表', () => {
    const result = identifyForwardedEmails([], mockSubEmails);
    expect(result).toEqual([]);
  });

  it('应该处理空子邮箱列表', () => {
    const emails: Email[] = [
      {
        id: '1',
        from: 'sender@example.com',
        to: 'user@2925.com',
        subject: 'Test',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
    ];

    const result = identifyForwardedEmails(emails, []);

    expect(result[0].isSubEmailForwarded).toBe(false);
  });

  it('应该不区分大小写', () => {
    const emails: Email[] = [
      {
        id: '1',
        from: 'sender@example.com',
        to: 'USERABC@2925.COM',
        subject: 'Test',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
    ];

    const result = identifyForwardedEmails(emails, mockSubEmails);

    expect(result[0].isSubEmailForwarded).toBe(true);
  });
});

describe('isEmailForwarded', () => {
  const mockSubEmails: SubEmail[] = [
    {
      address: 'userABC@2925.com',
      suffix: 'ABC',
      createdAt: Date.now(),
      status: 'active',
    },
  ];

  it('应该对转发邮件返回true', () => {
    const email: Email = {
      id: '1',
      from: 'sender@example.com',
      to: 'userABC@2925.com',
      subject: 'Test',
      body: 'Body',
      timestamp: Date.now(),
      isRead: false,
      isSubEmailForwarded: false,
    };

    expect(isEmailForwarded(email, mockSubEmails)).toBe(true);
  });

  it('应该对非转发邮件返回false', () => {
    const email: Email = {
      id: '1',
      from: 'sender@example.com',
      to: 'user@2925.com',
      subject: 'Test',
      body: 'Body',
      timestamp: Date.now(),
      isRead: false,
      isSubEmailForwarded: false,
    };

    expect(isEmailForwarded(email, mockSubEmails)).toBe(false);
  });
});

describe('getSubEmailForEmail', () => {
  const mockSubEmails: SubEmail[] = [
    {
      address: 'userABC@2925.com',
      suffix: 'ABC',
      createdAt: Date.now(),
      status: 'active',
    },
  ];

  it('应该返回对应的子邮箱信息', () => {
    const email: Email = {
      id: '1',
      from: 'sender@example.com',
      to: 'userABC@2925.com',
      subject: 'Test',
      body: 'Body',
      timestamp: Date.now(),
      isRead: false,
      isSubEmailForwarded: false,
    };

    const result = getSubEmailForEmail(email, mockSubEmails);

    expect(result).toBeDefined();
    expect(result?.address).toBe('userABC@2925.com');
    expect(result?.suffix).toBe('ABC');
  });

  it('应该对非转发邮件返回undefined', () => {
    const email: Email = {
      id: '1',
      from: 'sender@example.com',
      to: 'user@2925.com',
      subject: 'Test',
      body: 'Body',
      timestamp: Date.now(),
      isRead: false,
      isSubEmailForwarded: false,
    };

    const result = getSubEmailForEmail(email, mockSubEmails);

    expect(result).toBeUndefined();
  });
});

describe('groupEmailsBySubEmail', () => {
  const mockSubEmails: SubEmail[] = [
    {
      address: 'userABC@2925.com',
      suffix: 'ABC',
      createdAt: Date.now(),
      status: 'active',
    },
    {
      address: 'userXYZ@2925.com',
      suffix: 'XYZ',
      createdAt: Date.now(),
      status: 'active',
    },
  ];

  it('应该按子邮箱分组邮件', () => {
    const emails: Email[] = [
      {
        id: '1',
        from: 'sender@example.com',
        to: 'userABC@2925.com',
        subject: 'Test 1',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
      {
        id: '2',
        from: 'sender@example.com',
        to: 'userABC@2925.com',
        subject: 'Test 2',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
      {
        id: '3',
        from: 'sender@example.com',
        to: 'userXYZ@2925.com',
        subject: 'Test 3',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
    ];

    const result = groupEmailsBySubEmail(emails, mockSubEmails);

    expect(result.get('userABC@2925.com')?.length).toBe(2);
    expect(result.get('userXYZ@2925.com')?.length).toBe(1);
  });

  it('应该为没有邮件的子邮箱创建空数组', () => {
    const emails: Email[] = [];

    const result = groupEmailsBySubEmail(emails, mockSubEmails);

    expect(result.get('userABC@2925.com')).toEqual([]);
    expect(result.get('userXYZ@2925.com')).toEqual([]);
  });

  it('应该忽略非子邮箱的邮件', () => {
    const emails: Email[] = [
      {
        id: '1',
        from: 'sender@example.com',
        to: 'user@2925.com',
        subject: 'Test',
        body: 'Body',
        timestamp: Date.now(),
        isRead: false,
        isSubEmailForwarded: false,
      },
    ];

    const result = groupEmailsBySubEmail(emails, mockSubEmails);

    expect(result.get('userABC@2925.com')).toEqual([]);
    expect(result.get('userXYZ@2925.com')).toEqual([]);
  });
});

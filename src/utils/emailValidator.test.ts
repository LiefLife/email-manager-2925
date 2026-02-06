/**
 * 邮箱验证工具测试
 * 测试邮箱地址格式验证功能
 */

import { describe, it, expect } from 'vitest';
import { validateEmail, extractUsername, extractDomain } from './emailValidator';

describe('validateEmail', () => {
  it('应该接受有效的2925.com邮箱地址', () => {
    expect(validateEmail('user@2925.com')).toBe(true);
    expect(validateEmail('test123@2925.com')).toBe(true);
    expect(validateEmail('ABC@2925.com')).toBe(true);
    expect(validateEmail('user123ABC@2925.com')).toBe(true);
  });

  it('应该拒绝非2925.com域名', () => {
    expect(validateEmail('user@gmail.com')).toBe(false);
    expect(validateEmail('user@example.com')).toBe(false);
    expect(validateEmail('user@2925.net')).toBe(false);
  });

  it('应该拒绝包含特殊字符的用户名', () => {
    expect(validateEmail('user.name@2925.com')).toBe(false);
    expect(validateEmail('user-name@2925.com')).toBe(false);
    expect(validateEmail('user_name@2925.com')).toBe(false);
    expect(validateEmail('user@name@2925.com')).toBe(false);
  });

  it('应该拒绝空或无效输入', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('   ')).toBe(false);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@2925.com')).toBe(false);
  });

  it('应该拒绝没有@符号的地址', () => {
    expect(validateEmail('user2925.com')).toBe(false);
  });
});

describe('extractUsername', () => {
  it('应该从有效邮箱中提取用户名', () => {
    expect(extractUsername('user@2925.com')).toBe('user');
    expect(extractUsername('test123@2925.com')).toBe('test123');
    expect(extractUsername('ABC@2925.com')).toBe('ABC');
  });

  it('应该对无效邮箱返回null', () => {
    expect(extractUsername('invalid@gmail.com')).toBeNull();
    expect(extractUsername('invalid')).toBeNull();
    expect(extractUsername('')).toBeNull();
  });
});

describe('extractDomain', () => {
  it('应该从有效邮箱中提取域名', () => {
    expect(extractDomain('user@2925.com')).toBe('2925.com');
    expect(extractDomain('test123@2925.com')).toBe('2925.com');
  });

  it('应该对无效邮箱返回null', () => {
    expect(extractDomain('invalid@gmail.com')).toBeNull();
    expect(extractDomain('invalid')).toBeNull();
    expect(extractDomain('')).toBeNull();
  });
});

/**
 * 后缀生成器测试
 * 测试子邮箱后缀生成功能
 */

import { describe, it, expect } from 'vitest';
import { generateSuffix, generateRandomLengthSuffix, validateSuffix } from './suffixGenerator';

describe('generateSuffix', () => {
  it('应该生成指定长度的后缀', () => {
    expect(generateSuffix(5).length).toBe(5);
    expect(generateSuffix(10).length).toBe(10);
    expect(generateSuffix(20).length).toBe(20);
    expect(generateSuffix(1).length).toBe(1);
  });

  it('应该只包含字母和数字', () => {
    const validCharsRegex = /^[A-Za-z0-9]+$/;
    
    for (let i = 0; i < 10; i++) {
      const suffix = generateSuffix(15);
      expect(suffix).toMatch(validCharsRegex);
    }
  });

  it('应该在长度无效时抛出错误', () => {
    expect(() => generateSuffix(0)).toThrow('后缀长度必须在1-20之间');
    expect(() => generateSuffix(21)).toThrow('后缀长度必须在1-20之间');
    expect(() => generateSuffix(-1)).toThrow('后缀长度必须在1-20之间');
    expect(() => generateSuffix(1.5)).toThrow('后缀长度必须在1-20之间');
  });

  it('应该生成不同的后缀（随机性）', () => {
    const suffixes = new Set<string>();
    
    for (let i = 0; i < 20; i++) {
      suffixes.add(generateSuffix(10));
    }
    
    // 20次生成应该至少有15个不同的结果
    expect(suffixes.size).toBeGreaterThan(15);
  });
});

describe('generateRandomLengthSuffix', () => {
  it('应该生成长度在1-20之间的后缀', () => {
    for (let i = 0; i < 10; i++) {
      const suffix = generateRandomLengthSuffix();
      expect(suffix.length).toBeGreaterThanOrEqual(1);
      expect(suffix.length).toBeLessThanOrEqual(20);
    }
  });

  it('应该只包含字母和数字', () => {
    const validCharsRegex = /^[A-Za-z0-9]+$/;
    
    for (let i = 0; i < 10; i++) {
      const suffix = generateRandomLengthSuffix();
      expect(suffix).toMatch(validCharsRegex);
    }
  });
});

describe('validateSuffix', () => {
  it('应该接受有效的后缀', () => {
    expect(validateSuffix('ABC')).toBe(true);
    expect(validateSuffix('abc123')).toBe(true);
    expect(validateSuffix('A')).toBe(true);
    expect(validateSuffix('12345678901234567890')).toBe(true); // 20个字符
  });

  it('应该拒绝长度无效的后缀', () => {
    expect(validateSuffix('')).toBe(false);
    expect(validateSuffix('123456789012345678901')).toBe(false); // 21个字符
  });

  it('应该拒绝包含特殊字符的后缀', () => {
    expect(validateSuffix('abc-123')).toBe(false);
    expect(validateSuffix('abc_123')).toBe(false);
    expect(validateSuffix('abc.123')).toBe(false);
    expect(validateSuffix('abc@123')).toBe(false);
  });

  it('应该拒绝空或无效输入', () => {
    expect(validateSuffix('')).toBe(false);
    expect(validateSuffix('   ')).toBe(false);
  });
});

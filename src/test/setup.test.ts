/**
 * 测试环境验证
 * 确保测试框架正确配置
 */
import { describe, it, expect } from 'vitest';

describe('测试环境验证', () => {
  it('基础断言应该工作', () => {
    expect(true).toBe(true);
  });

  it('数学运算应该正确', () => {
    expect(1 + 1).toBe(2);
  });
});

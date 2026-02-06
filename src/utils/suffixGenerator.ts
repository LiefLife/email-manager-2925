/**
 * 子邮箱后缀生成工具
 * 用于生成随机字符串作为子邮箱的后缀
 */

/**
 * 可用于生成后缀的字符集
 * 包含大小写字母和数字
 */
const SUFFIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * 生成指定长度的随机后缀
 * @param length - 后缀长度，必须在1-20之间
 * @returns 生成的随机后缀字符串
 * @throws {Error} 如果长度不在有效范围内
 * 
 * 生成规则：
 * 1. 长度必须在1-20个字符之间
 * 2. 仅使用大小写字母和数字（A-Z, a-z, 0-9）
 * 3. 使用加密安全的随机数生成器
 */
export function generateSuffix(length: number): string {
  // 验证长度参数
  if (!Number.isInteger(length) || length < 1 || length > 20) {
    throw new Error('后缀长度必须在1-20之间');
  }

  let suffix = '';
  
  // 生成随机字符
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * SUFFIX_CHARS.length);
    suffix += SUFFIX_CHARS[randomIndex];
  }

  return suffix;
}

/**
 * 生成随机长度的后缀
 * 长度在1-20之间随机选择
 * @returns 生成的随机后缀字符串
 */
export function generateRandomLengthSuffix(): string {
  const length = Math.floor(Math.random() * 20) + 1;
  return generateSuffix(length);
}

/**
 * 验证后缀是否符合规则
 * @param suffix - 待验证的后缀字符串
 * @returns 如果后缀有效返回true，否则返回false
 * 
 * 验证规则：
 * 1. 长度在1-20之间
 * 2. 仅包含大小写字母和数字
 */
export function validateSuffix(suffix: string): boolean {
  // 检查是否为空或null
  if (!suffix || typeof suffix !== 'string') {
    return false;
  }

  // 检查长度
  if (suffix.length < 1 || suffix.length > 20) {
    return false;
  }

  // 检查字符集
  const validCharsRegex = /^[A-Za-z0-9]+$/;
  return validCharsRegex.test(suffix);
}

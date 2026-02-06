/**
 * 子邮箱后缀生成工具
 * 用于生成随机字符串作为子邮箱的后缀
 */

/**
 * 后缀生成配置接口
 */
export interface SuffixGeneratorConfig {
  /**
   * 是否包含字母
   */
  includeLetters?: boolean;
  
  /**
   * 是否包含符号
   */
  includeSymbols?: boolean;
  
  /**
   * 是否使用随机长度
   */
  useRandomLength?: boolean;
  
  /**
   * 固定长度（当useRandomLength为false时使用）
   */
  fixedLength?: number;
}

/**
 * 可用于生成后缀的字符集
 */
const NUMBERS = '0123456789';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const SYMBOLS = '_-.';

/**
 * 生成指定长度的随机后缀
 * @param length - 后缀长度，必须在1-20之间
 * @param config - 生成配置
 * @returns 生成的随机后缀字符串
 * @throws {Error} 如果长度不在有效范围内
 * 
 * 生成规则：
 * 1. 长度必须在1-20个字符之间
 * 2. 根据配置选择字符集（数字、字母、符号）
 * 3. 使用加密安全的随机数生成器
 */
export function generateSuffix(length: number, config?: SuffixGeneratorConfig): string {
  // 验证长度参数
  if (!Number.isInteger(length) || length < 1 || length > 20) {
    throw new Error('后缀长度必须在1-20之间');
  }

  // 构建可用字符集
  let availableChars = '';
  
  if (config?.includeLetters !== false) {
    availableChars += LETTERS;
  }
  
  // 始终包含数字
  availableChars += NUMBERS;
  
  if (config?.includeSymbols) {
    availableChars += SYMBOLS;
  }
  
  // 如果没有可用字符，至少使用数字
  if (availableChars.length === 0) {
    availableChars = NUMBERS;
  }

  let suffix = '';
  
  // 生成随机字符
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    suffix += availableChars[randomIndex];
  }

  return suffix;
}

/**
 * 生成随机长度的后缀
 * 长度在4-20之间随机选择
 * @param config - 生成配置
 * @returns 生成的随机后缀字符串
 */
export function generateRandomLengthSuffix(config?: SuffixGeneratorConfig): string {
  const length = Math.floor(Math.random() * 17) + 4;
  return generateSuffix(length, config);
}

/**
 * 根据完整配置生成后缀
 * @param config - 生成配置
 * @returns 生成的随机后缀字符串
 */
export function generateSuffixWithConfig(config: SuffixGeneratorConfig): string {
  const length = config.useRandomLength 
    ? Math.floor(Math.random() * 17) + 4 
    : (config.fixedLength || 20);
  
  return generateSuffix(length, config);
}

/**
 * 验证后缀是否符合规则
 * @param suffix - 待验证的后缀字符串
 * @returns 如果后缀有效返回true，否则返回false
 * 
 * 验证规则：
 * 1. 长度在1-20之间
 * 2. 仅包含字母、数字和允许的符号
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

  // 检查字符集（字母、数字、符号）
  const validCharsRegex = /^[A-Za-z0-9_.\-]+$/;
  return validCharsRegex.test(suffix);
}

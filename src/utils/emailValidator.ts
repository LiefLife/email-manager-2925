/**
 * 邮箱地址验证工具
 * 用于验证2925.com域名的邮箱地址格式
 */

/**
 * 验证邮箱地址是否符合2925.com域名格式
 * @param email - 待验证的邮箱地址
 * @returns 如果邮箱格式有效返回true，否则返回false
 * 
 * 验证规则：
 * 1. 必须包含@符号
 * 2. 域名必须是2925.com
 * 3. 用户名部分只能包含字母和数字
 * 4. 用户名不能为空
 */
export function validateEmail(email: string): boolean {
  // 检查是否为空或null
  if (!email || typeof email !== 'string') {
    return false;
  }

  // 检查是否包含@符号
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return false;
  }

  // 分割用户名和域名
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [username, domain] = parts;

  // 验证域名必须是2925.com
  if (domain !== '2925.com') {
    return false;
  }

  // 验证用户名不能为空
  if (!username || username.length === 0) {
    return false;
  }

  // 验证用户名只能包含字母和数字
  const usernameRegex = /^[A-Za-z0-9]+$/;
  if (!usernameRegex.test(username)) {
    return false;
  }

  return true;
}

/**
 * 从邮箱地址中提取用户名部分
 * @param email - 邮箱地址
 * @returns 用户名部分，如果邮箱格式无效返回null
 */
export function extractUsername(email: string): string | null {
  if (!validateEmail(email)) {
    return null;
  }

  const atIndex = email.indexOf('@');
  return email.substring(0, atIndex);
}

/**
 * 从邮箱地址中提取域名部分
 * @param email - 邮箱地址
 * @returns 域名部分，如果邮箱格式无效返回null
 */
export function extractDomain(email: string): string | null {
  if (!validateEmail(email)) {
    return null;
  }

  const atIndex = email.indexOf('@');
  return email.substring(atIndex + 1);
}

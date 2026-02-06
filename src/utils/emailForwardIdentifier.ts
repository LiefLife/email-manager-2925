/**
 * 邮件转发识别模块
 * 用于识别哪些邮件是通过子邮箱转发的
 */

import type { Email } from '../types/email.types';
import type { SubEmail } from '../types/subEmail.types';

/**
 * 从邮箱地址中提取基础用户名（不含后缀）
 * 例如：userABC@2925.com -> user
 * 
 * @param email 邮箱地址
 * @returns 基础用户名，如果格式无效返回null
 */
function extractBaseUsername(email: string): string | null {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return null;
  
  const username = email.substring(0, atIndex);
  if (!username) return null;
  
  // 提取基础用户名（去除可能的后缀）
  // 假设后缀是大写字母
  const match = username.match(/^([a-z0-9]+)([A-Z]+)?$/i);
  if (!match) return null;
  
  return match[1].toLowerCase();
}

/**
 * 检查邮箱地址是否为子邮箱格式
 * 判断规则：邮箱地址为 基础用户名+后缀@2925.com 格式
 * 
 * @param email 邮箱地址
 * @param baseUsername 基础用户名（主邮箱的用户名部分）
 * @returns 是否为子邮箱格式
 */
function isSubEmailFormat(email: string, baseUsername: string): boolean {
  const emailLower = email.toLowerCase();
  
  // 检查域名是否为2925.com
  if (!emailLower.endsWith('@2925.com')) {
    return false;
  }
  
  const atIndex = emailLower.indexOf('@');
  const username = emailLower.substring(0, atIndex);
  
  // 检查用户名是否以基础用户名开头
  if (!username.startsWith(baseUsername.toLowerCase())) {
    return false;
  }
  
  // 检查是否有后缀（用户名长度大于基础用户名）
  return username.length > baseUsername.length;
}

/**
 * 识别子邮箱转发的邮件
 * 
 * 识别所有发送到 主邮箱+后缀@2925.com 格式的邮件
 * 
 * @param emails 邮件列表
 * @param mainEmail 主邮箱地址（用于提取基础用户名）
 * @returns 标记后的邮件列表
 * 
 * @example
 * ```typescript
 * const emails = await fetchEmails();
 * const identifiedEmails = identifyForwardedEmails(emails, 'user@2925.com');
 * ```
 */
export function identifyForwardedEmails(
  emails: Email[],
  mainEmail: string
): Email[] {
  // 提取主邮箱的基础用户名
  const baseUsername = extractBaseUsername(mainEmail);
  if (!baseUsername) {
    // 如果无法提取基础用户名，返回原邮件列表
    return emails.map(email => ({
      ...email,
      isSubEmailForwarded: false,
      originalSubEmail: undefined,
    }));
  }

  // 遍历邮件列表，标识转发邮件
  return emails.map(email => {
    // 检查收件人地址是否为子邮箱格式
    const recipientLower = email.to.toLowerCase();
    
    if (isSubEmailFormat(recipientLower, baseUsername)) {
      // 这是一封转发到子邮箱的邮件
      return {
        ...email,
        isSubEmailForwarded: true,
        originalSubEmail: email.to,
      };
    }

    // 不是子邮箱转发的邮件
    return {
      ...email,
      isSubEmailForwarded: false,
      originalSubEmail: undefined,
    };
  });
}

/**
 * 检查单个邮件是否为子邮箱转发
 * 
 * @param email 邮件对象
 * @param mainEmail 主邮箱地址
 * @returns 是否为子邮箱转发
 */
export function isEmailForwarded(
  email: Email,
  mainEmail: string
): boolean {
  const baseUsername = extractBaseUsername(mainEmail);
  if (!baseUsername) return false;
  
  return isSubEmailFormat(email.to, baseUsername);
}

/**
 * 获取邮件对应的子邮箱信息
 * 
 * @param email 邮件对象
 * @param subEmails 子邮箱列表
 * @returns 对应的子邮箱信息，如果不是转发邮件则返回undefined
 */
export function getSubEmailForEmail(
  email: Email,
  subEmails: SubEmail[]
): SubEmail | undefined {
  const recipientLower = email.to.toLowerCase();
  
  return subEmails.find(
    subEmail => subEmail.address.toLowerCase() === recipientLower
  );
}

/**
 * 按子邮箱分组邮件
 * 
 * @param emails 邮件列表
 * @param mainEmail 主邮箱地址
 * @returns 按子邮箱地址分组的邮件Map，键为子邮箱地址，值为邮件数组
 */
export function groupEmailsBySubEmail(
  emails: Email[],
  mainEmail: string
): Map<string, Email[]> {
  const groupedEmails = new Map<string, Email[]>();
  const baseUsername = extractBaseUsername(mainEmail);
  
  if (!baseUsername) {
    return groupedEmails;
  }

  // 将邮件分配到对应的子邮箱
  emails.forEach(email => {
    const recipientLower = email.to.toLowerCase();
    
    if (isSubEmailFormat(recipientLower, baseUsername)) {
      const emailList = groupedEmails.get(recipientLower) || [];
      emailList.push(email);
      groupedEmails.set(recipientLower, emailList);
    }
  });

  return groupedEmails;
}

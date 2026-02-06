/**
 * 邮件转发识别模块
 * 用于识别哪些邮件是通过子邮箱转发的
 */

import type { Email } from '../types/email.types';
import type { SubEmail } from '../types/subEmail.types';

/**
 * 识别子邮箱转发的邮件
 * 
 * 根据子邮箱列表，标识哪些邮件是转发到子邮箱的
 * 
 * @param emails 邮件列表
 * @param subEmails 子邮箱列表
 * @returns 标记后的邮件列表
 * 
 * @example
 * ```typescript
 * const emails = await fetchEmails();
 * const subEmails = await loadSubEmails();
 * const identifiedEmails = identifyForwardedEmails(emails, subEmails);
 * ```
 */
export function identifyForwardedEmails(
  emails: Email[],
  subEmails: SubEmail[]
): Email[] {
  // 创建子邮箱地址集合，用于快速查找
  const subEmailAddresses = new Set(
    subEmails.map(subEmail => subEmail.address.toLowerCase())
  );

  // 遍历邮件列表，标识转发邮件
  return emails.map(email => {
    // 检查收件人地址是否为子邮箱
    const recipientLower = email.to.toLowerCase();
    
    if (subEmailAddresses.has(recipientLower)) {
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
 * @param subEmails 子邮箱列表
 * @returns 是否为子邮箱转发
 */
export function isEmailForwarded(
  email: Email,
  subEmails: SubEmail[]
): boolean {
  const subEmailAddresses = new Set(
    subEmails.map(subEmail => subEmail.address.toLowerCase())
  );
  
  return subEmailAddresses.has(email.to.toLowerCase());
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
 * @param subEmails 子邮箱列表
 * @returns 按子邮箱地址分组的邮件Map，键为子邮箱地址，值为邮件数组
 */
export function groupEmailsBySubEmail(
  emails: Email[],
  subEmails: SubEmail[]
): Map<string, Email[]> {
  const groupedEmails = new Map<string, Email[]>();
  
  // 初始化每个子邮箱的邮件数组
  subEmails.forEach(subEmail => {
    groupedEmails.set(subEmail.address, []);
  });

  // 将邮件分配到对应的子邮箱
  emails.forEach(email => {
    const recipientLower = email.to.toLowerCase();
    const subEmail = subEmails.find(
      se => se.address.toLowerCase() === recipientLower
    );
    
    if (subEmail) {
      const emailList = groupedEmails.get(subEmail.address) || [];
      emailList.push(email);
      groupedEmails.set(subEmail.address, emailList);
    }
  });

  return groupedEmails;
}

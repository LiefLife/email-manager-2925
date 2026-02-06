/**
 * 邮件接口
 * 表示单个邮件的完整信息
 */
export interface Email {
  /** 邮件唯一标识符 */
  id: string;
  /** 发件人邮箱地址 */
  from: string;
  /** 收件人邮箱地址 */
  to: string;
  /** 邮件主题 */
  subject: string;
  /** 邮件正文内容 */
  body: string;
  /** 邮件时间戳（毫秒） */
  timestamp: number;
  /** 是否已读 */
  isRead: boolean;
  /** 是否为子邮箱转发的邮件 */
  isSubEmailForwarded: boolean;
  /** 原始子邮箱地址（仅当isSubEmailForwarded为true时有值） */
  originalSubEmail?: string;
}

/**
 * 邮件服务接口
 * 定义邮件相关的所有操作
 */
export interface EmailService {
  /**
   * 获取邮件列表
   * @returns 邮件数组
   */
  fetchEmails(): Promise<Email[]>;
  
  /**
   * 发送邮件
   * @param to 收件人地址
   * @param subject 邮件主题
   * @param body 邮件正文
   */
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  
  /**
   * 标记邮件为已读
   * @param emailId 邮件ID
   */
  markAsRead(emailId: string): Promise<void>;
}

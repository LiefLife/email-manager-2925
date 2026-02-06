/**
 * 子邮箱状态类型
 */
export type SubEmailStatus = 'creating' | 'active' | 'failed';

/**
 * 子邮箱接口
 * 表示从主邮箱派生的子邮箱信息
 */
export interface SubEmail {
  /** 完整子邮箱地址 */
  address: string;
  /** 后缀部分（添加到主邮箱用户名后的字符串） */
  suffix: string;
  /** 创建时间戳（毫秒） */
  createdAt: number;
  /** 子邮箱状态 */
  status: SubEmailStatus;
}

/**
 * 子邮箱服务接口
 * 定义子邮箱相关的所有操作
 */
export interface SubEmailService {
  /**
   * 生成随机后缀
   * @param length 后缀长度（1-20）
   * @returns 生成的后缀字符串
   */
  generateSuffix(length: number): string;
  
  /**
   * 创建子邮箱
   * @param suffix 后缀字符串
   * @returns 创建的子邮箱信息
   */
  createSubEmail(suffix: string): Promise<SubEmail>;
  
  /**
   * 获取所有子邮箱列表
   * @returns 子邮箱数组
   */
  listSubEmails(): Promise<SubEmail[]>;
  
  /**
   * 获取指定子邮箱的详细信息
   * @param address 子邮箱地址
   * @returns 子邮箱详细信息
   */
  getSubEmailDetails(address: string): Promise<SubEmail>;
}

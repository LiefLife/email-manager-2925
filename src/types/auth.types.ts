/**
 * 登录凭据接口
 * 用于用户登录时提供邮箱地址和密码
 */
export interface LoginCredentials {
  /** 完整邮箱地址 (xxx@2925.com) */
  email: string;
  /** 用户密码 */
  password: string;
}

/**
 * 认证会话接口
 * 存储用户登录后的会话信息
 */
export interface AuthSession {
  /** 用户邮箱地址 */
  email: string;
  /** 会话令牌 */
  token: string;
  /** 会话过期时间戳（毫秒） */
  expiresAt: number;
}

/**
 * 认证服务接口
 * 定义认证相关的所有操作
 */
export interface AuthService {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 认证会话信息
   */
  login(credentials: LoginCredentials): Promise<AuthSession>;
  
  /**
   * 用户登出
   */
  logout(): Promise<void>;
  
  /**
   * 验证当前会话是否有效
   * @returns 会话是否有效
   */
  validateSession(): Promise<boolean>;
  
  /**
   * 获取存储的会话信息
   * @returns 会话信息，如果不存在则返回null
   */
  getStoredSession(): Promise<AuthSession | null>;
}

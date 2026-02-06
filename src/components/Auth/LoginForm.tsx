/**
 * LoginForm组件
 * 实现邮箱登录表单，包含邮箱和密码输入框、验证和错误处理
 */

import React, { useState, FormEvent, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/emailValidator';
import AnimatedButton from '../Common/AnimatedButton';
import LoadingSpinner from '../Common/LoadingSpinner';
import {
  LoginContainer,
  LoginCard,
  LoginTitle,
  LoginForm as StyledForm,
  InputGroup,
  InputLabel,
  Input,
  ErrorMessage,
  ButtonGroup,
} from './LoginForm.styles';

/**
 * 自动登录复选框容器
 */
const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`;

/**
 * 复选框样式
 */
const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6366f1;
`;

/**
 * 复选框标签
 */
const CheckboxLabel = styled.label`
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
`;

/**
 * LoginForm - 登录表单组件
 * 
 * 功能：
 * - 邮箱和密码输入
 * - 实时邮箱格式验证
 * - 集成useAuth进行登录
 * - 显示加载状态和错误消息
 * - 支持自动登录选项
 * 
 * @example
 * <LoginForm />
 */
const LoginForm: React.FC = () => {
  // 表单状态
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // 认证Hook
  const { login, loading, error: authError } = useAuth();

  /**
   * 组件挂载时加载自动登录偏好
   */
  useEffect(() => {
    const loadAutoLoginPreference = async () => {
      try {
        const { tauriCommands } = await import('../../services/tauriCommands');
        const preferences = await tauriCommands.storage.loadPreferences();
        
        if (preferences?.autoLogin) {
          setAutoLogin(true);
          
          // 尝试从会话中获取邮箱地址
          const session = await tauriCommands.storage.loadSession();
          if (session?.email) {
            setEmail(session.email);
          }
        }
      } catch (error) {
        console.error('加载自动登录偏好失败:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadAutoLoginPreference();
  }, []);

  /**
   * 验证邮箱格式
   * @param value - 邮箱地址
   * @returns 是否有效
   */
  const validateEmailInput = (value: string): boolean => {
    if (!value) {
      setEmailError('请输入邮箱地址');
      return false;
    }

    if (!validateEmail(value)) {
      setEmailError('请输入有效的2925.com邮箱地址');
      return false;
    }

    setEmailError('');
    return true;
  };

  /**
   * 处理邮箱输入变化
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // 清除之前的错误
    if (emailError) {
      setEmailError('');
    }
    if (formError) {
      setFormError('');
    }
  };

  /**
   * 处理邮箱输入失焦
   */
  const handleEmailBlur = () => {
    if (email) {
      validateEmailInput(email);
    }
  };

  /**
   * 处理密码输入变化
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    
    // 清除之前的错误
    if (formError) {
      setFormError('');
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 清除之前的错误
    setFormError('');

    // 验证邮箱
    if (!validateEmailInput(email)) {
      return;
    }

    // 验证密码
    if (!password) {
      setFormError('请输入密码');
      return;
    }

    try {
      // 调用登录
      await login({ email, password }, autoLogin);
      // 登录成功后，AuthContext会更新状态，App组件会处理导航
    } catch (error) {
      // 登录失败，显示错误消息
      const errorMessage = error instanceof Error ? error.message : '登录失败，请检查邮箱和密码';
      setFormError(errorMessage);
    }
  };

  // 显示的错误消息（优先显示表单错误，其次是认证错误）
  const displayError = formError || authError;

  // 等待初始化完成
  if (!isInitialized) {
    return (
      <LoginContainer>
        <LoadingSpinner size="large" text="加载中..." />
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <LoginCard>
        <LoginTitle
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          2925邮箱管理系统
        </LoginTitle>

        <StyledForm onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel htmlFor="email">邮箱地址</InputLabel>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="username@2925.com"
              disabled={loading}
              $hasError={!!emailError}
              autoComplete="email"
              autoFocus
            />
            {emailError && <ErrorMessage>{emailError}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="password">密码</InputLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="请输入密码"
              disabled={loading}
              $hasError={false}
              autoComplete="current-password"
            />
          </InputGroup>

          <CheckboxGroup>
            <Checkbox
              id="autoLogin"
              type="checkbox"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              disabled={loading}
            />
            <CheckboxLabel htmlFor="autoLogin">
              自动登录
            </CheckboxLabel>
          </CheckboxGroup>

          {displayError && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {displayError}
            </ErrorMessage>
          )}

          <ButtonGroup>
            {loading ? (
              <LoadingSpinner size="medium" text="登录中..." />
            ) : (
              <AnimatedButton
                type="submit"
                variant="primary"
                size="large"
                disabled={loading}
              >
                登录
              </AnimatedButton>
            )}
          </ButtonGroup>
        </StyledForm>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginForm;

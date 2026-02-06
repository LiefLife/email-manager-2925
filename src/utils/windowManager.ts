/**
 * 窗口管理工具
 * 提供Tauri窗口操作的封装函数
 */

import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

/**
 * 窗口尺寸接口
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * 窗口位置接口
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * 窗口管理器类
 */
export class WindowManager {
  private static window = getCurrentWindow();

  /**
   * 设置窗口大小
   * @param width - 窗口宽度
   * @param height - 窗口高度
   */
  static async setSize(width: number, height: number): Promise<void> {
    try {
      await this.window.setSize(new LogicalSize(width, height));
    } catch (error) {
      console.error('设置窗口大小失败:', error);
      throw error;
    }
  }

  /**
   * 获取窗口大小
   * @returns 窗口尺寸
   */
  static async getSize(): Promise<WindowSize> {
    try {
      const size = await this.window.innerSize();
      return {
        width: size.width,
        height: size.height,
      };
    } catch (error) {
      console.error('获取窗口大小失败:', error);
      throw error;
    }
  }

  /**
   * 设置窗口最小尺寸
   * @param width - 最小宽度
   * @param height - 最小高度
   */
  static async setMinSize(width: number, height: number): Promise<void> {
    try {
      await this.window.setMinSize(new LogicalSize(width, height));
    } catch (error) {
      console.error('设置窗口最小尺寸失败:', error);
      throw error;
    }
  }

  /**
   * 设置窗口最大尺寸
   * @param width - 最大宽度
   * @param height - 最大高度
   */
  static async setMaxSize(width: number, height: number): Promise<void> {
    try {
      await this.window.setMaxSize(new LogicalSize(width, height));
    } catch (error) {
      console.error('设置窗口最大尺寸失败:', error);
      throw error;
    }
  }

  /**
   * 居中窗口
   */
  static async center(): Promise<void> {
    try {
      await this.window.center();
    } catch (error) {
      console.error('居中窗口失败:', error);
      throw error;
    }
  }

  /**
   * 最小化窗口
   */
  static async minimize(): Promise<void> {
    try {
      await this.window.minimize();
    } catch (error) {
      console.error('最小化窗口失败:', error);
      throw error;
    }
  }

  /**
   * 最大化窗口
   */
  static async maximize(): Promise<void> {
    try {
      await this.window.maximize();
    } catch (error) {
      console.error('最大化窗口失败:', error);
      throw error;
    }
  }

  /**
   * 取消最大化窗口
   */
  static async unmaximize(): Promise<void> {
    try {
      await this.window.unmaximize();
    } catch (error) {
      console.error('取消最大化窗口失败:', error);
      throw error;
    }
  }

  /**
   * 切换最大化状态
   */
  static async toggleMaximize(): Promise<void> {
    try {
      await this.window.toggleMaximize();
    } catch (error) {
      console.error('切换最大化状态失败:', error);
      throw error;
    }
  }

  /**
   * 显示窗口
   */
  static async show(): Promise<void> {
    try {
      await this.window.show();
    } catch (error) {
      console.error('显示窗口失败:', error);
      throw error;
    }
  }

  /**
   * 隐藏窗口
   */
  static async hide(): Promise<void> {
    try {
      await this.window.hide();
    } catch (error) {
      console.error('隐藏窗口失败:', error);
      throw error;
    }
  }

  /**
   * 关闭窗口
   */
  static async close(): Promise<void> {
    try {
      await this.window.close();
    } catch (error) {
      console.error('关闭窗口失败:', error);
      throw error;
    }
  }

  /**
   * 设置窗口标题
   * @param title - 窗口标题
   */
  static async setTitle(title: string): Promise<void> {
    try {
      await this.window.setTitle(title);
    } catch (error) {
      console.error('设置窗口标题失败:', error);
      throw error;
    }
  }

  /**
   * 检查窗口是否最大化
   * @returns 是否最大化
   */
  static async isMaximized(): Promise<boolean> {
    try {
      return await this.window.isMaximized();
    } catch (error) {
      console.error('检查窗口最大化状态失败:', error);
      throw error;
    }
  }

  /**
   * 检查窗口是否可见
   * @returns 是否可见
   */
  static async isVisible(): Promise<boolean> {
    try {
      return await this.window.isVisible();
    } catch (error) {
      console.error('检查窗口可见性失败:', error);
      throw error;
    }
  }
}

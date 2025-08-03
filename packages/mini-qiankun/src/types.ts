/**
 * 微应用基础配置接口
 * 
 * 定义微应用的基本信息和激活规则
 */
export interface MicroApp {
  /**
   * 微应用名称，必须唯一
   */
  name: string;
  /**
   * 微应用入口URL
   */
  entry: string;
  /**
   * 微应用容器选择器
   */
  container: string;
  /**
   * 微应用激活规则
   * 可以是字符串路径前缀或返回布尔值的函数
   */
  activeRule: string | ((location: Location) => boolean);
}

/**
 * 微应用配置扩展接口
 * 
 * 继承自MicroApp接口，添加了props属性
 */
export interface MicroAppConfig extends MicroApp {
  /**
   * 传递给微应用的属性
   */
  props: Record<string, any>;
}

/**
 * 微应用生命周期钩子接口
 * 
 * 定义微应用的生命周期方法
 */
export interface LifeCycles {
  /**
   * 微应用初始化前的回调
   * 
   * @returns {Promise<void>} 初始化完成的Promise
   */
  bootstrap?: () => Promise<void>;
  /**
   * 微应用挂载时的回调
   * 
   * @param {any} [props] 传递给微应用的属性
   * @returns {Promise<void>} 挂载完成的Promise
   */
  mount?: (props?: any) => Promise<void>;
  /**
   * 微应用卸载时的回调
   * 
   * @param {any} [props] 传递给微应用的属性
   * @returns {Promise<void>} 卸载完成的Promise
   */
  unmount?: (props?: any) => Promise<void>;
  /**
   * 微应用更新时的回调
   * 
   * @param {any} [props] 传递给微应用的属性
   * @returns {Promise<void>} 更新完成的Promise
   */
  update?: (props?: any) => Promise<void>;
}

/**
 * 微应用实例接口
 * 
 * 表示一个已注册的微应用实例
 */
export interface MicroAppInstance {
  /**
   * 微应用名称
   */
  name: string;
  /**
   * 应用状态
   * - NOT_LOADED 未加载
   * - LOADING 加载中，正在获取应用资源
   * - NOT_BOOTSTRAPPED 资源已加载，未初始化
   * - NOT_MOUNTED 已初始化，但未挂载
   * - MOUNTED 已挂载，应用正在运行
   * - UNMOUNTING 卸载中
   */
  status: 'NOT_LOADED' | 'LOADING' | 'NOT_BOOTSTRAPPED' | 'NOT_MOUNTED' | 'MOUNTED' | 'UNMOUNTING';
  app?: LifeCycles;
  container?: HTMLElement;
}

export interface ImportEntryOpts {
  fetch?: typeof window.fetch;
  getPublicPath?: (entry: string) => string;
  getTemplate?: (tpl: string) => string;
}

export interface ProxySandbox {
  proxy: WindowProxy;
  active(): void;
  inactive(): void;
}
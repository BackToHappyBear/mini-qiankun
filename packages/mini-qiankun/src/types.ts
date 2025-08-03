export interface MicroApp {
  name: string;
  entry: string;
  container: string;
  activeRule: string | ((location: Location) => boolean);
}

export interface MicroAppConfig extends MicroApp {
  props: Record<string, any>;
}

export interface LifeCycles {
  bootstrap?: () => Promise<void>;
  mount?: (props?: any) => Promise<void>;
  unmount?: (props?: any) => Promise<void>;
  update?: (props?: any) => Promise<void>;
}

export interface MicroAppInstance {
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
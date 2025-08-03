/**
 * 路由管理器模块
 * 
 * 负责监听路由变化，劫持history API，并在路由变化时触发相应的事件
 * 是 mini-qiankun 框架中路由系统的核心
 */
export class RouterManager {
  /**
   * 路由管理器是否已启动
   * 
   * @private
   * @static
   * @type {boolean}
   */
  private static isStarted = false;

  /**
   * 启动路由管理器
   * 
   * 初始化路由监听，劫持history API
   * 该方法应该在应用注册完成后调用
   * 
   * @static
   * @returns {void}
   */
  static start(): void {
    if (!this.isStarted) {
      this.hijackHistory()
      this.isStarted = true
    }
  }

  /**
   * 劫持history API
   * 
   * 重写window.history的pushState和replaceState方法，以便在路由变化时触发事件
   * 同时监听popstate和hashchange事件
   * 
   * @private
   * @static
   * @returns {void}
   */
  private static hijackHistory(): void {
    const originalPushState = window.history.pushState
    window.history.pushState = function (state: any, title: string, url?: string | URL | null) {
      const result = originalPushState.call(this, state, title, url)
      RouterManager.triggerRouteChange()
      return result;
    }

    const originalReplaceState = window.history.replaceState
    window.history.replaceState = function (state: any, title: string, url?: string | URL | null) {
      const result = originalReplaceState.call(this, state, title, url)
      RouterManager.triggerRouteChange()
      return result;
    }

    window.addEventListener('popstate', () => {
      RouterManager.triggerRouteChange()
    })

    window.addEventListener('hashchange', () => {
      RouterManager.triggerRouteChange()
    })
  }

  /**
   * 触发路由变化事件
   * 
   * 创建并分发'appChange'自定义事件，携带当前路由信息
   * 
   * @private
   * @static
   * @returns {void}
   */
  private static triggerRouteChange() {
    const event = new CustomEvent('appChange', {
      detail: {
        location: window.location,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      }
    })

    window.dispatchEvent(event)
  }

  /**
   * 导航到指定路径
   * 
   * 手动触发路由变化
   * 
   * @static
   * @param {string} path 目标路径
   * @returns {void}
   * 
   * @example
   * ```typescript
   * RouterManager.navigateTo('/app1'); // 导航到/app1路径
   * ```
   */
  static navigateTo(path: string): void {
    window.history.pushState(null, '', path)
    this.triggerRouteChange()
  }
}
/**
 * Mini Qiankun 核心模块
 * 
 * 提供微前端框架核心API，包括应用注册、启动和路由切换处理
 * 这是整个框架的协调中心，负责连接路由管理器和应用管理器
 */

import { MicroApp, LifeCycles } from "./types";
import { ApplicationManager } from './application'
import { RouterManager } from './router'

/**
 * 注册微应用
 * 
 * 这是框架的主要入口函数，用于注册一个或多个微应用到框架中
 * 注册后的应用会根据路由规则自动加载和卸载
 * 
 * @param apps 微应用配置数组，每个元素包含应用的名称、入口、容器和激活规则
 * @param lifeCycles 应用生命周期函数，包含bootstrap、mount、unmount和update
 * 
 * @example
 * ```typescript
 * registerMicroApps([
 *   {
 *     name: 'app1',
 *     entry: '//localhost:8080',
 *     container: '#container',
 *     activeRule: '/app1',
 *   },
 * ], {
 *   bootstrap: async () => console.log('全局初始化'),
 *   mount: async (props) => console.log('全局挂载', props),
 *   unmount: async (props) => console.log('全局卸载', props),
 *   update: async (props) => console.log('应用更新', props),
 * });
 * ```
 */
export function registerMicroApps(
  apps: MicroApp[],
  lifeCycles?: LifeCycles
): void {
  if (lifeCycles) {
    ApplicationManager.setGlobalLifeCycles(lifeCycles)
  }

  apps.forEach(app => {
    ApplicationManager.registerApp(app)
  })

  RouterManager.start()
  ApplicationManager.startRouteListener()
}

export function start(): void {
  console.log('mini qiankun started')

  const event = new CustomEvent('route-change', {
    detail: { location: window.location }
  })

  window.dispatchEvent(event)
}

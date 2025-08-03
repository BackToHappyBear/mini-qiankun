/**
 * Mini Qiankun 核心模块
 * 
 * 提供微前端框架核心API，包括应用注册、启动和路由切换处理
 * 这是整个框架的协调中心，负责连接路由管理器和应用管理器
 * 
 * @module mini-qiankun/core
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
 * @param {MicroApp[]} apps 微应用配置数组，每个元素包含应用的名称、入口、容器和激活规则
 * @param {LifeCycles} [lifeCycles] 可选的全局生命周期函数
 * @param {Function} [lifeCycles.bootstrap] 所有应用初始化前的回调
 * @param {Function} [lifeCycles.mount] 所有应用挂载时的回调
 * @param {Function} [lifeCycles.unmount] 所有应用卸载时的回调
 * @param {Function} [lifeCycles.update] 所有应用更新时的回调
 * @returns {void}
 * @throws {Error} 当应用配置无效时抛出异常
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

/**
 * 启动微前端框架
 * 
 * 初始化路由监听并触发初始路由匹配
 * 这是框架的启动函数，应该在注册完所有微应用后调用
 * 
 * @returns {void}
 * 
 * @example
 * ```typescript
 * registerMicroApps([...]);
 * start(); // 启动框架
 * ```
 */
export function start(): void {
  console.log('mini qiankun started')

  const event = new CustomEvent('route-change', {
    detail: { location: window.location }
  })

  window.dispatchEvent(event)
}

// 这是mini-qiankun的入口文件
// 虽然不需要实现具体功能，但我们可以导出一个简单的示例对象

export { registerMicroApps, start } from './qiankun';

export { loadMicroApp } from './loader'

export { ApplicationManager } from './application'

export type { MicroApp, MicroAppConfig } from './types'
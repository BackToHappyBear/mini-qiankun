// 这是mini-qiankun的入口文件
/**
 * mini-qiankun 核心功能导出模块
 * 
 * 该模块作为 mini-qiankun 的入口文件，导出所有对外提供的 API 和类型定义
 * 主要包括微应用注册、启动、手动加载以及应用管理等核心功能
 */

// 导出微应用注册和启动 API
import { registerMicroApps, start } from './qiankun';
// 导出手动加载微应用 API
import { loadMicroApp } from './loader';
// 导出应用管理器类
import { ApplicationManager } from './application';
// 导出核心类型定义
import type { MicroApp, MicroAppConfig } from './types';

// 重新导出所有 API 和类型，供外部使用
export { registerMicroApps, start, loadMicroApp, ApplicationManager };
export type { MicroApp, MicroAppConfig };
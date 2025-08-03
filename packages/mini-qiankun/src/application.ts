import { MicroApp, LifeCycles, MicroAppInstance } from './types';
import { importEntry } from './loader';

export class ApplicationManager {
  private static apps = new Map<string, MicroAppInstance>();
  private static appConfigs: Map<string, MicroApp> = new Map();
  private static globalLifeCycles?: LifeCycles = {};
  private static currentApp: string | null = null;

  static setGlobalLifeCycles(lifeCycles: LifeCycles) {
    this.globalLifeCycles = lifeCycles;
  }

  static registerApp(app: MicroApp): void {
    if (!this.apps.has(app.name)) {

      this.appConfigs.set(app.name, app)

      this.apps.set(app.name, {
        name: app.name,
        status: 'NOT_LOADED',
        container: (document.querySelector(app.container) as HTMLElement),
      });
    }
  }

  static async loadApp(appName: string): Promise<void> {
    const appInstance = this.apps.get(appName)
    if (!appInstance) {
      throw new Error(`app ${appName} not found`)
    }

    // 防止重复加载
    if (appInstance.status !== 'NOT_LOADED') {
      return
    }

    appInstance.status = 'LOADING'

    try {
      const appConfig = this.getAppConfig(appName)
      if (!appConfig) {
        throw new Error(`app ${appName} config not found`)
      }


      const container = document.querySelector(appConfig.container) as HTMLElement
      if (container) {
        appInstance.container = container
      }

      const { template, execScripts } = await importEntry(appConfig.entry)

      if (appInstance.container) {
        appInstance.container.innerHTML = template
      }

      const lifecycles = await execScripts()
      appInstance.app = lifecycles;

      appInstance.status = 'NOT_BOOTSTRAPPED'

      await this.bootstrapApp(appName)
    } catch (error) {
      console.log(`Failed to load app ${appName}:`, error)
    }
  }

  static async bootstrapApp(appName: string): Promise<void> {
    const appInstance = this.apps.get(appName)
    if (!appInstance || appInstance.status !== 'NOT_BOOTSTRAPPED') {
      return
    }

    try {
      if (this.globalLifeCycles?.bootstrap) {
        await this.globalLifeCycles.bootstrap()
      }

      if (appInstance.app?.bootstrap) {
        await appInstance.app.bootstrap()
      }

      appInstance.status = 'NOT_MOUNTED'
    } catch (error) {
      console.log(`Failed to bootstrap app ${appName}:`, error)
      throw error
    }

  }

  static async mountApp(appName: string): Promise<void> {
    if (!this.currentApp && this.currentApp !== appName) {
      await this.unmountApp(appName)
    }
    
    const appInstance = this.apps.get(appName)
    if (!appInstance) {
      await this.loadApp(appName)
      return this.mountApp(appName)
    }

    if (appInstance.status === 'NOT_LOADED') {
      await this.loadApp(appName)
      return this.mountApp(appName)
    }

    if (appInstance.status === 'MOUNTED') {
      return
    }

    const appConfig = this.getAppConfig(appName)
    if (!appConfig) {
      throw new Error(`App config not found for ${appName}`)
    }

    const container = document.querySelector(appConfig.container) as HTMLElement;
    if (!container) {
      throw new Error(`Container ${appConfig.container} not found for app ${appName}`)
    }

    appInstance.container = container;

    try {
      if (this.globalLifeCycles?.mount) {
        await this.globalLifeCycles.mount()
      }

      if (appInstance.app?.mount) {
        const mountProps = {
          ...appConfig,
          container: appInstance.container,
        }
        console.log('Mounting app with props:', mountProps)
        await appInstance.app.mount(mountProps)
      }

      appInstance.status = 'MOUNTED'
      this.currentApp = appName

      console.log(`App ${appName} mounted successfully`)
    } catch (error) {
      console.log(`Failed to mount app ${appName}:`, error)
      throw error
    }
  }

  static async unmountApp(appName: string): Promise<void> {
    const appInstance = this.apps.get(appName)
    if (!appInstance || appInstance.status !== 'MOUNTED') {
      return
    }
    
    appInstance.status = 'UNMOUNTING'

    try {
      if (appInstance.app?.unmount) {
        const appConfig = this.getAppConfig(appName)
        const unmountProps = {
          ...appConfig,
          container: appInstance.container,
        }
        await appInstance.app.unmount(unmountProps)
      }  

      if (this.globalLifeCycles?.unmount) {
        await this.globalLifeCycles.unmount()
      }

      appInstance.status = 'NOT_MOUNTED'

      if (this.currentApp === appName) {
        this.currentApp = null
      }
      console.log(`App ${appName} unmounted successfully`)
    } catch (error) {
      console.error(`Failed to unmount app ${appName}:`, error)
      appInstance.status = 'MOUNTED'
      throw error
    }
  }

  static getCurrentApp(): MicroAppInstance | null {
    if (!this.currentApp) {
      return null
    }
    return this.apps.get(this.currentApp) || null
  }

  private static getAppConfig(appName: string): MicroApp | undefined {
    return this.appConfigs.get(appName)
  }

  static getAppInstance(appName: string): MicroAppInstance | undefined {
    return this.apps.get(appName)
  }

  static getAllApps(): Map<string, MicroAppInstance> {
    return this.apps
  }

  static getAllAppConfigs(): Map<string, MicroApp> {
    return this.appConfigs
  }

  static getRegisteredApps(): MicroApp[] {
    return Array.from(this.appConfigs.values())
  }

  static isAppRegistered(appName: string): boolean {
    return this.appConfigs.has(appName)
  }

  static unregisterApp(appName: string): void {
    if (this.currentApp === appName) {
      this.unmountApp(appName).catch(console.error)
    }

    this.appConfigs.delete(appName)
    this.apps.delete(appName)
  }

  static startRouteListener(): void {
    window.addEventListener('route-change', this.handleRouteChange.bind(this))
  }

  private static async handleRouteChange(event: Event): Promise<void> {
    const CustomEvent = event as CustomEvent
    const { location } = CustomEvent.detail

    console.log('Route changed:', location.pathname)

    const matchedApp = this.findMatchedApp(location)
    if (matchedApp) {
      await this.mountApp(matchedApp.name)
    } else {
      const currentApp = this.getCurrentApp()
      if (currentApp) {
        await this.unmountApp(currentApp.name)
      }
    }
  }

  private static findMatchedApp(location: Location): MicroApp | null {
    const apps = this.getRegisteredApps()

    for (const app of apps) {
      if (this.isAppActive(app, location)) {
        return app
      }
    }

    return null
  }

  private static isAppActive(app: MicroApp, location: Location): boolean {
    const { activeRule } = app

    if (typeof activeRule === 'function') {
      return activeRule(location)
    }

    if (typeof activeRule === 'string') {
      return location.pathname.startsWith(activeRule)
    }

    return false
  }
}

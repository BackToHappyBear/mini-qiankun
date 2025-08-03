import { MicroApp, ImportEntryOpts } from './types'
import { ApplicationManager } from './application'

/**
 * 手动加载微应用
 * 
 * 提供给外部使用的手动加载 API， 可以在不依赖路由的情况下加载应用
 * 
 * @param app 微应用配置
 */
export async function loadMicroApp(app: MicroApp): Promise<void> {
  await ApplicationManager.registerApp(app)
  await ApplicationManager.loadApp(app.name)
}

export async function importEntry(entry: string, opts: ImportEntryOpts = {}): Promise<{
  template: string;
  execScripts: () => Promise<any>;
  assetPublicPath: string;
}> {
  const { fetch = window.fetch, getPublicPath, getTemplate } = opts
  
  // 获取 HTML 内容
  const response = await fetch(entry)
  const html = await response.text()

  const template = getTemplate ? getTemplate(html) : html;
  const assetPublicPath = getPublicPath ? getPublicPath(entry) : getDefaultPublicPath(entry);

  const scripts = extractScripts(html, assetPublicPath)
  const styles = extractStyles(html, assetPublicPath)

  injectStyles(styles)

  return {
    template: processTemplate(template),
    execScripts: () => execScripts(scripts),
    assetPublicPath,
  }
}

function getDefaultPublicPath(entry: string): string {
  const url = new URL(entry)
  return `${url.protocol}//${url.host}`
}

function extractScripts(html: string, publicPath: string): string[] {
  const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*<\/script>/gi
  const inlineScriptRegex = /<script[^>]*>([^<]*)<\/script>/gi
  const scripts: string[] = []

  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1]
    const fullUrl = src.startsWith('https') ? src : publicPath + src.replace(/^\/+/, '')
    scripts.push(fullUrl)
  }
  while ((match = inlineScriptRegex.exec(html)) !== null) {
    const scriptContent = match[1].trim()
    if (scriptContent) {
      scripts.push(scriptContent)
    }
  }
  return scripts
}

function extractStyles(html: string, publicPath: string): string[] {
  const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*<\/link>/gi
  const styleRegex = /<style[^>]*>([^<]*)<\/style>/gi
  const styles: string[] = []

  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const fullUrl = href.startsWith('https') ? href : publicPath + href.replace(/^\/+/, '')
    styles.push(fullUrl)
  }

  while ((match = styleRegex.exec(html)) !== null) {
    const styleContent = match[1].trim()
    if (styleContent) {
      styles.push(styleContent)
    }
  }
  return styles
}

function injectStyles(styles: string[]): void {
  styles.forEach(style => {
    if (style.startsWith('<style>')) {
      const styleElement = document.createElement('style')
      styleElement.textContent = style
      document.head.appendChild(styleElement.firstChild as HTMLStyleElement)
    } else {
      const linkElement = document.createElement('link')
      linkElement.href = style
      linkElement.rel = 'stylesheet'
      document.head.appendChild(linkElement)
    }
  })
}

function processTemplate(template: string): string {
  return template
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
}

async function execScripts(scripts: string[]): Promise<any> {
  const beforeExecution = { ...window }

  for (const script of scripts) {
    if (script.startsWith('http')) {
      const response = await fetch(script)
      const scriptContent = await response.text()
      executeScript(scriptContent)
    } else {
      executeScript(script)
    }
  }

  const afterExecution = { ...window }

  let lifeCycles: any = {}

  if ((window as any).VueApp) {
    lifeCycles = (window as any).VueApp
  } else if ((window as any).ReactApp) {
    lifeCycles = (window as any).ReactApp
  } else {
    for (const key in afterExecution) {
      if (!(key in beforeExecution) && typeof (afterExecution as any)[key] === 'object') {
        const obj = (afterExecution as any)[key]
        if (obj && (obj.bootstrap || obj.mount || obj.unmount)) {
          lifeCycles = obj
          console.log(`Found lifecycle exports in ${key}:`, lifeCycles)
          break;
        }
      }
    }
  }

  return lifeCycles
}

function executeScript(scriptContent: string): void {
  try {
    const script = document.createElement('script')
    script.textContent = scriptContent
    document.head.appendChild(script)
    document.head.removeChild(script)
  } catch (error) {
    console.log('Script execution error:', error)
  }
}
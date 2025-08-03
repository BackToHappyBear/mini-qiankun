export class RouterManager {
  private static isStarted = false;

  static start(): void {
    if (!this.isStarted) {
      this.hijackHistory()
      this.isStarted = true
    }
  }

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

  static navigateTo(path: string): void {
    window.history.pushState(null, '', path)
    this.triggerRouteChange()
  }
}
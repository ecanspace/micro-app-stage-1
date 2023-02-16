/**
 * Custom class @name Hookman 自定义钩子【流程控制】工具类
 * (c) Ecan Chen (d) 2022/1/4
 */

// function promiseWrapFn(handlers, ...args) {
//   return handlers.reduce((promise, handler) => promise.then(handler), Promise.resolve())
// }

export default class Hookman {
  constructor() {
    this.hooks = new Map()
  }

  addHooks(options) {
    Object.keys(options).forEach((name) => {
      const handler = options[name]
      this.addHook(name, handler)
    })
  }

  addHook(name, handler) {
    // Check for 'name' and 'handler' parameters
    if (!name || typeof handler !== 'function') {
      throw Error(`[micro-app] hookman add-hook error: Illegal parameter`)
    }

    // Show warning for non-standard 'name' parameter
    if (typeof name !== 'string') {
      console.warn(`[micro-app] hookman warning: Hook name expect to receive a 'string' type`)
    }

    if (this.hooks.has(name)) {
      const hookList = this.hooks.get(name)
      hookList.push(handler)
    } else {
      this.hooks.set(name, [handler])
    }
  }

  callHook(name, ...args) {
    if (this.hooks.has(name)) {
      const handlers = this.hooks.get(name)
      handlers.forEach((callback) => callback(...args))
      // return promiseWrapFn(handlers, ...args)
    } else {
      // return Promise.reject(`[micro-app] hookman call-hook error: Hook named '${name}' is undefined`)
      throw Error(`[micro-app] hookman call-hook error: Hook named '${name}' is undefined`)
    }
  }

  removeHook(name) {
    if (this.hooks.has(name)) {
      this.hooks.delete(name)
    } else {
      console.warn(`[micro-app] hookman remove-hook warning: Hook named '${name}' is undefined`)
    }
  }

  clearHooks() {
    this.hooks.clear()
  }
}
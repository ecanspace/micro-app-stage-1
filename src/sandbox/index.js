/**
 * 自定义沙箱类
 */
import { store } from '../dispatch/store'
import { rawWindow, rawLocation } from '../native_interface'
import { isCtor, isFunction } from '../utils/index'
import { createMicroDocument } from './micro-document'
import { createMicroHistory } from './micro-history'
import { createMicroLocation } from './micro-location'
import MicroCSS from './micro-css'
// import MicroHistory from './micro-history'

// patchHistory()

export default class Sandbox {
  // 定义 microWindow 不可见的属性集合
  // 换句话说，沙箱环境中直接访问以下变量，可以直接访问全局 window 对象
  static SYMBOL_UNSCOPABLES = {
    // Built-in Objects
    Array: true,
    Boolean: true,
    Date: true,
    Math: true,
    Map: true,
    Number: true,
    Object: true,
    Promise: true,
    Proxy: true,
    Reflect: true,
    Set: true,
    String: true,
    Symbol: true,
    // Global Props
    Infinity: true,
    NaN: true,
    null: true,
    undefined: true,
    // Global Methods
    isNaN: true,
    parseFloat: true,
    parseInt: true,
    // // Global object
    // document: true
  }

  // // 依赖上下文执行的方法
  // static DEPEND_CONTEXT_METHODS = [
  //   'fetch',
  //   'addEventListener',
  //   'removeEventListener',
  //   'setTimeout',
  //   'setInterval',
  //   'clearTimeout',
  //   'clearInterval',
  //   'postMessage',
  //   'getComputedStyle'
  // ]

  // // 绑定上下文
  // static bindContext(value, context) {
  //   if (typeof value === 'function' && Sandbox.DEPEND_CONTEXT_METHODS.includes(value.name)) {
  //     const boundValue = value.bind(context)

  //     // // 继承自身属性
  //     // Object.getOwnPropertyNames(value).forEach((prop) => {
  //     //   boundValue[prop] = value[prop]
  //     // })

  //     // 继承原型
  //     Object.setPrototypeOf(boundValue, Object.getPrototypeOf(value))

  //     return boundValue
  //   }

  //   return value
  // }

  constructor(app) {
    this.app = app
    this.hookman = app.hookman
    this.microWindow = {
      // receiveDataFromBaseApp(name) {
      //   const microStore = store.modules.get(app.name)
      //   if (microStore) {
      //     return microStore.getData(name)
      //   }
      // },
      // dispatchDataToBaseApp(payload) {}
    }
    this.microWindow[Symbol.unscopables] = Sandbox.SYMBOL_UNSCOPABLES

    this.microCss = new MicroCSS(this)
    // this.MicroHistory = createMicroHistory(app.base)
    
    this.observeWindow()
    // this.patchAnchorElement()
  }

  // receiveDataFromBaseApp(name) {
  //   const appName = this.app.name
  //   const microStore = store.modules.get(appName)
  //   return microStore && microStore.getData(name)
  // }

  // patchAnchorElement() {
  //   const descriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href')
  //   if (descriptor.configurable) {
  //     Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
  //       configurable: true,
  //       enumerable: true,
  //       writable: true,
  //       value: 'https://www.baidu.com'
  //     })
  //   }
  // }

  observeWindow() {
    const app = this.app
    // const rawWindow = window
    const microDocument = createMicroDocument(app)
    const microHistory = createMicroHistory(app)
    const microLocation = createMicroLocation(app)
    const hasOwnProperty = (prop) => this.microWindow.hasOwnProperty(prop) || rawWindow.hasOwnProperty(prop)

    const proxy = new Proxy(this.microWindow, {
      get: getter,
      set: setter,
      has: hasHandler,
      deleteProperty: deleteHandler,
      getOwnPropertyDescriptor: getDescriptorHandler,
      defineProperty: defineHandler,
      ownKeys: getOwnKeys,
    })

    // Get operation proxy 
    function getter(target, prop) {
      if (prop === Symbol.unscopables) {
        return Sandbox.SYMBOL_UNSCOPABLES
      }

      if (prop === 'window' || prop === 'self' || prop === 'globalThis') {
        return proxy
      }

      if (prop === 'top' || prop === 'parent') {
        return rawWindow === rawWindow.parent ? proxy : rawWindow[prop]
      }

      if (prop === 'document') {
        return microDocument
      }

      if (prop === 'history') {
        return microHistory
      }

      if (prop === 'location') {
        return microLocation
      }

      // Everything is an object, and window is no exception
      if (prop === 'hasOwnProperty') {
        return hasOwnProperty
      }

      if (prop === 'eval') {
        return eval
      }

      if (target.hasOwnProperty(prop)) {
        return target[prop]
      }

      const value = rawWindow[prop]

      return isFunction(value) ? (isCtor(value) ? value : value.bind(rawWindow)) : value
    }

    // Set operation proxy 
    function setter(target, prop, value) {
      if (!target.hasOwnProperty(prop) && rawWindow.hasOwnProperty(prop)) {
        const descriptor = Object.getOwnPropertyDescriptor(rawWindow, prop)

        if (descriptor) {
          descriptor.writable && Object.defineProperty(target, prop, {
            ...descriptor,
            value
          })
        } else {
          // 非 window 原生属性，只是 “恰巧” 子应用和主应用同时存在的变量
          target[prop] = value
        }

      } else {
        target[prop] = value
      }

      // TODO: 可以提供接口修改 rawWindow 白名单

      return true
    }

    // Has operation proxy 
    function hasHandler(target, prop) {
      return Reflect.has(target, prop) || Reflect.has(rawWindow, prop)
    }

    // delete operation proxy 
    function deleteHandler(target, prop) {
      if (target.hasOwnProperty(prop)) {
        Reflect.deleteProperty(target, prop)
      }

      return true
    }

    // Get descriptor operation proxy
    function getDescriptorHandler(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop) || Reflect.getOwnPropertyDescriptor(rawWindow, prop)
    }

    // define operation proxy 
    function defineHandler(target, prop, descriptor) {
      return !Reflect.has(target, prop) && Reflect.has(rawWindow, prop) ?
        Reflect.defineProperty(rawWindow, prop, descriptor) :
        Reflect.defineProperty(target, prop, descriptor)
    }

    function getOwnKeys(target) {
      return Reflect.ownKeys(rawWindow)
      // return Reflect.ownKeys(target).concat(Reflect.ownKeys(rawWindow))
    }

    this.windowProxy = proxy
  }

  // 在沙盒环境中执行脚本
  runScript(codes) {
    // console.log('[TMA] info: The micro-app codes is running in a sandbox environment')
    // 用函数作为代码执行器的好处：
    // - 提供密闭环境
    // - 代替 eval 并不高效的执行方式
    // 用 with 语法的原因，添加 microWindow 对象到作用域链的顶端，防止变量突破沙箱直接访问真实的 window 对象
    // 详情参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/with
    const context = this.windowProxy
    Function('window', 'self', 'with(window){\n' + codes + '\n}')(context, context)
  }

  scopedCss(styles) {
    return this.microCss.scoped(styles)
  }
}
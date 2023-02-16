/**
 * A custom <micro-app> element that is rendered as iframe-like element
 * 
 * Custom attributes description:
 * - name: 微应用唯一标志的名称
 * - src: 微应用访问 URL 源
 * 
 * (c) Ecan Chen (d) 2022/1/13
 */
import { microApps } from '../interface'
import { createRandomName } from '../utils/index'
import { rawDocument } from '../native_interface'
// import MicroAnchorElement from '../components/micro-anchor'
import MicroImageElement from './micro-image'
import MicroApp from '../microApp/main'

const normalizeSelectors = (selectors) => selectors.replace(/(^|\s)(head|body)[^\w\-]?/gi, 'micro-$2')

// 自定义 MicroAppElement 类，继承自 HTMLElement 原生类

// ------
// MicroAppElement 类：只负责在其不同 生命周期回调函数 触发时，通知 MicroApp 做相应的操作，
// 相当于浏览器与 MicroApp 之间的传输通道，所有逻辑都放在 MicroApp 中管理
// ------

// ------
// 备注：定义非 W3C 内置元素（div, p, ...）有且只能继承 HTMLElement 类，否则浏览器会报错，
// 如果想要继承其它诸如 HTMLDivElement 类，需要在注册时，额外配置参数，比如：

// customElements.define('micro-div', MicroDivElement, { extends: 'div' })

// 使用方式：
// <div is="micro-div"></div>

// 详情参考：https://developer.mozilla.org/zh-CN/docs/Web/API/CustomElementRegistry/define
// ------

// ------
// 扩展：MicroAppElement 对基座应用来说是个元素，而对子应用来说它是一个类似 “document” 根节点，
// 所以为了方便实现 DOM 沙箱，在当前类会 implement 部分 document 的接口
// ------
export default class MicroAppElement extends HTMLElement {
  static microName = 'micro-app';

  constructor() {
    super();

    // // Check for shadow DOM
    // if (this.attachShadow) {
    //   this.attachShadow({ mode: 'open' })
    // } else {
    //   throw Error(`The current environment does not support 'shadow DOM' API`)
    // }

    // this.hookman = new Hookman()
    // 子应用入口 HTML 解析完成监听钩子
    // this.hookman.addHook('container:render', this.render.bind(this))

    console.log('[micro-app] is creating...')
  }

  get head() {
    return super.querySelector('micro-head')
  }

  get body() {
    return super.querySelector('micro-body')
  }

  getElementById(id) {
    if (typeof id === 'string') {
      return super.querySelector('#' + id.trim())
    } else {
      console.error(`[micro-app] error: 'document.getElementById' received an invalid parameter`)
    }
  }

  getElementsByTagName(name) {
    if (name === 'html') {
      return rawDocument.getElementsByTagName('micro-app')
    }

    // name = name.replace(/html\s/gi, '')
    return this.querySelectorAll(name)
  }

  querySelector(selectors) {
    // selectors === 'head' && console.log(selectors)
    return super.querySelector(normalizeSelectors(selectors))
  }

  querySelectorAll(selectors) {
    return super.querySelectorAll(normalizeSelectors(selectors))
  }

  createElement(tagName, options) {
    // return /^[Aa]$/.test(tagName) ? new MicroAnchorElement(options) : rawDocument.createElement(tagName, options)
    // if (tagName === 'img') {
    //   options = { is: 'micro-image' }
    // }
    // return rawDocument.createElement(tagName, options)
    if (tagName === 'img') {
      return new MicroImageElement(this.name)
    } else {
      return rawDocument.createElement(tagName, options)
    }
  }

  // 元素首次被插入 DOM 时
  connectedCallback() {
    let name = this.getAttribute('name')

    // Compatible 'name' attribute is null
    // 用户没有指定 <micro-app> 元素 name 属性，将创建一个随机名
    // ------
    // 备注：如果子应用不存在与基座应用交互，则 name 属性不是必需的
    // ------
    if (!name) {
      name = createRandomName()
      console.warn(`[micro-app] warning: The <micro-app> element has no configured 'name' attribute, We created a random name '${name}' for it`)
    }

    if (microApps.has(name)) {
      // 微应用重名判断
      throw Error(`[micro-app] named '${name}' already exists, Please check and try again`)
    }

    this.name = name // 绑定 MicroApp 名称

    // 同步创建 MicroApp 实例，管理子应用的生命周期
    const app = new MicroApp(name, this)
    microApps.set(name, app)

    // 定义一个浏览器内部属性，供外界访问 micro-app 实例
    Object.defineProperty(this, '__microApp__', {
      configurable: true,
      enumerable: false,
      value: app,
      writable: true
    })

    app.start()
    // const app = new MicroApp(this)
    // console.log(this.getAttribute('name'))
    // Reflect.get(this, '__microApp__').start()
    // const app = new MicroApp(this)
    // microApps.set(app.name, app)
    // latestApp.start()
    // this.hookman.callHook('app:ready')
  }

  // 元素从 DOM 中删除时调用
  disconnectedCallback() {
    console.log(`[micro-app] is disconnected`)

    const app = this.__microApp__
    app.destroy()

    microApps.delete(app.name), delete this.__microApp__

    console.log(this)
    // const app = microApps.get()
    // microApps.get(this.name).destodfd()
    // this.app.unmount()
    // this.hookman.clearHooks()
    // this.app = null
    // this.hookman = null
  }

  // 元素被移动到新的文档
  adoptedCallback() {

  }

  // 新增、修改、删除自身属性时调用
  attributeChangedCallback(name, oldVal, newVal) {

  }
}
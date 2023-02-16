/**
 * Custom Web Component to load micro-app
 * (c) Ecan Chen on 2021/12/23
 */
import Hookman from '../hookman/index'
import HTMLParser from '../parser/index'
import Sandbox from '../sandbox/index'
import { readAsText, normalizeUrl } from '../utils/index'
import { rawWindow, rawDocument } from '../native_interface'
import MicroHeadElement from '../components/micro-head'
import MicroAppLifecycle from './lifecycle'

export default class MicroApp {
  constructor(name, container) {
    this.name = name
    this.container = container // 绑定当前 <micro-app> 元素

    // attributes => props
    this.initProps(this.container.attributes)

    // 初始化一些工具类
    // ------
    // Hookman: 生命周期钩子
    // HTMLParser: 解析 HTML 工具类
    // Sandbox: 子应用沙箱环境
    // ------
    this.hookman = new Hookman()
    this.lifecycles = new MicroAppLifecycle(this)
    this.parser = new HTMLParser(this)
    this.sandbox = new Sandbox(this)

    // Check for Fetch API
    // 默认使用浏览器自带 Fetch API, TODO: 允许自定义配置请求工具，比如：Axios
    if (rawWindow.fetch) {
      this.fetch = rawWindow.fetch.bind(rawWindow)
    } else {
      // 当前浏览器不支持 Fetch API
      throw Error(`[micro-app] The current browser does not support the 'Fetch' API`)
    }

    // this.registerHooks()
    this.hookman.addHook('html:parsed', this.onHTMLParsed.bind(this))

    this.lifecycles.created()
    // this.state = lifecycles.CREATED
    // this.hookman.callHook('app:created')
  }

  initProps(attrs) {
    let props = {}

    for (let i = 0, len = attrs.length; i < len; i++) {
      const attrNode = attrs[i]
      props[attrNode.name] = attrNode.value
    }

    console.log(`[micro-app-debugger] '${props.name}' props is `, props)

    this.base = props.base || ('/' + props.name) // 如果 base 参数没有配置，默认使用 name 代替
    this.props = props, props = null
  }

  // // 注册钩子函数
  // registerHooks() {
  //   // this.hookman.addHook('app:ready', this.ready.bind(this))
  // }

  // hook: when the <micro-app> is inserted into the DOM for the first time
  start() {
    // this.state = lifecycles.PARSING
    // // microApp 创建完成，准备获取微应用资源
    // console.log('[micro-app] is created and ready to fetch micro-app resources')
    this.parseEntry()
  }

  // 解析子应用 HTML 文档
  parseEntry() {
    let { src: url } = this.props

    // Check for 'src' attribute
    if (typeof url !== 'string') {
      throw Error(`[micro-app] 'src' attribute expects to receive a string type`)
    }

    // Compatible with (abs|rel) url
    url = normalizeUrl(url)

    // const assertion = assertType.expect(url, 'string') // 断言：期待 'url' 是一个字符串
    
    // if (!assertion.result) {
    //   return console.error(`[TMA] ${new TypeError('<micro-app> `src` attribute ' + assertion.message)}`)
    // }

    this.fetch(url)
      .then(readAsText) // Compatible with stream reading
      .then((html) => this.parser.parse(html))
  }

  // Hook: When html parsed
  onHTMLParsed(parser) {
    this.lifecycles.parsed() // 调用 parsed 钩子

    const { styles, scripts } = parser

    // Style processing flow: fetch -> isolate -> render
    const promise$1 = Promise.resolve(styles)
      .then(this.fetchResources.bind(this, 'style'))
      // .then(this.isolateStyles.bind(this)) // Since style isolation is performed on 'document.head.appendChild'
      .then(this.render.bind(this))

    // Script processing flow: fetch -> run
    const promise$2 = Promise.resolve(scripts)
      .then(this.fetchResources.bind(this, 'script'))
      // .then(this.mount.bind(this))

    Promise.all([promise$1, promise$2]).then(this.mount.bind(this))
  }

  // 获取外部资源
  fetchResources(type, resources) {
    const props = this.props
    const outlineResources = resources.filter((item) => item.isExternal)

    const promises = outlineResources.map((item) => {
      const url = normalizeUrl(item[type === 'style' ? 'href' : 'src'], /* base */ props.src)
      return this.fetch(url).then((response) => response.text())
    })

    return Promise.all(promises).then((resList) => {
      resList.forEach((code, index) => outlineResources[index].code = code)
      return resources
    })
  }

  // // 调用沙箱样式隔离
  // isolateStyles(styles) {
  //   const sandbox = this.sandbox
  //   styles.forEach((item) => item.code = sandbox.scopedCss(item.code))
  //   return styles
  // }

  // // 获取外部脚本
  // fetchExternalScripts(scripts) {
  //   const outlineScripts = scripts.filter((item) => item.isExternal)

  //   const scriptPromises = outlineScripts.map((item) => {
  //     return item.code ? Promise.resolve(item.code) : this.fetch(this.props.src + item.src).then((response) => response.text())
  //   })

  //   Promise.all(scriptPromises).then((res) => {
  //     for (let i = 0, len = res.length; i < len; i++) {
  //       const code = res[i]
  //       scripts[i].code = code
  //     }

  //     this.mount()
  //   })
  // }

  render(styles) {
    const { template } = this.parser
    // const head = rawDocument.createElement('micro-head')
    const head = new MicroHeadElement(this.name) // 手动实例化绑定 app 关系
    const body = rawDocument.createElement('micro-body')
    // const fragment = rawDocument.createDocumentFragment()

    styles.forEach((item) => {
      const style = rawDocument.createElement('style')
      const textNode = rawDocument.createTextNode(item.code)
      style.type = 'text/css', style.appendChild(textNode)
      head.appendChild(style)
    })

    body.innerHTML = template
    this.container.append(head, body)

    // const shadow = this.shadowRoot
    // this.container.appendChild(head), this.container.appendChild(body)
  }

  mount() {
    const sandbox = this.sandbox
    this.parser.scripts.forEach((item) => sandbox.runScript(item.code))
    // console.log('====================sandbox====================')
    // console.log(this.sandbox)
    this.lifecycles.mounted()
  }

  unmount() {
    console.log('micro-app unmounted')
  }

  destroy() {
    this.container.innerHTML = ''
    this.hookman.clearHooks()
    this.lifecycles.destroyed()
    this.parser.teardown()
    // this.sandbox.release()

    delete this.container
    delete this.hookman
    delete this.lifecycles
    delete this.parser
    delete this.sandbox
  }

  // // 定义一个代理对象代替 DOM 形式的属性访问，
  // // 属性首次被访问时调用 getAttribute 获取属性值并缓存，后续访问直接从目标对象中获取，
  // // 而不再进行 DOM 操作
  // initProps() {
  //   const getter = (target, prop) => {
  //     let value = target[prop]

  //     if (value === undefined) {
  //       value = target[prop] = self.getAttribute(prop)
  //     }

  //     return value
  //   }

  //   const setter = (target, prop, value) => {

  //   }

  //   this.props = new Proxy({}, {
  //     get: getter,
  //     set: setter,
  //   })
  // }
}
/**
 * 原生依赖 Web API 配置
 * (c) Ecan Chen <chneyang@cdqcp.com> (d) 2022/1/17
 */
const rawWindow = window;
const rawDocument = rawWindow.document;
const rawCustomElements = rawWindow.customElements;
const rawLocation = rawWindow.location;
const rawHistory = rawWindow.history;
const rawURL = rawWindow.URL;
// export const rawFileReader = rawWindow.FileReader

/**
 * Tool Library (c) Ecan Chen (d) 2022/1/17
 */

const rawToString = Object.prototype.toString;

// What constructor of this value??
const classof = (value) => rawToString.call(value).slice(8, -1);

// Is browser environment??
const isBrowser = typeof window !== 'undefined';

// Is function??
const isFunction = (value) => typeof value === 'function';

// Is plain Object??
const isPlainObject = (value) => classof(value) === 'Object';

// Normalize pathname
const normalizePath = (...args) => args.join('/').replace(/(?<!:)\/{2,}/g, '/');
// export const normalizeAndJoinPath = (...args) => args.map((path) => path.replace(/^\/?(\S*?)\/?$/, '/$1')).join('')

// Normalize (rel|abs) url 
// If url is relative address, Resolve it based on the current 'location.origin'
// export const normalizeUrl = (url, base) => new rawWindow.URL(url, base || rawLocation.origin).href
const normalizeUrl = (url, base) => /^https?/.test(url) ? url : normalizePath(base || rawLocation.origin, url);

// 随机字符集
const chars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 
  'u', 'v', 'w', 'x', 'y', 'z'
];

// Create a random name 
function createRandomName(len = 6) {
  let max = chars.length, result = '';

  while(len--) {
    const index = Math.floor(Math.random() * max);
    result += chars[index];
  }

  return result
}

// stdout response text
function readAsText(response) {
  const contentType = response.headers['Content-Type'];

  // Content-Type: text/html; charset=utf-8
  if (!contentType || contentType.match(/charset=utf-8/i)) {
    return response.text()
  }

  // 流读取
  return response.blob().then(blob => new Promise((resolve, reject) => {
    const reader = new rawWindow.FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(blob);
  }))
}

// 微应用 Map 集合
const microApps = new Map();
// export const activeMicroAppName = 'vue-app'

/**
 * 自定义 <micro-image> 微应用 DOM 元素
 */

class MicroImageElement extends HTMLImageElement {
  constructor(microAppName) {
    super();
    this.microName = 'micro-image';
    this.bindMicroAppName = microAppName;
  }

  connectedCallback() {
    console.log('<micro-image> element is connected');
    const src = this.getAttribute('src');
    this.setAttribute('src', normalizeUrl(src, microApps.get(this.bindMicroAppName).props.src));
  }

  disconnectedCallback() {
    
  }

  adoptedCallback() {

  }

  attributeChangedCallback(prop, oldVal, newVal) {
    console.log('<micro-image> element attributes is changed');
    // console.log(prop, oldVal, newVal)
  }
}

/**
 * Custom class @name Hookman 自定义钩子【流程控制】工具类
 * (c) Ecan Chen (d) 2022/1/4
 */

// function promiseWrapFn(handlers, ...args) {
//   return handlers.reduce((promise, handler) => promise.then(handler), Promise.resolve())
// }

class Hookman {
  constructor() {
    this.hooks = new Map();
  }

  addHooks(options) {
    Object.keys(options).forEach((name) => {
      const handler = options[name];
      this.addHook(name, handler);
    });
  }

  addHook(name, handler) {
    // Check for 'name' and 'handler' parameters
    if (!name || typeof handler !== 'function') {
      throw Error(`[micro-app] hookman add-hook error: Illegal parameter`)
    }

    // Show warning for non-standard 'name' parameter
    if (typeof name !== 'string') {
      console.warn(`[micro-app] hookman warning: Hook name expect to receive a 'string' type`);
    }

    if (this.hooks.has(name)) {
      const hookList = this.hooks.get(name);
      hookList.push(handler);
    } else {
      this.hooks.set(name, [handler]);
    }
  }

  callHook(name, ...args) {
    if (this.hooks.has(name)) {
      const handlers = this.hooks.get(name);
      handlers.forEach((callback) => callback(...args));
      // return promiseWrapFn(handlers, ...args)
    } else {
      // return Promise.reject(`[micro-app] hookman call-hook error: Hook named '${name}' is undefined`)
      throw Error(`[micro-app] hookman call-hook error: Hook named '${name}' is undefined`)
    }
  }

  removeHook(name) {
    if (this.hooks.has(name)) {
      this.hooks.delete(name);
    } else {
      console.warn(`[micro-app] hookman remove-hook warning: Hook named '${name}' is undefined`);
    }
  }

  clearHooks() {
    this.hooks.clear();
  }
}

/**
 * HTML 解析类 (c) Ecan Chen (d) 2022/1/18
 */

// 正则匹配集合
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/g;
const HTML_HEAD_REGEX = /<head[^>]*>[\s\S]*?<\/head>/i;
const HTML_BODY_REGEX = /<body[^>]*>[\s\S]*?<\/body>/i;
const LINK_TAG_REGEX = /<link[^>]*>/gi;
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
const SCRIPT_TAG_REGEX = /<script[^>]*>[\s\S]*?<\/script>/gi;
const TAG_ATTRS_REGEX = /\s[^=\s\/]+(=('|")[^'"]*\2)?/g;
const START_OR_END_TAG_REGEX = /<\/?(body|style|script)[^>]*>/gi;
// const ANCHOR_TAG_REGEX = /<a[^>]*>[\s\S]*?<\/a>/gi

// Link 标签 rel 集合
const relMap = {
  STYLESHEET: 'stylesheet'
};

class HTMLParser {
  constructor(app) {
    this.app = app;
    this.hookman = app.hookman;
    this.template = '';
    this.links = [];
    this.styles = [];
    this.scripts = [];
  }

  teardown() {
    this.app = null;
    this.hookman = null;
    this.template = '';
    
    delete this.links;
    delete this.styles;
    delete this.scripts;
  }

  // 批量替换
  batchReplace(str, steps) {
    return steps.reduce((str, item) => str.replace(item.regex, item.replacer || ''), str)
  }

  // 解析 HTML 字符串
  parse(html) {
    if (!html || typeof html !== 'string') {
      throw Error(`[micro-app] error: invalid html string`)
    }
    // const assertion = assertType.expect(html, 'string')

    // if (!assertion.result) {
    //   return console.error('[TMA] ' + new TypeError('HTMLParser `parse` method ' + assertion.message))
    // }
  
    let matched = null;
  
    // 解析 head 标签
    matched = html.match(HTML_HEAD_REGEX);
    if (matched) {
      const head = matched[0];
      this.parseHead(head);
      // 更新 HTML 减少不必要的查找
      html = html.slice(matched.index + head.length);
      matched = null;
    }
  
    // 解析 body 标签
    matched = html.match(HTML_BODY_REGEX);
    if (matched) {
      const body = matched[0];
      this.parseTemplate(body);
      matched = null;
    }

    this.hookman.callHook('html:parsed', this); // 解析完成通知 App 继续下一步操作
  }

  // 解析 head 标签
  parseHead(str) {
    return this.batchReplace(str, [
      // 消除注释
      { regex: HTML_COMMENT_REGEX }, // replacer 不配置，默认为 ''
      // 收集 link 标签信息
      { 
        regex: LINK_TAG_REGEX, 
        replacer: this.parseLink.bind(this) 
      },
      // 收集 style 标签信息
      { 
        regex: STYLE_TAG_REGEX, 
        replacer: this.parseInlineStyles.bind(this) 
      },
      // 收集 script 标签信息
      { 
        regex: SCRIPT_TAG_REGEX, 
        replacer: this.parseScript.bind(this) 
      }
    ])
  }

  // 解析 html 模板
  parseTemplate(str) {
    this.template = this.batchReplace(str, [
      // 消除注释
      { regex: HTML_COMMENT_REGEX }, // replacer 不配置，默认 ''
      // 收集 script 标签信息
      { 
        regex: SCRIPT_TAG_REGEX, 
        replacer: this.parseScript.bind(this) 
      }
      // // 匹配 A 标签
      // { 
      //   regex: ANCHOR_TAG_REGEX, 
      //   replacer: this.parseAnchor.bind(this) 
      // }
    ]);
  }

  // 解析头部 link 标签
  parseLink(match) {
    const props = this.parseAttrs(match);

    if (props.rel === relMap.STYLESHEET) {
      this.styles.push({
        href: props.href,
        code: '',
        isExternal: true
      });
    } else {
      this.links.push(props);
    }

    return '<!-- The link tag is replaced by micro-app -->'
    // const links = this.links, parseAttrs = this.parseAttrs
    // const matched = str.match(LINK_TAG_REGEX) || []

    // matched.forEach((item) => {
    //   const props = parseAttrs(item)
    //   links.push(props)
    // })

    // const styles = this.styles

    // links.filter((link) => link.rel === REL_STYLESHEET).forEach((item) => styles.push({
    //   href: item.href,
    //   code: '',
    //   isExternal: true
    // }))
  }

  // 解析 style 标签
  parseInlineStyles(match) {
    this.styles.push({
      isInline: true,
      code: match.replace(START_OR_END_TAG_REGEX, '')
    });

    return '<!-- The style tag is replaced by micro-app -->'
    // const styles = this.styles
    // const matched = str.match(STYLE_TAG_REGEX) || []

    // matched.forEach((item) => styles.push({
    //   isInline: true,
    //   code: item.replace(START_OR_END_TAG_REGEX, '')
    // }))
  }

  // 解析 script 标签
  parseScript(match) {
    const scripts = this.scripts;
    const scriptStartTag = match.match(/<script[^>]*>/i)[0];
    const props = this.parseAttrs(scriptStartTag);

    let inlineScript = false;

    // Check for 'src' attribute
    if (props.src) {
      scripts.push({ ...props, code: '', isExternal: true });
    } else {
      inlineScript = true, scripts.push({
        isInline: inlineScript,
        code: match.replace(START_OR_END_TAG_REGEX, '')
      });
    }

    return `<!-- The ${inlineScript ? 'inline' : 'external'} script is replaced by micro-app -->`
    // const scripts = this.scripts, parseAttrs = this.parseAttrs
    // const matched = str.match(SCRIPT_TAG_REGEX) || []
  
    // matched.forEach((item) => {
    //   if (/\ssrc=/.test(item)) {
    //     const props = parseAttrs(item)
    //     scripts.push({ ...props, code: '', isExternal: true })
    //   } else {
    //     scripts.push({
    //       isInline: true,
    //       code: item.replace(START_OR_END_TAG_REGEX, '')
    //     })
    //   }
    // })
  
    // return '<!-- micro-app ' + scriptType + ' script -->'
  }

  // 解析标签属性
  parseAttrs(str) {
    const attrs = str.match(TAG_ATTRS_REGEX) || [];

    const reduceHandler = (props, item) => {
      // 属性简写时，默认值为 true, 比如：<script src="/xxx" defer></script> 中的 'defer'
      const [name, value = true] = item.trim().replace(/['"]/g, '').split('=');
      return props[name] = value, props
    };

    return attrs.reduce(reduceHandler, {})
  }

  // // 解析 A 标签
  // parseAnchor(match) {
  //   // return match.replace(/<a\s/i, '<a is="micro-anchor" ')
  //   // .replace(/<a\s/i, '<micro-anchor ')
  //   // .replace(/<\/a>/i, '</micro-anchor>')

  //   // const result = match.match(HTMLParser.TAG_HREF_REGEX)
  //   // if (result && !result[2].match(/^http/)) {
  //   //   return match.replace(HTMLParser.TAG_HREF_REGEX, '\shref="' + this.app.props.src + '$2"')
  //   // } else {
  //   //   return match
  //   // }
  // }
}

/**
 * [micro-app] 数据管理中心
 */
// export function merge(target, source) {}

class DataStore {
  constructor(parentStore) {
    this.data = parentStore ? Object.create(parentStore.data) : {};
    this.modules = new Map();
  }

  getData(name) {
    const data = JSON.parse(JSON.stringify(this.data));
    return name ? data[name] : data
  }

  setData(name, payload) {
    if (name) {
      const mudules = this.modules;
      let microStore = mudules.get(name);

      if (!microStore) {
        const store = new DataStore(this);
        mudules.set(name, store);
        microStore = store;
      }

      microStore.setData(undefined, payload);
    } else {
      this.data = Object.assign(this.data, payload);
    }
  }
}

const store = new DataStore();

// 创建自定义 microDocument 对象
function createMicroDocument(app) {
  // const microDocument = new MicroDocument(container)
  const container = app.container;
  
  function getter(target, prop) {
    const context = Reflect.has(target, prop) ? target : rawDocument;
    const value = Reflect.get(context, prop);

    // console.log('==================getter==================')
    // console.log(prop, context)

    return isFunction(value) ? value.bind(context) : value
  }

  function setter(target, prop, value) {
    const inTarget = Reflect.has(target, prop);
    const inRawDocument = Reflect.has(rawDocument, prop);

    if (inTarget || inRawDocument) {
      const context = inTarget ? target : rawDocument;
      const descriptor = Object.getOwnPropertyDescriptor(context, prop);

      if (descriptor && descriptor.writable) {
        Object.defineProperty(context, prop, {
          ...descriptor,
          value
        });
      }

    } else {
      // 非原生属性，则直接赋值到 target 目标对象上
      target[prop] = value;
    }

    return true
  }

  function hasHandler(target, prop) {
    return Reflect.has(target, prop) || Reflect.has(rawDocument, prop)
  }

  return new Proxy(container, {
    get: getter,
    set: setter,
    has: hasHandler
  })
}

// // 微应用 document 对象构造器
// export class MicroDocument {
//   constructor(container) {
//     this.container = container
//   }

//   get head() {
//     return this.container.querySelector('micro-head')
//   }

//   get body() {
//     return this.container.querySelector('micro-body')
//   }

//   getElementById(id) {
//     if (typeof id === 'string') {
//       return this.container.querySelector('#' + id.trim())
//     } else {
//       console.error(`[micro-app] error: 'document.getElementById' expects to receive a 'string' type`)
//     }
//   }
// }

/**
 * 子应用 History 操作沙箱
 */

function createMicroHistory(app) {
  const base = app.base, microHistory = {};

  // 拦截子应用内部 history.pushState 调用
  // 添加 URL 前缀
  microHistory.pushState = function customPushState(...args) {
    // debugger
    // const url = this.base + args.pop()
    const url = normalizePath(base, args.pop());
    // console.log(url)
    rawHistory.pushState(...args, url);
  };

  microHistory.replaceState = function customReplaceState(...args) {
    // const url = this.base + args.pop()
    const url = normalizePath(base, args.pop());
    // console.log(url)
    rawHistory.replaceState(...args, url);
  };

  function getter(target, prop) {
    // const context = Reflect.has(target, prop) ? target : rawHistory
    // const value = Reflect.get(context, prop)
    if (target.hasOwnProperty(prop)) {
      return Reflect.get(target, prop)
    }

    const value = Reflect.get(rawHistory, prop);

    return isFunction(value) ? value.bind(rawHistory) : value
  }

  // function setter(target, prop, value) {
    
  // }

  return new Proxy(microHistory, {
    get: getter,
    // set: setter,
  })

  // const microHistory = Object.create(rawHistory)

  // // 设置子应用 URL 基础路径
  // microHistory.base = app.base

  // // 拦截子应用内部 history.pushState 调用
  // // 添加 URL 前缀
  // microHistory.pushState = function customPushState(...args) {
  //   debugger
  //   // const url = this.base + args.pop()
  //   const url = normalizePath(this.base, args.pop())
  //   console.log(url)
  //   rawHistory.pushState(...args, url)
  // }

  // // 同上
  // microHistory.replaceState = function customReplaceState(...args) {
  //   // const url = this.base + args.pop()
  //   const url = normalizePath(this.base, args.pop())
  //   console.log(url)
  //   rawHistory.replaceState(...args, url)
  // }
}

// export function patchHistory() {
//   const rawHistoryProto = rawWindow.History.prototype
//   const rawPushState = rawHistoryProto.pushState
//   const rawReplaceState = rawHistoryProto.replaceState

//   rawHistoryProto.pushState = function customPushState(...args) {
//     console.log(this)
//     const url = '/' + activeMicroAppName + args.pop()
//     rawPushState.call(this, ...args, url)
//   }

//   rawHistoryProto.replaceState = function customReplaceState(...args) {
//     console.log(this)
//     const url = '/' + activeMicroAppName + args.pop()
//     rawReplaceState.call(this, ...args, url)
//   }
// }

// export function createMicroHistory(base) {
//   return class MicroHistory extends History {
//     constructor() {
//       super();
//       this.base = base
//     }

//     pushState(...args) {
//       const url = this.base + args.pop()
//       console.log('pushState', url)
//       super.pushState(...args, url)
//     }

//     replaceState(...args) {
//       const url = this.base + args.pop()
//       console.log('replaceState', url)
//       super.replaceState(...args, url)
//     }
//   }
// }

/**
 * 自定义子应用 Location 代理对象
 */
// import { normalizePath } from '../utils/index'

function createMicroLocation(app) {
  const { base, props } = app;
  const microLocation = new rawURL(props.src);

  microLocation.assign = function customAssign(...args) {
    return rawLocation.assign(...args)
  };

  microLocation.reload = function customReload(...args) {
    return rawLocation.reload(...args)
  };

  microLocation.replace = function customReplace(...args) {
    return rawLocation.replace(...args)
  };

  microLocation.toString = function customToString(...args) {
    return rawLocation.toString(...args)
  }; 

  microLocation.getPathname = function () {
    return rawLocation.pathname.replace(new RegExp('^' + base), '/')
  };

  function getter(target, prop) {
    // debugger

    if (prop === 'hash' || prop === 'search' || prop === 'password' || prop === 'username') {
      return Reflect.get(rawLocation, prop)
    }

    if (prop === 'href') {
      return microLocation.origin + microLocation.getPathname()
    }

    if (prop === 'pathname') {
      return microLocation.getPathname()
    }

    return Reflect.get(target, prop)

    // if (prop === 'host' || prop === 'hostname' || prop === 'origin' || prop === 'port' || prop === 'protocol') {
    //   return Reflect.get(target, prop)
    // }
  }

  // function setter(target, prop, value) {
  //   // debugger

  //   // Reflect.set(target, prop, value)

  //   if (prop === 'href') {
  //     value = normalizePath(base, value)
  //   }

  //   Reflect.set(rawLocation, prop, value)

  //   return true
  // }

  return new Proxy(microLocation, {
    get: getter,
    // set: setter,
  })
}

/**
 * 自定义 MicroCSS 样式隔离类
 */

class MicroCSS {
  constructor(sandbox) {
    // this.sandbox = sandbox
    this.app = sandbox.app;

    const style = rawDocument.createElement('style');

    rawDocument.body.appendChild(style); // Append 之后才能访问 sheet 对象

    if (style.sheet) {
      style.sheet.disabled = true;
    }

    this.tempStyle = style;
  }

  scoped(styleNode) {
    // 标记是否处理过，如果为 true 返回
    if (styleNode.__scoped__) {
      return 'The style Node has already been processed';
    }

    const cssText = styleNode.textContent;

    if (cssText) {
      const textNode = rawDocument.createTextNode(cssText);

      this.tempStyle.appendChild(textNode);

      const styleSheet = this.tempStyle.sheet;
      const cssRules = Array.from(styleSheet.cssRules); // 类数组转数组对象

      // const cssPrefix = 'micro-app[name=' + this.app.name + ']'

      const scopedHandler = (item) => {
        if (item.type === 4) {
          return '@media ' + item.conditionText + ' { ' + Array.from(item.cssRules).map(scopedHandler).join('\n') + ' }'
        }

        // 忽略 @font-face, @keyframes 规则
        if (item.type === 5 || item.type === 7) {
          return cssText
        }

        const { cssText, selectorText } = item;

        // const selectorText = item.selectorText
        const replaceSelector = (selector) => (selector
          .replace(/(^|\s)(head|body)\b/gi, 'micro-$2')
          .replace(/(html\s|^)/gi, 'micro-app[name=' + this.app.name + '] ')
        );

        let scopedSelectorText = '';

        try {
          scopedSelectorText = selectorText
            .split(/,\s*/)
            .map(replaceSelector)
            .join(', ');
        } catch (error) {
          console.log(item);
        }

        return scopedSelectorText + cssText.slice(selectorText.length)

        // const regex = new RegExp('^' + selectorText.replace(/(\[|\])/g, '\\$1'))
        // return cssText.replace(regex, scopedSelectorText)
      };

      const scopedCssText = cssRules.map(scopedHandler).join('\n');

      styleNode.textContent = scopedCssText;
      styleNode.__scoped__ = true;

      // return scopedCssText
      this.tempStyle.removeChild(textNode);
    } else {
      // 兼容异步载入的样式
      const microCss = this;
      const observer = new MutationObserver(function callback(mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            microCss.scoped(mutation.target);
            observer.disconnect();
          }
        });
      });

      observer.observe(styleNode, { childList: true });

      // Object.defineProperty(styleNode, '__observer__', {
      //   configurable: true,
      //   enumerable: false,
      //   value: observer,
      //   writable: true
      // })
    }
  }
}

/**
 * 自定义沙箱类
 */
// import MicroHistory from './micro-history'

// patchHistory()

class Sandbox {
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

  // 依赖上下文执行的方法
  static DEPEND_CONTEXT_METHODS = [
    'fetch',
    'addEventListener',
    'removeEventListener',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'postMessage',
    'getComputedStyle'
  ]

  // 绑定上下文
  static bindContext(value, context) {
    if (typeof value === 'function' && Sandbox.DEPEND_CONTEXT_METHODS.includes(value.name)) {
      const boundValue = value.bind(context);

      // // 继承自身属性
      // Object.getOwnPropertyNames(value).forEach((prop) => {
      //   boundValue[prop] = value[prop]
      // })

      // 继承原型
      Object.setPrototypeOf(boundValue, Object.getPrototypeOf(value));

      return boundValue
    }

    return value
  }

  constructor(app) {
    this.app = app;
    this.hookman = app.hookman;
    this.microWindow = {
      // receiveDataFromBaseApp(name) {
      //   const microStore = store.modules.get(app.name)
      //   if (microStore) {
      //     return microStore.getData(name)
      //   }
      // },
      // dispatchDataToBaseApp(payload) {}
    };
    this.microWindow[Symbol.unscopables] = Sandbox.SYMBOL_UNSCOPABLES;

    this.microCss = new MicroCSS(this);
    // this.MicroHistory = createMicroHistory(app.base)
    
    this.observeWindow();
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
    const app = this.app;
    // const rawWindow = window
    const microDocument = createMicroDocument(app);
    const microHistory = createMicroHistory(app);
    const microLocation = createMicroLocation(app);
    const hasOwnProperty = (prop) => this.microWindow.hasOwnProperty(prop) || rawWindow.hasOwnProperty(prop);

    const proxy = new Proxy(this.microWindow, {
      get: getter,
      set: setter,
      has: hasHandler,
      deleteProperty: deleteHandler,
      getOwnPropertyDescriptor: getDescriptorHandler,
      defineProperty: defineHandler,
      ownKeys: getOwnKeys,
    });

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

      const rawValue = rawWindow[prop];

      return Sandbox.bindContext(rawValue, rawWindow)
    }

    // Set operation proxy 
    function setter(target, prop, value) {
      if (!target.hasOwnProperty(prop) && rawWindow.hasOwnProperty(prop)) {
        const descriptor = Object.getOwnPropertyDescriptor(rawWindow, prop);

        if (descriptor) {
          descriptor.writable && Object.defineProperty(target, prop, {
            ...descriptor,
            value
          });
        } else {
          // 非 window 原生属性，只是 “恰巧” 子应用和主应用同时存在的变量
          target[prop] = value;
        }

      } else {
        target[prop] = value;
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
        Reflect.deleteProperty(target, prop);
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

    this.windowProxy = proxy;
  }

  // 在沙盒环境中执行脚本
  runScript(codes) {
    // console.log('[TMA] info: The micro-app codes is running in a sandbox environment')
    // 用函数作为代码执行器的好处：
    // - 提供密闭环境
    // - 代替 eval 并不高效的执行方式
    // 用 with 语法的原因，添加 microWindow 对象到作用域链的顶端，防止变量突破沙箱直接访问真实的 window 对象
    // 详情参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/with
    const context = this.windowProxy;
    Function('window', 'self', 'with(window){\n' + codes + '\n}')(context, context);
  }

  scopedCss(styles) {
    return this.microCss.scoped(styles)
  }
}

/**
 * 自定义 <micro-head> 元素
 */

const tagNames = {
  STYLE: 'STYLE'
};

class MicroHeadElement extends HTMLElement {
  constructor(microAppName) {
    super();

    this.microName = 'micro-head';
    this.bindMicroAppName = microAppName;
  }

  appendChild(node) {
    // debugger
    if (node.tagName === tagNames.STYLE) {
      const app = microApps.get(this.bindMicroAppName);
      app.sandbox.scopedCss(node);
    }

    return super.appendChild(node)
  }

  connectedCallback() {
    console.log(`[micro-head] is connected`);
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback() {}
}

/**
 * MicroApp 生命周期管理子类
 */
class MicroAppLifecycle {
  // microApp 实例生命周期集合
  static stateMap = {
    BEFORE_CREATE: 'beforeCreate',
    CREATED: 'created',
    PARSED: 'parsed',
    MOUNTED: 'mounted',
    DESTROYED: 'destroyed'
  }

  constructor(app) {
    this.app = app;
    this.state = this.beforeCreate();
  }

  beforeCreate() {
    this.state = MicroAppLifecycle.stateMap.BEFORE_CREATE;
    // TODO: 调用 beforeCreate 钩子函数
    console.log(`[micro-app] Call the 'beforeCreate' hook function`);
  }

  created() {
    this.state = MicroAppLifecycle.stateMap.CREATED;

    console.log(`[micro-app] is created`);
    // TODO: 调用 created 钩子函数
    console.log(`[micro-app] Call the 'created' hook function`);
  }

  parsed() {
    this.state = MicroAppLifecycle.stateMap.PARSED;

    console.log(`[micro-app] is parsed`);
    // TODO: 调用 parsed 钩子函数
    console.log(`[micro-app] Call the 'parsed' hook function`);
  }

  mounted() {
    this.state = MicroAppLifecycle.stateMap.MOUNTED;

    console.log(`[micro-app] is mounted`);
    // TODO: 调用 mounted 钩子函数
    console.log(`[micro-app] Call the 'mounted' hook function`);
  }

  destroyed() {
    this.state = MicroAppLifecycle.stateMap.DESTROYED;

    delete this.app; // 断开引用

    console.log(`[micro-app] is destroyed`);
    // TODO: 调用 destroyed 钩子函数
    console.log(`[micro-app] Call the 'destroyed' hook function`);
  }
}

/**
 * Custom Web Component to load micro-app
 * (c) Ecan Chen on 2021/12/23
 */

class MicroApp {
  constructor(name, container) {
    this.name = name;
    this.container = container; // 绑定当前 <micro-app> 元素

    // attributes => props
    this.initProps(this.container.attributes);

    // 初始化一些工具类
    // ------
    // Hookman: 生命周期钩子
    // HTMLParser: 解析 HTML 工具类
    // Sandbox: 子应用沙箱环境
    // ------
    this.hookman = new Hookman();
    this.lifecycles = new MicroAppLifecycle(this);
    this.parser = new HTMLParser(this);
    this.sandbox = new Sandbox(this);

    // Check for Fetch API
    // 默认使用浏览器自带 Fetch API, TODO: 允许自定义配置请求工具，比如：Axios
    if (rawWindow.fetch) {
      this.fetch = rawWindow.fetch.bind(rawWindow);
    } else {
      // 当前浏览器不支持 Fetch API
      throw Error(`[micro-app] The current browser does not support the 'Fetch' API`)
    }

    // this.registerHooks()
    this.hookman.addHook('html:parsed', this.onHTMLParsed.bind(this));

    this.lifecycles.created();
    // this.state = lifecycles.CREATED
    // this.hookman.callHook('app:created')
  }

  initProps(attrs) {
    let props = {};

    for (let i = 0, len = attrs.length; i < len; i++) {
      const attrNode = attrs[i];
      props[attrNode.name] = attrNode.value;
    }

    console.log(`[micro-app-debugger] '${props.name}' props is `, props);

    this.base = props.base || ('/' + props.name); // 如果 base 参数没有配置，默认使用 name 代替
    this.props = props, props = null;
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
    this.parseEntry();
  }

  // 解析子应用 HTML 文档
  parseEntry() {
    let { src: url } = this.props;

    // Check for 'src' attribute
    if (typeof url !== 'string') {
      throw Error(`[micro-app] 'src' attribute expects to receive a string type`)
    }

    // Compatible with (abs|rel) url
    url = normalizeUrl(url);

    // const assertion = assertType.expect(url, 'string') // 断言：期待 'url' 是一个字符串
    
    // if (!assertion.result) {
    //   return console.error(`[TMA] ${new TypeError('<micro-app> `src` attribute ' + assertion.message)}`)
    // }

    this.fetch(url)
      .then(readAsText) // Compatible with stream reading
      .then((html) => this.parser.parse(html));
  }

  // Hook: When html parsed
  onHTMLParsed(parser) {
    this.lifecycles.parsed(); // 调用 parsed 钩子

    const { styles, scripts } = parser;

    // Style processing flow: fetch -> isolate -> render
    const promise$1 = Promise.resolve(styles)
      .then(this.fetchResources.bind(this, 'style'))
      // .then(this.isolateStyles.bind(this)) // Since style isolation is performed on 'document.head.appendChild'
      .then(this.render.bind(this));

    // Script processing flow: fetch -> run
    const promise$2 = Promise.resolve(scripts)
      .then(this.fetchResources.bind(this, 'script'));
      // .then(this.mount.bind(this))

    Promise.all([promise$1, promise$2]).then(this.mount.bind(this));
  }

  // 获取外部资源
  fetchResources(type, resources) {
    const props = this.props;
    const outlineResources = resources.filter((item) => item.isExternal);

    const promises = outlineResources.map((item) => {
      const url = normalizeUrl(item[type === 'style' ? 'href' : 'src'], /* base */ props.src);
      return this.fetch(url).then((response) => response.text())
    });

    return Promise.all(promises).then((resList) => {
      resList.forEach((code, index) => outlineResources[index].code = code);
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
    const { template } = this.parser;
    // const head = rawDocument.createElement('micro-head')
    const head = new MicroHeadElement(this.name); // 手动实例化绑定 app 关系
    const body = rawDocument.createElement('micro-body');
    // const fragment = rawDocument.createDocumentFragment()

    styles.forEach((item) => {
      const style = rawDocument.createElement('style');
      const textNode = rawDocument.createTextNode(item.code);
      style.type = 'text/css', style.appendChild(textNode);
      head.appendChild(style);
    });

    body.innerHTML = template;
    this.container.append(head, body);

    // const shadow = this.shadowRoot
    // this.container.appendChild(head), this.container.appendChild(body)
  }

  mount() {
    const sandbox = this.sandbox;
    this.parser.scripts.forEach((item) => sandbox.runScript(item.code));
    // console.log('====================sandbox====================')
    // console.log(this.sandbox)
    this.lifecycles.mounted();
  }

  unmount() {
    console.log('micro-app unmounted');
  }

  destroy() {
    this.container.innerHTML = '';
    this.hookman.clearHooks();
    this.lifecycles.destroyed();
    this.parser.teardown();
    // this.sandbox.release()

    delete this.container;
    delete this.hookman;
    delete this.lifecycles;
    delete this.parser;
    delete this.sandbox;
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

/**
 * A custom <micro-app> element that is rendered as iframe-like element
 * 
 * Custom attributes description:
 * - name: 微应用唯一标志的名称
 * - src: 微应用访问 URL 源
 * 
 * (c) Ecan Chen (d) 2022/1/13
 */

const normalizeSelectors = (selectors) => selectors.replace(/(^|\s)(head|body)[^\w\-]?/gi, 'micro-$2');

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
class MicroAppElement extends HTMLElement {
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

    console.log('[micro-app] is creating...');
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
      console.error(`[micro-app] error: 'document.getElementById' received an invalid parameter`);
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
    let name = this.getAttribute('name');

    // Compatible 'name' attribute is null
    // 用户没有指定 <micro-app> 元素 name 属性，将创建一个随机名
    // ------
    // 备注：如果子应用不存在与基座应用交互，则 name 属性不是必需的
    // ------
    if (!name) {
      name = createRandomName();
      console.warn(`[micro-app] warning: The <micro-app> element has no configured 'name' attribute, We created a random name '${name}' for it`);
    }

    if (microApps.has(name)) {
      // 微应用重名判断
      throw Error(`[micro-app] named '${name}' already exists, Please check and try again`)
    }

    this.name = name; // 绑定 MicroApp 名称

    // 同步创建 MicroApp 实例，管理子应用的生命周期
    const app = new MicroApp(name, this);
    microApps.set(name, app);

    // 定义一个浏览器内部属性，供外界访问 micro-app 实例
    Object.defineProperty(this, '__microApp__', {
      configurable: true,
      enumerable: false,
      value: app,
      writable: true
    });

    app.start();
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
    console.log(`[micro-app] is disconnected`);

    const app = this.__microApp__;
    app.destroy();

    microApps.delete(app.name), delete this.__microApp__;

    console.log(this);
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

/**
 * 自定义 <micro-anchor> 超链接元素，用于微应用中代替 a 标签使用
 */
class MicroAnchorElement extends HTMLAnchorElement {
  constructor() {
    super();
    this.__microTagName__ = 'micro-anchor';
  }

  connectedCallback() {
    // console.log('<micro-anchor> element is connected')
    // const href = this.getAttribute('href')
    // this.setAttribute('href', '/vue-app' + href)
  }

  disconnectedCallback() {

  }

  adoptedCallback() {

  }

  attributeChangedCallback(prop, oldVal, newVal) {
    // console.log('<micro-anchor> element attributes is changed')
    // console.log(prop, oldVal, newVal)
  }
}

const microAppTagName = 'micro-app';

// Register <micro-app> custom native component
// - 需要判断模块执行环境，理论上只能在浏览器环境中执行
function registerMicroApp() {
  // Assertion.expect('engines').toEqual('browser') // 断言：期待引擎是 “浏览器” 否则退出程序
  if (!isBrowser) {
    // 仅支持浏览器环境中运行
    throw Error(`[micro-app] only supports running in browser environment`)
  }

  if (rawCustomElements) {
    if (rawCustomElements.get(microAppTagName)) {
      // 检查 <micro-app> 元素是否已经注册过
      console.warn(`[micro-app] warning: It is found that the <micro-app> element has duplicate registrations`);
    } else {
      rawCustomElements.define(microAppTagName, MicroAppElement);
      rawCustomElements.define('micro-head', MicroHeadElement);
      rawCustomElements.define('micro-anchor', MicroAnchorElement, { extends: 'a' });
      rawCustomElements.define('micro-image', MicroImageElement, { extends: 'img' });
    }
    // customElements.define('micro-anchor', MicroAnchorElement, { extends: 'a' })
  } else {
    // 当前浏览器不支持 'window.customElements' API
    throw Error(`[micro-app] error: The current browser does not support the 'window.customElements' API`)
  }
}

/**
 * [micro-app] 框架调度中心
 */

// 向目标微应用派发数据接口
// 备注：name 是可选的，如果没有指定微应用，表示当前基座数据是微应用共享的
function dispatchDataToMicroApp(name, payload) {
  // normalize parameters
  if (name && payload === undefined) {
    payload = name, name = undefined;
  }

  if (!isPlainObject(payload)) {
    throw Error(`[micro-app] Illegal 'payload' parameter`)
  }

  if (!name) {
    // TODO: 
    store.setData(payload);
  } else if (typeof name === 'string') {
    // 检查微应用是否存在
    if (!microApps.has(name)) {
      // 您所派发的微应用不存在
      throw Error(`[micro-app] named '${name}' does not exist`)
    }

    store.setData(name, payload);
  } else {
    throw Error(`[micro-app] Illegal 'name' parameter`)
  }
}

export { dispatchDataToMicroApp, registerMicroApp };

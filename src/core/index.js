import { isBrowser } from '../utils/index'
import { rawCustomElements } from '../native_interface'
import * as components from '../components/index'

const microAppTagName = 'micro-app'

// Register <micro-app> custom native component
// - 需要判断模块执行环境，理论上只能在浏览器环境中执行
export function registerMicroApp() {
  // Assertion.expect('engines').toEqual('browser') // 断言：期待引擎是 “浏览器” 否则退出程序
  if (!isBrowser) {
    // 仅支持浏览器环境中运行
    throw Error(`[micro-app] only supports running in browser environment`)
  }

  if (!rawCustomElements) {
    // 当前浏览器不支持 'window.customElements' API
    throw Error(`[micro-app] error: The current browser does not support the 'window.customElements' API`)
  }

  if (rawCustomElements.get(microAppTagName)) {
    // 检查 <micro-app> 元素是否已经注册过
    console.warn(`[micro-app] warning: It is found that the <micro-app> element has duplicate registrations`)
  } else {
    Object.keys(components).forEach((className) => {
      const component = components[className]
      rawCustomElements.define(component.microName, component, component.options)
    })
  }
}
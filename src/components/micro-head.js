/**
 * 自定义 <micro-head> 元素
 */
import { microApps } from '../interface'

const tagNames = {
  STYLE: 'STYLE'
}

export default class MicroHeadElement extends HTMLElement {
  static microName = 'micro-head';

  constructor(microAppName) {
    super();
    this.bindMicroAppName = microAppName
  }

  appendChild(node) {
    // debugger
    if (node.tagName === tagNames.STYLE) {
      const app = microApps.get(this.bindMicroAppName)
      app.sandbox.scopedCss(node)
    }

    return super.appendChild(node)
  }

  connectedCallback() {
    console.log(`[micro-head] is connected`)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback() {}
}
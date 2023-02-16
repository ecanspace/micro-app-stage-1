/**
 * 自定义 <micro-image> 微应用 DOM 元素
 */
import { normalizeUrl } from '../utils/index'
import { microApps } from '../interface'

export default class MicroImageElement extends HTMLImageElement {
  static microName = 'micro-image';
  static options = {
    extends: 'img' 
  }

  constructor(microAppName) {
    super();
    this.bindMicroAppName = microAppName
  }

  connectedCallback() {
    console.log('<micro-image> element is connected')
    const src = this.getAttribute('src')
    this.setAttribute('src', normalizeUrl(src, microApps.get(this.bindMicroAppName).props.src))
  }

  disconnectedCallback() {
    
  }

  adoptedCallback() {

  }

  attributeChangedCallback(prop, oldVal, newVal) {
    console.log('<micro-image> element attributes is changed')
    // console.log(prop, oldVal, newVal)
  }
}
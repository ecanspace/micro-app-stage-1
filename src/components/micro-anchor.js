/**
 * 自定义 <micro-anchor> 超链接元素，用于微应用中代替 a 标签使用
 */
export default class MicroAnchorElement extends HTMLAnchorElement {
  static microName = 'micro-anchor';
  static options = {
    extends: 'a' 
  }

  constructor() {
    super();
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
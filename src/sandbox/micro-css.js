/**
 * 自定义 MicroCSS 样式隔离类
 */
import { rawDocument } from '../native_interface'

export default class MicroCSS {
  constructor(sandbox) {
    // this.sandbox = sandbox
    this.app = sandbox.app

    const style = rawDocument.createElement('style')

    rawDocument.body.appendChild(style) // Append 之后才能访问 sheet 对象

    if (style.sheet) {
      style.sheet.disabled = true
    }

    this.tempStyle = style
  }

  scoped(styleNode) {
    // 标记是否处理过，如果为 true 返回
    if (styleNode.__scoped__) {
      return 'The style Node has already been processed';
    }

    const cssText = styleNode.textContent

    if (cssText) {
      const textNode = rawDocument.createTextNode(cssText)

      this.tempStyle.appendChild(textNode)

      const styleSheet = this.tempStyle.sheet
      const cssRules = Array.from(styleSheet.cssRules) // 类数组转数组对象

      // const cssPrefix = 'micro-app[name=' + this.app.name + ']'

      const scopedHandler = (item) => {
        if (item.type === 4) {
          return '@media ' + item.conditionText + ' { ' + Array.from(item.cssRules).map(scopedHandler).join('\n') + ' }'
        }

        // 忽略 @font-face, @keyframes 规则
        if (item.type === 5 || item.type === 7) {
          return cssText
        }

        const { cssText, selectorText } = item

        // const selectorText = item.selectorText
        const replaceSelector = (selector) => (selector
          .replace(/(^|\s)(head|body)\b/gi, 'micro-$2')
          .replace(/(html\s|^)/gi, 'micro-app[name=' + this.app.name + '] ')
        )

        let scopedSelectorText = ''

        try {
          scopedSelectorText = selectorText
            .split(/,\s*/)
            .map(replaceSelector)
            .join(', ')
        } catch (error) {
          console.log(item)
        }

        return scopedSelectorText + cssText.slice(selectorText.length)

        // const regex = new RegExp('^' + selectorText.replace(/(\[|\])/g, '\\$1'))
        // return cssText.replace(regex, scopedSelectorText)
      }

      const scopedCssText = cssRules.map(scopedHandler).join('\n')

      styleNode.textContent = scopedCssText
      styleNode.__scoped__ = true

      // return scopedCssText
      this.tempStyle.removeChild(textNode)
    } else {
      // 兼容异步载入的样式
      const microCss = this
      const observer = new MutationObserver(function callback(mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            microCss.scoped(mutation.target)
            observer.disconnect()
          }
        })
      })

      observer.observe(styleNode, { childList: true })

      // Object.defineProperty(styleNode, '__observer__', {
      //   configurable: true,
      //   enumerable: false,
      //   value: observer,
      //   writable: true
      // })
    }
  }
}
/**
 * HTML 解析类 (c) Ecan Chen (d) 2022/1/18
 */

// 正则匹配集合
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/g
const HTML_HEAD_REGEX = /<head[^>]*>[\s\S]*?<\/head>/i
const HTML_BODY_REGEX = /<body[^>]*>[\s\S]*?<\/body>/i
const LINK_TAG_REGEX = /<link[^>]*>/gi
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi
const SCRIPT_TAG_REGEX = /<script[^>]*>[\s\S]*?<\/script>/gi
const TAG_ATTRS_REGEX = /\s[^=\s\/]+(=('|")[^'"]*\2)?/g
const START_OR_END_TAG_REGEX = /<\/?(body|style|script)[^>]*>/gi
// const ANCHOR_TAG_REGEX = /<a[^>]*>[\s\S]*?<\/a>/gi

// Link 标签 rel 集合
const relMap = {
  STYLESHEET: 'stylesheet'
}

export default class HTMLParser {
  constructor(app) {
    this.app = app
    this.hookman = app.hookman
    this.template = ''
    this.links = []
    this.styles = []
    this.scripts = []
  }

  teardown() {
    this.app = null
    this.hookman = null
    this.template = ''
    
    delete this.links
    delete this.styles
    delete this.scripts
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
    matched = html.match(HTML_HEAD_REGEX)
    if (matched) {
      const head = matched[0]
      this.parseHead(head)
      // 更新 HTML 减少不必要的查找
      html = html.slice(matched.index + head.length)
      matched = null
    }
  
    // 解析 body 标签
    matched = html.match(HTML_BODY_REGEX)
    if (matched) {
      const body = matched[0]
      this.parseTemplate(body)
      matched = null
    }

    this.hookman.callHook('html:parsed', this) // 解析完成通知 App 继续下一步操作
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
    ])
  }

  // 解析头部 link 标签
  parseLink(match) {
    const props = this.parseAttrs(match)

    if (props.rel === relMap.STYLESHEET) {
      this.styles.push({
        href: props.href,
        code: '',
        isExternal: true
      })
    } else {
      this.links.push(props)
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
    })

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
    const scripts = this.scripts
    const scriptStartTag = match.match(/<script[^>]*>/i)[0]
    const props = this.parseAttrs(scriptStartTag)

    let inlineScript = false;

    // Check for 'src' attribute
    if (props.src) {
      scripts.push({ ...props, code: '', isExternal: true })
    } else {
      inlineScript = true, scripts.push({
        isInline: inlineScript,
        code: match.replace(START_OR_END_TAG_REGEX, '')
      })
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
    const attrs = str.match(TAG_ATTRS_REGEX) || []

    const reduceHandler = (props, item) => {
      // 属性简写时，默认值为 true, 比如：<script src="/xxx" defer></script> 中的 'defer'
      const [name, value = true] = item.trim().replace(/['"]/g, '').split('=')
      return props[name] = value, props
    }

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
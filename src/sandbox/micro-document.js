import { isFunction } from '../utils/index'
import { rawDocument } from '../native_interface'

// 创建自定义 microDocument 对象
export function createMicroDocument(app) {
  // const microDocument = new MicroDocument(container)
  const container = app.container
  
  function getter(target, prop) {
    const context = Reflect.has(target, prop) ? target : rawDocument
    const value = Reflect.get(context, prop)

    // console.log('==================getter==================')
    // console.log(prop, context)

    return isFunction(value) ? value.bind(context) : value
  }

  function setter(target, prop, value) {
    const inTarget = Reflect.has(target, prop)
    const inRawDocument = Reflect.has(rawDocument, prop)

    if (inTarget || inRawDocument) {
      const context = inTarget ? target : rawDocument
      const descriptor = Object.getOwnPropertyDescriptor(context, prop)

      if (descriptor) {
        descriptor.writable && Object.defineProperty(context, prop, {
          ...descriptor,
          value
        })
      } else {
        Reflect.set(context, prop, value)
      }
    } else {
      // 非原生属性，则直接赋值到 target 目标对象上
      Reflect.set(target, prop, value)
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
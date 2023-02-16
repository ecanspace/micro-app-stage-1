/**
 * 子应用 History 操作沙箱
 */
import { rawHistory } from '../native_interface'
import { normalizePath, isFunction } from '../utils/index'

export function createMicroHistory(app) {
  const base = app.base, microHistory = {}

  // 拦截子应用内部 history.pushState 调用
  // 添加 URL 前缀
  microHistory.pushState = function customPushState(...args) {
    // debugger
    // const url = this.base + args.pop()
    const url = normalizePath(base, args.pop())
    // console.log(url)
    rawHistory.pushState(...args, url)
  }

  microHistory.replaceState = function customReplaceState(...args) {
    // debugger
    // const url = this.base + args.pop()
    const url = normalizePath(base, args.pop())
    // console.log(url)
    rawHistory.replaceState(...args, url)
  }

  function getter(target, prop) {
    // const context = Reflect.has(target, prop) ? target : rawHistory
    // const value = Reflect.get(context, prop)
    if (target.hasOwnProperty(prop)) {
      return Reflect.get(target, prop)
    }

    const value = Reflect.get(rawHistory, prop)

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
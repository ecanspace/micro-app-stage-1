/**
 * [micro-app] 框架调度中心
 */
import { microApps } from '../interface'
import { isPlainObject } from '../utils/index'
import { store } from './store'

// 向目标微应用派发数据接口
// 备注：name 是可选的，如果没有指定微应用，表示当前基座数据是微应用共享的
export function dispatchDataToMicroApp(name, payload) {
  // normalize parameters
  if (name && payload === undefined) {
    payload = name, name = undefined
  }

  if (!isPlainObject(payload)) {
    throw Error(`[micro-app] Illegal 'payload' parameter`)
  }

  if (!name) {
    // TODO: 
    store.setData(payload)
  } else if (typeof name === 'string') {
    // 检查微应用是否存在
    if (!microApps.has(name)) {
      // 您所派发的微应用不存在
      throw Error(`[micro-app] named '${name}' does not exist`)
    }

    store.setData(name, payload)
  } else {
    throw Error(`[micro-app] Illegal 'name' parameter`)
  }
}
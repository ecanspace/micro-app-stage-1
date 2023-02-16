/**
 * 自定义子应用 Location 代理对象
 */
import { rawLocation, rawURL } from '../native_interface'
// import { normalizePath } from '../utils/index'

export function createMicroLocation(app) {
  const { base, props } = app
  const microLocation = new rawURL(props.src)

  microLocation.assign = function customAssign(...args) {
    return rawLocation.assign(...args)
  }

  microLocation.reload = function customReload(...args) {
    return rawLocation.reload(...args)
  }

  microLocation.replace = function customReplace(...args) {
    return rawLocation.replace(...args)
  }

  microLocation.toString = function customToString(...args) {
    return rawLocation.toString(...args)
  } 

  microLocation.getPathname = function () {
    return rawLocation.pathname.replace(new RegExp('^' + base), '')
  }

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
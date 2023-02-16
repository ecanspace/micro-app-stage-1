/**
 * Tool Library (c) Ecan Chen (d) 2022/1/17
 */
import { rawWindow, rawLocation } from '../native_interface'

const rawToString = Object.prototype.toString

// What constructor of this value??
export const classof = (value) => rawToString.call(value).slice(8, -1)

// Is browser environment??
export const isBrowser = typeof window !== 'undefined'

// Is function??
export const isFunction = (value) => typeof value === 'function'

// Is plain Object??
export const isPlainObject = (value) => classof(value) === 'Object'

// Normalize pathname
export const normalizePath = (...args) => args.join('/').replace(/(?<!:)\/{2,}/g, '/')
// export const normalizeAndJoinPath = (...args) => args.map((path) => path.replace(/^\/?(\S*?)\/?$/, '/$1')).join('')

// Normalize (rel|abs) url 
// If url is relative address, Resolve it based on the current 'location.origin'
// export const normalizeUrl = (url, base) => new rawWindow.URL(url, base || rawLocation.origin).href
export const normalizeUrl = (url, base) => /^https?/.test(url) ? url : normalizePath(base || rawLocation.origin, url)

// Is constructor??
export function isCtor(value) {
  const proto = value.prototype
  return /^class\s+/.test(value.toString()) || (proto && proto.constructor === value && Object.getOwnPropertyNames(proto).length > 1)
}

// 随机字符集
const chars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 
  'u', 'v', 'w', 'x', 'y', 'z'
]

// Create a random name 
export function createRandomName(len = 6) {
  let max = chars.length, result = ''

  while(len--) {
    const index = Math.floor(Math.random() * max)
    result += chars[index]
  }

  return result
}

// stdout response text
export function readAsText(response) {
  const contentType = response.headers['Content-Type']

  // Content-Type: text/html; charset=utf-8
  if (!contentType || contentType.match(/charset=utf-8/i)) {
    return response.text()
  }

  // 流读取
  return response.blob().then(blob => new Promise((resolve, reject) => {
    const reader = new rawWindow.FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(blob)
  }))
}
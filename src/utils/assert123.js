/**
 * 自定义断言判断工具
 * 
 * 什么是断言？
 * - 断言是程序执行到某个位置，期待某种条件满足预期，结果 “为真” 继续执行，如果 “为假” 退出程序或其它操作
 * 
 * (c) Ecan Chen (d) 2022/1/13
 */
import { inBrowser } from './util'

const STATUS_PENDING = 'pending' // 断言中
const STATUS_SUCCESS = 'success' // 断言成功
const STATUS_FAILED  = 'failed'  // 断言失败

export const Assertion = {
  currentValue: undefined,

  status: '',

  result: false,

  expect(value) {
    if (this.status === STATUS_PENDING) {
      return 
    }

    this.status = STATUS_PENDING
    this.result = false

    if (value === 'engines') {
      this.currentValue = value
      return this
    }
  },

  toEqual(value) {
    this.result = value === this.currentValue
    this.end()
  },

  end() {
    const result = this.result
    this.status = result ? STATUS_SUCCESS : STATUS_FAILED
  }
}
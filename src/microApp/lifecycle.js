/**
 * MicroApp 生命周期管理子类
 */
export default class MicroAppLifecycle {
  // microApp 实例生命周期集合
  static stateMap = {
    BEFORE_CREATE: 'beforeCreate',
    CREATED: 'created',
    PARSED: 'parsed',
    MOUNTED: 'mounted',
    DESTROYED: 'destroyed'
  }

  constructor(app) {
    this.app = app
    this.state = this.beforeCreate()
  }

  beforeCreate() {
    this.state = MicroAppLifecycle.stateMap.BEFORE_CREATE
    // TODO: 调用 beforeCreate 钩子函数
    console.log(`[micro-app] Call the 'beforeCreate' hook function`)
  }

  created() {
    this.state = MicroAppLifecycle.stateMap.CREATED

    console.log(`[micro-app] is created`)
    // TODO: 调用 created 钩子函数
    console.log(`[micro-app] Call the 'created' hook function`)
  }

  parsed() {
    this.state = MicroAppLifecycle.stateMap.PARSED

    console.log(`[micro-app] is parsed`)
    // TODO: 调用 parsed 钩子函数
    console.log(`[micro-app] Call the 'parsed' hook function`)
  }

  mounted() {
    this.state = MicroAppLifecycle.stateMap.MOUNTED

    console.log(`[micro-app] is mounted`)
    // TODO: 调用 mounted 钩子函数
    console.log(`[micro-app] Call the 'mounted' hook function`)
  }

  destroyed() {
    this.state = MicroAppLifecycle.stateMap.DESTROYED

    delete this.app // 断开引用

    console.log(`[micro-app] is destroyed`)
    // TODO: 调用 destroyed 钩子函数
    console.log(`[micro-app] Call the 'destroyed' hook function`)
  }
}
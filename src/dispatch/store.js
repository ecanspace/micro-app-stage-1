/**
 * [micro-app] 数据管理中心
 */
// export function merge(target, source) {}

export class DataStore {
  constructor(parentStore) {
    this.data = parentStore ? Object.create(parentStore.data) : {}
    this.modules = new Map()
  }

  getData(name) {
    const data = JSON.parse(JSON.stringify(this.data))
    return name ? data[name] : data
  }

  setData(name, payload) {
    if (name) {
      const mudules = this.modules
      let microStore = mudules.get(name)

      if (!microStore) {
        const store = new DataStore(this)
        mudules.set(name, store)
        microStore = store
      }

      microStore.setData(undefined, payload)
    } else {
      this.data = Object.assign(this.data, payload)
    }
  }
}

export const store = new DataStore()
import '../public-path'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

// 重置 URL 接口
// const originDescriptor = Object.getOwnPropertyDescriptor(URL, 'origin')
// Object.defineProperty(URL, 'origin', {
//   ...originDescriptor,
//   get() {
//     return 'http://localhost:sasdsada/'
//   }
// })

// Object.defineProperty(window, 'location', {
//   configurable: true,
//   enumerable: true,
//   get() {
//     return new URL('http://localhost:8080/')
//   }
// })

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

<template>
  <div class="nuxt-app">
    <h1>Welcome to Nuxt App</h1>
    <div class="nuxt-link__wrap">
      <nuxt-link to="/vue-app">访问 Vue 应用</nuxt-link>
    </div>
    <!-- <div class="nuxt-link__wrap">
      <nuxt-link to="/react-app">访问 React 应用</nuxt-link>
    </div> -->
    <div class="nuxt-link__wrap">
      <nuxt-link to="/bst-gateway">综合管理后台</nuxt-link>
    </div>
  </div>
</template>

<script>
// import { dispatchDataToMicroApp } from 'tzcloud-micro-app'
export default {
  // mounted() {
  //   dispatchDataToMicroApp('vue-app', { message: '123' })

  //   const microApp = microApps.get('vue-app')
  //   microApp.dataFlow.setData({
  //     message: 'Hello World'
  //   })

  //   const microApps = window.microApps // Map
  //   const vueApp = microApps.get('vue-app')
  //   vueApp.events.setData({
  //     message: 'hello world'
  //   })
  // }
}
</script>

<style scoped>
.nuxt-app {
  padding-top: 15vh;
}
.nuxt-app h1,
.nuxt-link__wrap {
  text-align: center;
}
</style>

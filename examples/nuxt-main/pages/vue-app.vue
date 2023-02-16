<template>
  <div class="vue-app__container">
    <h1>Current micro-app is: Vue App</h1>
    <!-- <nuxt-link to="/react-app">访问 React 应用</nuxt-link> -->
    <!-- <micro-app name="vue-app" src="http://localhost:8080/" publicPath="/app/"></micro-app> -->
    <micro-app name="vue-app" src="http://localhost:8080/"></micro-app>
  </div>
</template>

<script>
export default {
  // mounted() {
  //   window.addEventListener('popstate', (...args) => {
  //     console.log(...args)
  //   })
  // }
};
</script>

<style scoped>

</style>
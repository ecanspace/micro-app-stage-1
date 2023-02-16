import path from 'path'

// // 代理配置
// const proxyTable = {
//   'manage': 'https://k8sztmanage.gzsqcp.com',
//   'sso': "http://nginx.trunk.fat.com:9011",
// }

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  alias: {
    'tzcloud-micro-app': path.resolve(__dirname, '../../src/index.js')
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt-main',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [{
      charset: 'utf-8'
    }, {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    }, {
      hid: 'description',
      name: 'description',
      content: ''
    }, {
      name: 'format-detection',
      content: 'telephone=no'
    }],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/index'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    // baseURL: 'http://localhost:8084/',
    proxy: true, // 表示开启代理
  },

  proxy: {
    '/manage': 'https://k8sztmanage.gzsqcp.com',
    '/sso': "http://nginx.trunk.fat.com:9011",
    '/base': "http://nginx.trunk.fat.com:9012",
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
    // extend(config) {
    //   const devServer = config.devServer = config.devServer || {}

    //   devServer.proxy = {
    //     'manage': 'https://k8sztmanage.gzsqcp.com',
    //     'sso': "http://nginx.trunk.fat.com:9011"
    //   }
    // }
  },

  server: {
    host: '0.0.0.0',
    port: 4000
  },

  vue: {
    config: {
      ignoredElements: ['micro-app']
    }
  }
}

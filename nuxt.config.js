export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  target: 'server',
  server: {
    port: 4000,
    host: '0.0.0.0'
  },
  head: {
    titleTemplate: '%s - operator',
    title: 'scale-master',

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]

  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/fonts.scss',
    '@mdi/font/css/materialdesignicons.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/axios.js'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Style Resources
  styleResources: {
    scss: [
      '~/assets/variables.scss',
    ]
  },

  // Eslint config
  eslint: {
    fix: true,
    quiet: true
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  vuetify: {
    icons: {
      iconfont: 'mdi',
    },
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    extend(config, ctx) {
      config.node = { fs: 'empty' }
    },
  },

  // Runtime Env
  publicRuntimeConfig: {
    baseURL: process.env.BASE_URL || 'http://localhost:4000',
    apiURL: process.env.API_URL || 'http://localhost:7000',
    centerURL: process.env.CENTER_URL || 'http://localhost:8000',
    env: process.env.ENVIRONMENT || 'development'
  },
}

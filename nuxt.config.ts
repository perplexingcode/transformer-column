// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['moment'],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [],
  css: [
    '~/assets/css/app.css',
    '~/assets/css/elements.css',
    '~/assets/css/components.css',
    '~/assets/css/text.css',
  ],
  components: {
    global: true,
    dirs: ['~/components'],
  },
  runtimeConfig: {
    public: {
      rootDir: process.env.ROOT_DIR,
      dbPrefix: process.env.DB_PREFIX,
      backendUrl: process.env.BACKEND_URL,
      token: process.env.TOKEN,
      mode: process.env.MODE || 'prod',
    },
  },
});

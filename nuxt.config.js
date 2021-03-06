import webpack from "webpack";

export default {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: "Piti",
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes, viewport-fit=cover",
      },
      {
        hid: "description",
        name: "description",
        content: "Follow along workouts everyday, everywhere",
      },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/icon.png" },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css?family=Nunito:400,600,700,800,900&display=swap",
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css?family=Teko:300,400,500,600,700&display=swap",
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700&display=swap",
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Work+Sans&display=swap",
      },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  layoutTransition: {
    name: "page",
  },
  env: {
    endpoint:
      process.env.NODE_ENV == "development"
        ? "http://localhost:1337"
        : "https://piti-api.herokuapp.com",
  },
  /*
   ** Global CSS
   */
  css: [
    "~/assets/icons/font/flaticon.css",
    "./assets/styles/icons.css",
    "~/assets/styles/general.scss",
    "~/assets/styles/buttons.scss",
    "~/assets/styles/inputs.scss",
    "~/assets/styles/text.scss",
    "~/assets/styles/other.scss",
    "~/assets/styles/layout.scss",
    "~/assets/styles/animations.scss",
    "~/assets/styles/utilities.scss",
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/filters", 
    "~/plugins/components.js", 
    "~/plugins/mixins", 
    { src: "~/plugins/initializeStore.js", mode: 'client' },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxtjs/style-resources"],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/apollo", "@nuxtjs/axios", "@nuxtjs/pwa"],
  pwa: {
    meta: {
      name: "Piti",
    },
    manifest: {
      name: "Piti",
      short_name: "Piti",
      background_color: "#FDDCBD",
      // theme_color: "#FDDCBD",
      orientation: "portrait",
      display: "fullscreen",
      start_url:
        process.env.NODE_ENV == "development"
          ? "http://localhost:3000/dashboard"
          : "https://www.piti.live/dashboard",
    },
  },
  apollo: {
    tokenName: "piti-token",
    clientConfigs: {
      default: {
        httpEndpoint:
          process.env.NODE_ENV == "development"
            ? "http://localhost:1337/api/graphql"
            : "https://piti-api.herokuapp.com/api/graphql",
      },
    },
  },
  styleResources: {
    scss: ["~/assets/styles/variables.scss"],
  },
  /*
   ** Build configuration
   */
  build: {
    plugins: [
      new webpack.ProvidePlugin({
        _: "lodash",
      }),
    ],
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      });
    },
  },
};

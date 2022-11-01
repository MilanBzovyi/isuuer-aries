import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

const vuetify = new Vuetify({
  theme: {
    options: { customProperties: true },
    // info,warn,success,errorはデフォルトのまま
    themes: {
      light: {
        // ブライトトーン
        primary: "#00ADA9",
        // ライトトーン
        secondary: "#F9C270",
        // ソフトトーン
        accent: "#5D5099",
      },
      dark: {
        // ダークトーン
        primary: "#0075A9",
        // ディープトーン
        secondary: "#D28300",
        // ダルトーン
        accent: "#903E84",
      },
    },
  },
});
export default vuetify;

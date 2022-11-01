<template>
  <v-app-bar color="primary" app clipped-left elevation="0">
    <h3>
      <span class="white--text" @click="showHome" style="cursor: pointer"
        >健康診断</span
      >
    </h3>
    <v-spacer></v-spacer>

    <!-- <global-nav-menu
      icon-name="mdi-home"
      tool-tip-value="ホーム"
      margin-right="2"
      :to="{ name: 'UserBooks', params: { userId: userId } }"
    /> -->

    <global-nav-menu
      icon-name="mdi-account-multiple"
      tool-tip-value="受診者リスト"
      margin-right="2"
      :to="{ name: 'Patients' }"
    />

    <!-- <global-nav-menu
      icon-name="mdi-book-open-variant"
      tool-tip-value="みんなの書籍"
      margin-right="2"
      :to="{ name: 'Books' }"
    />

    <global-nav-menu
      icon-name="mdi-timeline"
      tool-tip-value="みんなのタイムライン"
      margin-right="2"
      :to="{ name: 'Timeline' }"
    /> -->

    <v-spacer></v-spacer>

    <!-- いいね機能を止める -->
    <!-- <global-nav-menu icon-name="mdi-bell" toolTipValue="通知" /> -->

    <!-- <global-nav-menu
      icon-name="mdi-comment-question"
      toolTipValue="お問い合わせ"
      :to="{ name: 'Support' }"
    />

    <template v-if="readOnlyMode">
      <global-nav-menu
        icon-name="mdi-account-plus"
        toolTipValue="サインアップ"
      />
      <global-nav-menu
        icon-name="mdi-login"
        toolTipValue="ログイン"
        :to="{ name: 'Login' }"
      />
    </template>
    <template v-else>
      <global-nav-menu
        icon-name="mdi-logout"
        toolTipValue="ログアウト"
        :to="{ name: 'Login' }"
      />
    </template> -->
  </v-app-bar>
</template>
<script>
import GlobalNavMenu from "@/components/GlobalNavMenu.vue";
// import * as authApi from "@/modules/api/auth.js";
export default {
  components: { GlobalNavMenu },
  data() {
    return {
      // userId: null,
      // readOnlyMode: false,
    };
  },
  async created() {
    // this.readOnlyMode = authApi.isReadOnlyMode();
    // if (!this.readOnlyMode) {
    //   this.userId = (await authApi.getUserInSession()).userId;
    // }
  },
  methods: {
    showHome() {
      this.$router.push({ name: "Patients" });

      // if (authApi.isReadOnlyMode()) {
      //   this.$router.push({ name: "Books" });
      // } else {
      //   this.$router.push({
      //     name: "UserBooks",
      //     params: { userId: this.userId },
      //   });
      // }
    },
    // logout() {
    //   sessionStorage.removeItem("userName");
    //   this.$router.push({ name: "Login" });
    // },
  },
};
</script>
<style scoped></style>

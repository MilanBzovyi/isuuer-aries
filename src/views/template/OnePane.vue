<template>
  <div>
    <!-- グローバルナビゲーション -->
    <global-nav />

    <!-- メインエリア -->
    <!-- <メモ> :keyつけることで同じパスで違うParamの場合にも描画走る。 -->
    <v-main>
      <router-view :key="$route.fullPath" v-on:userChanged="updateSidebar" />
    </v-main>
  </div>
</template>
<script>
import GlobalNav from "@/components/GlobalNavigation.vue";
export default {
  components: { GlobalNav },
  data() {
    return {
      user: null,
    };
  },
  // methods: {
  //   updateSidebar(user) {
  //     this.user = user;
  //   },
  // },
};
</script>
<style scoped></style>

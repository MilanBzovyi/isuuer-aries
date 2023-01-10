<template>
  <div>
    <!-- グローバルナビゲーション -->
    <global-nav />

    <!-- メインエリア -->
    <!-- <メモ> :keyつけることで同じパスで違うParamの場合にも描画走る。 -->
    <v-main>
      <router-view :key="$route.fullPath" />
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
};
</script>
<style scoped></style>

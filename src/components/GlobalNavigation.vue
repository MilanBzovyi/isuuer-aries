<template>
  <v-app-bar color="primary" app clipped-left elevation="0">
    <h3>
      <span class="white--text" @click="showHome" style="cursor: pointer"
        >健康診断</span
      >
    </h3>
    <v-spacer></v-spacer>

    <global-nav-menu
      icon-name="mdi-account-multiple"
      tool-tip-value="受診者リスト"
      margin-right="2"
      :to="{ name: 'Patients' }"
    />

    <v-spacer></v-spacer>
  </v-app-bar>
</template>
<script>
import GlobalNavMenu from "@/components/GlobalNavMenu.vue";
export default {
  components: { GlobalNavMenu },
  data() {
    return {};
  },
  async created() {},
  methods: {
    showHome() {
      this.$router.push({ name: "Patients" });
    },
  },
};
</script>
<style scoped></style>

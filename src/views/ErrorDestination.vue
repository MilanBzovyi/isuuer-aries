<template>
  <div
    class="d-flex align-center flex-column"
    style="width: 100%; height: 90vh"
  >
    <v-img src="/Error.png" max-width="30rem" transition="fab-transition" />
    <v-btn
      class="mt-10"
      color="primary"
      text
      plain
      @click="
        () => {
          this.$router.back();
        }
      "
      >戻る</v-btn
    >
  </div>
</template>

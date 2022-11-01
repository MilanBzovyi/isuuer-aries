<template>
  <v-row>
    <template v-if="renderReady">TODO SimpleTable入れる</template>
    <template v-else>
      <div class="prog-circ-on-init">
        <v-progress-circular
          size="200"
          width="5"
          color="secondary"
          indeterminate
        ></v-progress-circular>
      </div>
    </template>
  </v-row>
</template>
<script>
import * as patientsApi from "@/modules/api/patients.js";
// import * as authApi from "@/modules/api/auth.js";
export default {
  data() {
    return {
      renderReady: false,
      user: null,
      // userLoggedin: false,
    };
  },
  computed: {},
  async created() {
    // for testing...
    // setTimeout(async () => {
    //   this.user = await userApi.getUser(this.$route.params.userId);
    //   this.$emit("userChanged", this.user);
    //   this.renderReady = true;
    // }, 5000);

    this.user = await patientsApi.getPatients(this.$route.params.userId);
    // this.userLoggedin = authApi.isShownUserMyself(this.user.userId);
    // this.$emit("userChanged", this.user);
    this.renderReady = true;
  },
  methods: {
    back() {
      this.$router.back();
    },
  },
};
</script>
<style scoped>
.title-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.title {
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 1rem;
}
.prog-circ-on-init {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.on-hover {
  opacity: 0.6;
  cursor: pointer;
}
.on-hover-2 {
  cursor: pointer;
}
</style>

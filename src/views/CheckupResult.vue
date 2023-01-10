<template>
  <div>
    <v-row class="ma-2">
      <v-btn icon large color="accent" @click="back">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-row>
    <v-row justify="center" class="ma-5">
      <template v-if="renderReady">
        <v-simple-table class="elevation-2" style="width: 50%">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Item</th>
                <th class="text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, key) in checkupResult" :key="key">
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table></template
      >
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
  </div>
</template>
<script>
import * as patientsApi from "@/modules/api/patients.js";
export default {
  data() {
    return {
      checkupResult: null,
      renderReady: false,
    };
  },
  computed: {},
  async created() {
    // for mockup testing...
    // setTimeout(async () => {
    //   this.user = await userApi.getUser(this.$route.params.userId);
    //   this.$emit("userChanged", this.user);
    //   this.renderReady = true;
    // }, 5000);

    const checkupResultRaw = await patientsApi.getCheckupResult(
      this.$route.params.patientId
    );
    delete checkupResultRaw.connectionId;
    this.checkupResult = patientsApi.changeCheckupResultLabel(checkupResultRaw);

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
.prog-circ-on-init {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

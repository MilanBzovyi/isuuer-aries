<template>
  <div>
    <template v-if="renderReady">
      <div class="d-flex justify-center mt-5">
        <div class="search">
          <v-text-field
            prepend-inner-icon="mdi-magnify"
            color="accent"
            label="受診者名を入力してください"
            v-model="userNameKeyword"
          ></v-text-field>
        </div>
      </div>
      <v-list class="mx-8">
        <template v-for="(user, i) in filteredUsers">
          <v-list-item :key="`list-${i}`">
            <!-- <v-hover v-slot="{ hover }">
              <avator
                :avator="user.avator"
                :profileLinked="true"
                :class="{ 'on-avator-hovered': hover }"
                v-on:avatorClicked="showProfile(user.userId)"
              />
            </v-hover> -->
            <v-list-item-content>
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle
                >受診日:
                {{
                  new Date(user.checkedupDate * 1000).toLocaleDateString()
                }}</v-list-item-subtitle
              >
            </v-list-item-content>

            <v-list-item-action>
              <v-btn
                outlined
                text
                color="secondary"
                @click="showCheckupResult(user.patientId)"
                >診断結果</v-btn
              >
            </v-list-item-action>
            <template v-if="!user.issued">
              <v-list-item-action>
                <v-btn
                  outlined
                  text
                  color="accent"
                  @click="sendQRCodeforIssueVC(user)"
                  >発行する</v-btn
                >
              </v-list-item-action>
            </template>
            <template v-else>
              <v-list-item-action
                ><v-btn
                  outlined
                  text
                  disabled
                  color="accent"
                  @click="sendQRCodeforIssueVC(user)"
                  >発行済み
                </v-btn></v-list-item-action
              ></template
            >
          </v-list-item>
          <v-divider :key="`divider-${i}`"></v-divider>
        </template>
      </v-list>
    </template>
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
    <div
      v-show="filteredUsers && filteredUsers.length > (blockIndex + 1) * 20"
      ref="paging_trigger"
    ></div>
    <v-row justify="center" class="mt-5">
      <v-progress-circular
        :size="80"
        :width="5"
        color="secondary"
        indeterminate
        v-show="pagingTakingPlace"
      ></v-progress-circular
    ></v-row>
  </div>
</template>
<script>
import * as patientsApi from "@/modules/api/patients.js";
// import Avator from "@/components/Avator.vue";
import { debounce } from "lodash";
export default {
  // components: { Avator },
  data() {
    return {
      // Rendering
      users: [],
      filteredUsers: [],
      renderReady: false,
      // Search
      userNameKeyword: "",
      // Pagination
      paginator: null,
      pagingTakingPlace: false,
      blockIndex: 0,
    };
  },
  mounted() {
    // callback登録
    this.paginator = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        this.pagingTakingPlace = true;
        this.blockIndex = this.blockIndex + 1;
        const params = {
          block: this.blockIndex,
        };
        const query = new URLSearchParams(params);
        let additionalUsers = await patientsApi.getPatients(query);
        this.filteredUsers = this.filteredBooks.concat(additionalUsers);
        this.pagingTakingPlace = false;
      }
    });
    this.paginator.observe(this.$refs.paging_trigger);
  },
  async created() {
    this.users = await patientsApi.getPatients();
    this.filteredUsers = this.users;
    this.renderReady = true;
  },
  watch: {
    userNameKeyword: debounce(async function (newKeyword) {
      if (newKeyword === "") {
        this.filteredUsers = this.users;
      } else {
        // バックエンド込み
        // const params = {
        //   userName: newKeyword,
        //   block: 0,
        // };
        // const query = new URLSearchParams(params);
        // this.filteredUsers = await patientsApi.getPatients(query);

        // フロントエンドのみ
        const localUsers = [];
        for (const user of this.users) {
          if (user.name.indexOf(this.userNameKeyword) !== -1) {
            localUsers.push(user);
          }
        }
        this.filteredUsers = localUsers;
      }
    }, 500),
  },
  methods: {
    showCheckupResult(patientId) {
      this.$router.push({
        name: "CheckupResult",
        params: { patientId: patientId },
      });
    },
    sendQRCodeforIssueVC(user) {
      // TODO
      console.log(JSON.stringify(user));
      alert("holderにQRコードを送る!!");
    },
    // showUserBooks(userId) {
    //   this.$router.push({ name: "UserBooks", params: { userId: userId } });
    // },
    // showUserTimeline(userId) {
    //   this.$router.push({ name: "UserTimeline", params: { userId: userId } });
    // },
  },
};
</script>
<style scoped>
.search {
  width: 50%;
}
.prog-circ-on-init {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* TODO hoveredのclass共通化 */
.on-avator-hovered {
  opacity: 0.7;
  cursor: pointer;
}
</style>

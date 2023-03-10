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
            <v-list-item-content>
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle
                >受診日:
                {{
                  new Date(user.checkedupDate).toLocaleDateString()
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
            <v-list-item-action>
              <template v-if="user.issueState === 0">
                <v-dialog
                  v-model="qrSendingDialog[user.patientId]"
                  max-width="30%"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" color="accent" outlined text
                      >証明書発行オファー送信</v-btn
                    >
                  </template>
                  <v-card>
                    <v-card-title class="text-h5 accent white--text">
                      証明書発行オファーメール送信
                    </v-card-title>
                    <v-card-text class="mt-3"
                      >{{
                        user.name
                      }}さんに発行オファーメールを送信しますか？</v-card-text
                    >
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="accent"
                        elevation="2"
                        :loading="qrSendingLoader"
                        @click="sendOfferMailforIssueVC(user)"
                      >
                        する
                      </v-btn>
                      <v-btn
                        color="accent"
                        elevation="2"
                        outlined
                        depressed
                        @click="qrSendingDialog[user.patientId] = false"
                      >
                        しない
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </template>
              <template v-else-if="user.issueState === 1">
                <v-btn outlined text disabled color="accent">受付済み </v-btn>
              </template>
              <template v-else-if="user.issueState === 2">
                <v-btn outlined text disabled color="accent"
                  >オファー済み
                </v-btn>
              </template>
              <template v-else-if="user.issueState === 3">
                <v-btn outlined text disabled color="accent"
                  >発行済み
                </v-btn></template
              >
            </v-list-item-action>
          </v-list-item>
          <v-divider :key="`divider-${i}`"></v-divider>
        </template>
      </v-list>
      <v-snackbar
        :timeout="2000"
        v-model="qrSendingSnackbar"
        centered
        absolute
        color="primary"
        >発行オファー送信を受付ました。
      </v-snackbar>
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
import { debounce } from "lodash";
export default {
  data() {
    return {
      // Rendering
      users: [],
      filteredUsers: [],
      renderReady: false,
      // Search
      userNameKeyword: "",
      // Dialog
      qrSendingDialog: {},
      qrSendingLoader: false,
      qrSendingSnackbar: false,
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
        // フロントエンドのみの絞り込み
        // （TODO このプロトタイプが進展するようであれば、下記のバックエンド込みの処理方式を検討する。）
        const localUsers = [];
        for (const user of this.users) {
          if (user.name.indexOf(this.userNameKeyword) !== -1) {
            localUsers.push(user);
          }
        }
        this.filteredUsers = localUsers;
      }

      // バックエンド込み
      // const params = {
      //   userName: newKeyword,
      //   block: 0,
      // };
      // const query = new URLSearchParams(params);
      // this.filteredUsers = await patientsApi.getPatients(query);
    }, 500),
  },
  methods: {
    showCheckupResult(patientId) {
      this.$router.push({
        name: "CheckupResult",
        params: { patientId: patientId },
      });
    },
    async sendOfferMailforIssueVC(patient) {
      // for mockup testing...
      // this.qrSendingLoader = true;
      // setTimeout(async () => {
      //   this.qrSendingLoader = false;
      //   this.qrSendingDialog = false;
      //   this.qrSendingSnackbar = true;
      // }, 3000);

      // for (let user of this.users) {
      //   if (user.patientId === patient.patientId) {
      //     user.issueState = 1;
      //     break;
      //   }
      // }

      try {
        this.qrSendingLoader = true;
        await patientsApi.offerVCIssueing(patient);
        this.qrSendingLoader = false;
        this.qrSendingDialog[patient.patientId] = false;
        this.qrSendingSnackbar = true;
        this.users = await patientsApi.getPatients();
        this.filteredUsers = this.users;
      } catch (error) {
        this.qrSendingLoader = false;
        this.qrSendingDialog[patient.patientId] = false;
        console.error(JSON.stringify(error));
        alert("予期しないエラーが発生しました。");
      }
    },
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
</style>

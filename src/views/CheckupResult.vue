<template>
  <v-row>
    <template v-if="renderReady">
      <v-card width="100%" flat>
        <v-hover v-slot="{ hover }">
          <v-img
            height="20rem"
            :src="user.backgroundImgPath"
            :class="['title-wrapper', { 'on-hover-2': hover && userLoggedin }]"
            gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.5)"
            @click="changeBackgroundImg"
          >
            <v-card-title class="white--text title">
              <v-avatar
                size="100"
                :color="user.avator.color ? user.avator.color : 'secondary'"
              >
                <v-hover v-slot="{ hover }">
                  <v-icon
                    v-if="hover && userLoggedin"
                    x-large
                    @click.stop="changeAvatar"
                    >mdi-camera</v-icon
                  >
                  <img v-else-if="user.avator.src" :src="user.avator.src" />
                  <span v-else>{{ user.avator.alt }}</span>
                </v-hover>
              </v-avatar>
              <h3>{{ user.name }}</h3>
            </v-card-title>
          </v-img>
        </v-hover>
        <v-btn icon absolute top left large color="white" @click="back">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <!-- TODO 以下、全体的にComponent化 -->
        <v-list two-line class="mx-10 my-2">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>名前</v-list-item-subtitle>
              <div v-show="nameEditMode" class="mt-3">
                <v-text-field loading="false" filled v-model="user.name" />
                <v-btn
                  color="grey darken-1"
                  outlined
                  elevation="2"
                  :loading="nameUpdating"
                  @click="updateName"
                >
                  <v-icon> mdi-check </v-icon>
                </v-btn>
                <v-btn
                  outlined
                  elevation="2"
                  color="grey darken-1"
                  class="ml-4"
                  @click="revertName"
                >
                  <v-icon> mdi-close </v-icon>
                </v-btn>
              </div>
              <v-hover v-slot="{ hover }">
                <div
                  :class="['mt-3', { 'on-hover': hover && userLoggedin }]"
                  v-show="!nameEditMode"
                  @click="editName"
                >
                  <span v-if="user.name" v-text="user.name" />
                  <span v-if="!user.name && userLoggedin" style="opacity: 0.3"
                    >記入する</span
                  >
                </div>
              </v-hover>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>会社</v-list-item-subtitle>
              <div v-show="companyEditMode" class="mt-3">
                <v-text-field loading="false" filled v-model="user.company" />
                <v-btn
                  color="grey darken-1"
                  outlined
                  elevation="2"
                  :loading="companyUpdating"
                  @click="updateCompany"
                >
                  <v-icon> mdi-check </v-icon>
                </v-btn>
                <v-btn
                  outlined
                  elevation="2"
                  color="grey darken-1"
                  class="ml-4"
                  @click="revertCompany"
                >
                  <v-icon> mdi-close </v-icon>
                </v-btn>
              </div>
              <v-hover v-slot="{ hover }">
                <div
                  :class="['mt-3', { 'on-hover': hover && userLoggedin }]"
                  v-show="!companyEditMode"
                  @click="editCompany"
                >
                  <span v-if="user.company" v-text="user.company" />
                  <span
                    v-if="!user.company && userLoggedin"
                    style="opacity: 0.3"
                    >記入する</span
                  >
                </div>
              </v-hover>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>所属</v-list-item-subtitle>
              <!-- TODO div to /div , Component化 -->
              <div v-show="depEditMode" class="mt-3">
                <v-text-field
                  loading="false"
                  filled
                  v-model="user.department"
                />
                <v-btn
                  color="grey darken-1"
                  outlined
                  elevation="2"
                  :loading="depUpdating"
                  @click="updateDepartment"
                >
                  <v-icon> mdi-check </v-icon>
                </v-btn>
                <v-btn
                  outlined
                  elevation="2"
                  color="grey darken-1"
                  class="ml-4"
                  @click="revertDepartment"
                >
                  <v-icon> mdi-close </v-icon>
                </v-btn>
              </div>
              <v-hover v-slot="{ hover }">
                <div
                  :class="['mt-3', { 'on-hover': hover && userLoggedin }]"
                  v-show="!depEditMode"
                  @click="editDepartment"
                >
                  <span v-if="user.department" v-text="user.department" />
                  <span
                    v-if="!user.department && userLoggedin"
                    style="opacity: 0.3"
                    >記入する</span
                  >
                </div>
              </v-hover>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>職種</v-list-item-subtitle>
              <div v-show="occupEditMode" class="mt-3">
                <v-text-field
                  loading="false"
                  filled
                  v-model="user.occupation"
                />
                <v-btn
                  color="grey darken-1"
                  outlined
                  elevation="2"
                  :loading="occupUpdating"
                  @click="updateOccupation"
                >
                  <v-icon> mdi-check </v-icon>
                </v-btn>
                <v-btn
                  outlined
                  elevation="2"
                  color="grey darken-1"
                  class="ml-4"
                  @click="revertOccupation"
                >
                  <v-icon> mdi-close </v-icon>
                </v-btn>
              </div>
              <v-hover v-slot="{ hover }">
                <div
                  :class="['mt-3', { 'on-hover': hover && userLoggedin }]"
                  v-show="!occupEditMode"
                  @click="editOccupation"
                >
                  <span v-if="user.occupation" v-text="user.occupation" />
                  <span
                    v-if="!user.occupation && userLoggedin"
                    style="opacity: 0.3"
                    >記入する</span
                  >
                </div>
              </v-hover>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>Slack</v-list-item-subtitle>
              <div v-show="slackEditMode" class="mt-3">
                <v-text-field
                  loading="false"
                  filled
                  v-model="user.mailAddress"
                />
                <v-btn
                  color="grey darken-1"
                  outlined
                  elevation="2"
                  :loading="slackUpdating"
                  @click="updateSlack"
                >
                  <v-icon> mdi-check </v-icon>
                </v-btn>
                <v-btn
                  outlined
                  elevation="2"
                  color="grey darken-1"
                  class="ml-4"
                  @click="revertSlack"
                >
                  <v-icon> mdi-close </v-icon>
                </v-btn>
              </div>
              <v-hover v-slot="{ hover }">
                <div
                  :class="['mt-3', { 'on-hover': hover && userLoggedin }]"
                  v-show="!slackEditMode"
                  @click="editSlack"
                >
                  <span v-if="user.mailAddress" v-text="user.mailAddress" />
                  <span
                    v-if="!user.mailAddress && userLoggedin"
                    style="opacity: 0.3"
                    >記入する</span
                  >
                </div>
              </v-hover>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>自己紹介</v-list-item-subtitle>
              <div v-show="introEditMode" class="mt-3">
                <v-textarea
                  loading="false"
                  filled
                  v-model="user.introduction"
                />
                <v-btn
                  color="grey darken-1"
                  outlined
                  elevation="2"
                  :loading="introUpdating"
                  @click="updateIntroduce"
                >
                  <v-icon> mdi-check </v-icon>
                </v-btn>
                <v-btn
                  outlined
                  elevation="2"
                  color="grey darken-1"
                  class="ml-4"
                  @click="revertIntroduce"
                >
                  <v-icon> mdi-close </v-icon>
                </v-btn>
              </div>
              <v-hover v-slot="{ hover }">
                <div
                  :class="['mt-3', { 'on-hover': hover && userLoggedin }]"
                  v-show="!introEditMode"
                  @click="editIntroduce"
                >
                  <span v-if="user.introduction" v-text="user.introduction" />
                  <span
                    v-if="!user.introduction && userLoggedin"
                    style="opacity: 0.3"
                    >記入する</span
                  >
                </div>
              </v-hover>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <!-- いいね機能は止める -->
        <!-- <v-tabs grow>
          <v-tab>プロフィール</v-tab>
          <v-tab @click="showFavComments()">いいね</v-tab>

          <v-tab-item>
            <v-list two-line class="mx-10 my-2">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>名前</v-list-item-subtitle>
                  <span class="mt-3">{{ user.name }}</span>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>所属</v-list-item-subtitle>
                  <span class="mt-3">{{ user.department }}</span>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>役職</v-list-item-subtitle>
                  <span class="mt-3">{{ user.managerialPosition }}</span>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>職種</v-list-item-subtitle>
                  <span class="mt-3">{{ user.occupation }}</span>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>メールアドレス</v-list-item-subtitle>
                  <span class="mt-3">{{ user.mailAddress }}</span>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>自己紹介</v-list-item-subtitle>
                  <span class="mt-3">{{ user.introduction }}</span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-tab-item>
          <v-tab-item class="text-center mt-10"> </v-tab-item>
        </v-tabs> -->
      </v-card>
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
  </v-row>
</template>
<script>
import * as userApi from "@/modules/api/user.js";
import * as authApi from "@/modules/api/auth.js";
export default {
  data() {
    return {
      renderReady: false,
      user: null,
      userLoggedin: false,

      // name
      currentName: null,
      nameEditMode: false,
      nameUpdating: false,

      // company
      currentCompany: null,
      companyEditMode: false,
      companyUpdating: false,

      // department
      currentDep: null,
      depEditMode: false,
      depUpdating: false,

      // occupation
      currentOccup: null,
      occupEditMode: false,
      occupUpdating: false,

      // slack
      currentSlack: null,
      slackEditMode: false,
      slackUpdating: false,

      // introduce
      currentIntro: null,
      introEditMode: false,
      introUpdating: false,
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

    this.user = await userApi.getUser(this.$route.params.userId);
    this.userLoggedin = authApi.isShownUserMyself(this.user.userId);
    this.$emit("userChanged", this.user);
    this.renderReady = true;
  },
  methods: {
    back() {
      this.$router.back();
    },
    // background-image

    // avator
    changeAvatar() {
      alert("wip");
    },
    changeBackgroundImg() {
      alert("WIP");
    },
    // name
    editName() {
      if (this.userLoggedin) {
        this.currentName = this.user.name;
        this.nameEditMode = true;
      }
    },
    revertName() {
      this.user.name = this.currentName;
      this.nameEditMode = false;
    },
    async updateName() {
      this.nameUpdating = true;
      await userApi.updateUserProfile(this.user);
      this.nameUpdating = false;
      this.nameEditMode = false;
    },

    // company
    editCompany() {
      if (this.userLoggedin) {
        this.currentCompany = this.user.company;
        this.companyEditMode = true;
      }
    },
    revertCompany() {
      this.user.company = this.currentCompany;
      this.companyEditMode = false;
    },
    async updateCompany() {
      this.companyUpdating = true;
      await userApi.updateUserProfile(this.user);
      this.companyUpdating = false;
      this.companyEditMode = false;
    },

    // department
    editDepartment() {
      if (this.userLoggedin) {
        this.currentDep = this.user.department;
        this.depEditMode = true;
      }
    },
    revertDepartment() {
      this.user.department = this.currentDep;
      this.depEditMode = false;
    },
    async updateDepartment() {
      this.depUpdating = true;
      await userApi.updateUserProfile(this.user);
      this.depUpdating = false;
      this.depEditMode = false;
    },

    // occupation
    editOccupation() {
      if (this.userLoggedin) {
        this.currentOccup = this.user.occupation;
        this.occupEditMode = true;
      }
    },
    revertOccupation() {
      this.user.occupation = this.currentOccup;
      this.occupEditMode = false;
    },
    async updateOccupation() {
      this.occupUpdating = true;
      await userApi.updateUserProfile(this.user);
      this.occupUpdating = false;
      this.occupEditMode = false;
    },

    // slack
    editSlack() {
      if (this.userLoggedin) {
        this.currentSlack = this.user.slack;
        this.slackEditMode = true;
      }
    },
    revertSlack() {
      this.user.slack = this.currentSlack;
      this.slackEditMode = false;
    },
    async updateSlack() {
      this.slackUpdating = true;
      await userApi.updateUserProfile(this.user);
      this.slackUpdating = false;
      this.slackEditMode = false;
    },

    // introduce
    editIntroduce() {
      if (this.userLoggedin) {
        this.currentIntro = this.user.introduction;
        this.introEditMode = true;
      }
    },
    revertIntroduce() {
      this.user.introduction = this.currentIntro;
      this.introEditMode = false;
    },
    async updateIntroduce() {
      this.introUpdating = true;
      await userApi.updateUserProfile(this.user);
      this.introUpdating = false;
      this.introEditMode = false;
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

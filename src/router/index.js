import Vue from "vue";
import VueRouter from "vue-router";
import OnePane from "@/views/template/OnePane.vue";
import Patients from "@/views/Patients.vue";
import CheckupResult from "@views/CheckupResult.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "OnePane",
    component: OnePane,
    children: [
      {
        path: "/patients",
        name: "Patients",
        component: Patients,
      },
      {
        path: "/patients/:patientId/",
        name: "CheckupResult",
        component: CheckupResult,
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;

import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home.vue"),
    },
    {
      path: "/sweep",
      name: "sweep",
      component: () => import("@/views/Sweep/Sweep.vue"),
    },
    {
      path: "/tetris",
      name: "tetris",
      component: () => import("@/views/Tetris/Tetris.vue"),
    },
  ],
});

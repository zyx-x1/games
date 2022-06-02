import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isSweepGameStartPanelShow:false,
    isSweepGameQuitPanelShow: false,
    SweepGameLevel: 1,
  },
  mutations: {},
  actions: {},
});

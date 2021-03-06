import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/sweep'
    },
    {
      path: '/sweep',
      name: 'sweep',
      component: () => import('@/views/Sweep/Sweep.vue')
    }
  ],
});

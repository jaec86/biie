import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { order: 1 },
    component: () => import('@/views/Home'),
  },
  {
    path: '/training',
    name: 'Training',
    meta: { order: 2 },
    component: () => import('@/views/Training'),
  },
  {
    path: '/story',
    name: 'Story',
    meta: { order: 3 },
    component: () => import('@/views/Story'),
  },
  {
    path: '/details',
    name: 'Details',
    meta: { order: 4 },
    component: () => import('@/views/Details'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;

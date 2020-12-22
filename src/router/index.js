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
    path: '/mode',
    name: 'Mode',
    meta: { order: 2 },
    component: () => import('@/views/Mode'),
  },
  {
    path: '/details',
    name: 'Details',
    meta: { order: 3 },
    component: () => import('@/views/Details'),
  },
  {
    path: '/story',
    name: 'Story',
    meta: { order: 4 },
    component: () => import('@/views/Story'),
  },
  {
    path: '/training',
    name: 'Training',
    meta: { order: 5 },
    component: () => import('@/views/Training'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;

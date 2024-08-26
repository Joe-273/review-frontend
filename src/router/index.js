import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home', // 当访问 '/' 时，重定向到 '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('../views/Setting.vue'),
      meta: { auth: true }
    },
    {
      path: '/home',
      name: 'home',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Home.vue'),
      meta: { auth: true }
    }
  ]
})

export default router

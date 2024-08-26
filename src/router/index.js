import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home' // 重定向到 /home
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('../views/Setting.vue'),
      meta: { auth: true, title: '配置' }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { auth: true, title: '审核界面' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const firstTitle = '文档审核' // 默认网站标题
  document.title = firstTitle + ' - ' + to.meta.title || defaultTitle
  next()
})

export default router

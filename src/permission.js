import router from './router'
import { useUserStore } from '@/stores/user'

router.beforeEach((to, from, next) => {
  const user = useUserStore()
  const loginStatus = sessionStorage.getItem('loginStatus')
  const islogin = user.loginStatus || !!loginStatus

  if (to.meta.auth) {
    // 需要鉴权
    if (islogin) {
      // 如果已经登录，放行
      next()
    } else {
      // 如果没有登陆,重定向到登录
      next(`/login?redirect=${to.path}`)
    }
  } else {
    // 不需要鉴权
    if (to.path == '/login' && islogin) {
      // 如果已经登录，直接到首页
      next({ path: '/' })
    }
    next()
  }
})

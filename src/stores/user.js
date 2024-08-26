import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useUserStore = defineStore('user', () => {
  const loginStatus = ref(false) // 用于确定登录状态
  // 用户假数据
  const loginId = ref('admin')
  const loginPwd = ref('123123')

  function login(payload) {
    if (payload.loginId === loginId.value && payload.loginPwd === loginPwd.value) {
      loginStatus.value = true
      sessionStorage.setItem("loginStatus", true)
    }
  }

  return { loginStatus, login }
})

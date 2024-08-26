<template>
  <div class="login-container">
    <el-form
      ref="ruleFormRef"
      :model="form"
      label-width="auto"
      style="max-width: 600px"
      status-icon
      class="user-form"
      :rules="rules"
      @submit.prevent="submitForm(ruleFormRef)"
    >
      <h2>Login</h2>
      <el-form-item prop="loginId">
        <el-input
          @keydown.enter="submitForm(ruleFormRef)"
          :prefix-icon="User"
          placeholder="请输入管理员账号"
          v-model.trim="form.loginId"
        ></el-input>
      </el-form-item>
      <el-form-item prop="loginPwd">
        <el-input
          @keydown.enter="submitForm(ruleFormRef)"
          :prefix-icon="Lock"
          show-password
          type="password"
          placeholder="请输入密码"
          v-model.trim="form.loginPwd"
        ></el-input>
      </el-form-item>
      <el-button type="primary" @click="submitForm(ruleFormRef)"> 登录 </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const form = ref({
  loginId: '',
  loginPwd: ''
})

const ruleFormRef = ref(null)
// 表单验证
const rules = reactive({
  loginId: [
    { required: true, message: '账号不能为空', trigger: 'blur' },
    { min: 4, max: 12, message: '账号长度需要4-12位数', trigger: 'blur' }
  ],
  loginPwd: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度需要6-16位数', trigger: 'blur' }
  ]
})
// 提交表单
const submitForm = (el) => {
  if (!el) {
    return
  }
  el.validate((valid) => {
    if (valid) {
      // TODO 请求登录接口
      user.login(form.value)
      const redirectPath = route.query.redirect || '/setting'
      router.push(redirectPath)

      if (user.loginStatus) {
        ElMessage({
          message: '登录成功！',
          type: 'success'
        })
      } else {
        // 失败
        ElMessage({
          message: '账号或密码错误！',
          type: 'error'
        })
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  padding: 20px;
  color: #333;
}
.user-form {
  width: 300px;
  padding: 25px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  text-align: center;
}

.user-form > * {
  flex: 1;
}
</style>

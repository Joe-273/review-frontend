// import './assets/main.css'
import '@/mock' //使用mock

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 全局样式
import '@/styles/global.css'

// 鉴权
import '@/permission'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

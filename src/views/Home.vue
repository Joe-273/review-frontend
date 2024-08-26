<template>
  <div class="home-container">
    <!-- nav 顶部 -->
    <div class="nav">
      <h3 style="margin: 0 5px">审核界面</h3>
      <el-steps class="steps" simple :active="currentStep" finish-status="success">
        <el-step title="扫描文档" />
        <el-step title="开始审核" />
        <el-step title="查看结果" />
        <el-step title="任务完成" />
      </el-steps>
      <el-button @click="dialogFormVisible = true">
        <el-icon><Setting /></el-icon>
      </el-button>
    </div>
    <!-- layout 主要界面 -->
    <div class="layout">
      <div class="left-list">
        <!-- 展示区域 -->
        <el-table
          :data="folderList"
          v-loading="folderLoading"
          empty-text="无扫描文件"
          row-key="name"
          @row-click="handleRowClick"
        >
          <el-table-column prop="fileName" label="扫描文件" sortable>
            <template #default="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
        </el-table>
        <div class="button-area">
          <el-button class="button" plain size="large" @click="handleRestart" type="warning">
            资料错误 ? 重新扫描
          </el-button>
          <el-button
            class="button"
            ref="startButtonRef"
            plain
            size="large"
            @click="handleReview"
            type="primary"
          >
            开始审核
          </el-button>
          <el-button class="button" plain size="large" @click="handleReviewEnding" type="success">
            审核结束 & 打印结果
          </el-button>
        </div>
        <el-popover
          :virtual-ref="startButtonRef"
          :visible="showPopover"
          trigger="click"
          title="操作提示"
          :width="200"
          placement="right"
          virtual-triggering
        >
          <span>确认扫描文件无误后，点击这里进行审核</span>
          <div style="text-align: right; margin: 0">
            <el-button size="small" plain type="primary" @click="showPopover = false"
              >确认</el-button
            >
          </div>
        </el-popover>
      </div>
      <div class="main-container" :class="{ 'main-detailView': detailView }">
        <el-image :src="currentPicture" fit="contain" style="width: 100%; height: 100%" />
      </div>
      <div class="right-list" :class="{ 'right-detailView': detailView }">
        <el-table :data="currentResult" empty-text="无校验结果">
          <el-table-column label="检验项目" width="140" prop="name"></el-table-column>
          <el-table-column v-if="detailView" label="问题">
            <template #default="scope">
              <span v-if="!scope.row.result.right">
                {{ scope.row.result.checkItem }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="检验结果" width="140" prop="result.right" sortable>
            <template #default="scope">
              <el-tag :type="scope.row.result.right ? 'success' : 'danger'">
                {{ scope.row.result.right ? 'TRUE / 合格' : 'FALSE / 不合格' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="right-button">
          <el-tooltip
            class="box-item"
            effect="dark"
            :disabled="detailView"
            content="点击展开详细试图"
            placement="top"
          >
            <el-button type="primary" size="large" @click="handletoggleDetailView" plain>
              {{ toggleViewsButtonMessage }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <!-- dialog 弹窗 -->
    <el-dialog v-model="dialogFormVisible" title="管理员验证：" width="500">
      <el-form>
        <el-form-item label="请输入密码：" :label-width="formLabelWidth">
          <el-input v-model="loginPwd" type="password" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="goToSetting"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useFolderStore } from '@/stores/folder'
import { useUserStore } from '@/stores/user'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { Setting } from '@element-plus/icons-vue'

import { createFolder } from '@/utils/writeContent'
import { moveFolderContents } from '@/utils/moveFolderContents'
import { getCurrentDateTimeString } from '@/utils/getCurrentTime'
import { postOcr } from '@/api/ocr'
import { verify } from '@/api/verify'

import nameMap from '@/nameMap'
import getFolderContent from '@/utils/getFolderContent'
const router = useRouter()
const folderStore = useFolderStore()
const user = useUserStore()

const taskEndingFlag = ref(false) // 任务结束标记

/* nav / 顶部 */
const loginPwd = ref(null)
const dialogFormVisible = ref(false)
const currentStep = ref(0)

function goToSetting() {
  // TODO 这里应该是请求登录API验证
  if (user.login({ loginId: 'admin', loginPwd: loginPwd.value })) {
    // 密码正确
    router.push('/setting')
  } else {
    ElMessage({
      message: '密码错误，验证失败！',
      type: 'error'
    })
  }
}

/* 左边 */
const reviewResult = ref(null) // 审核结果
const currentPicture = ref(null) // 显示的图片
const showPopover = ref(true) //显示提示
const folderLoading = ref(false) // 加载效果
// 扫描文件列表数组
const folderList = computed(() => folderStore.folderContent)
// 切换图片显示
function handleRowClick(row) {
  currentPicture.value = URL.createObjectURL(row.file)
  if (currentStep.value >= 3) {
    // 审核结束
    const [data] = reviewResult.value.filter((i) => i.name === row.name)
    // currentResult.value = data.data.reduce((r, i) => r.push(i), [])
    currentResult.value = []
    const type = data.type
    for (const key in data.data) {
      currentResult.value.push({ name: nameMap[type][key], result: data.data[key] })
    }
  }
}
// 重新扫描
async function handleRestart() {
  // 删除所有文件
  await moveFolderContents(folderStore.folderHandle)
  // 到第一步
  ElMessage({
    message: '任务重置成功，请重新扫描文件！',
    type: 'success'
  })
}

// 开始审核
const startButtonRef = ref()
let isReviewing = false
async function handleReview() {
  if (folderList.value !== null && folderList.value.length === 0) {
    ElMessage({
      message: '请先扫描文件！',
      type: 'warning'
    })
    return
  }
  if (isReviewing === true) {
    ElMessage({
      message: '审核中，请勿重复操作！',
      type: 'warning'
    })
    return
  }
  isReviewing = true
  try {
    const reviewResponse = await postMultipleRequests(folderList.value)
    console.log('/reviewXXX 接口响应：', reviewResponse)
    reviewResult.value = reviewResponse
    taskEndingFlag.value = true
    currentStep.value = 2
    // 判断审核是否通过
    for (const i of reviewResponse) {
      for (const key in i.data) {
        if (i.data[key]['right'] === false) {
          ElMessage({
            message: '校验不合格：请点击 左侧<扫描文件> 的文件查看不合格项目！',
            type: 'error',
            showClose: true,
            duration: 10000
          })
          return
        }
      }
      ElMessage({
        message: '校验合格！',
        showClose: true,
        type: 'success',
        duration: 10000
      })
    }
    // 审核结束
    isReviewing = false
  } catch (error) {
    ElMessage({
      message: '审核失败！',
      type: 'error'
    })
    console.error(error)
  }
}

// 请求审核接口:
async function postMultipleRequests(pictureList) {
  try {
    const ocrResponse = await Promise.all(
      pictureList.map(async (i) => {
        const resp = await postOcr(i.file)
        return { name: i.name, data: JSON.parse(resp.data) }
      })
    )
    console.log('/ocr 接口响应：', ocrResponse)
    return await Promise.all(
      ocrResponse.map(async (i) => {
        const resp = await verify(i.data.type, i.data.data)
        return { name: i.name, type: i.data.type, data: JSON.parse(resp.data) }
      })
    )
  } catch (error) {
    ElMessage({
      message: '请求错误！',
      type: 'error'
    })
    return Promise.reject(error)
  }
}
// 审核结束
async function handleReviewEnding() {
  if (!taskEndingFlag.value) {
    ElMessageBox.alert('请先开始审核！', '错误：', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }
  const currentTimesName = getCurrentDateTimeString()
  // 创建文件夹，将本次扫描文件放入文件夹中
  const handle = await createFolder(folderStore.backupFolderHandle, currentTimesName)
  // TODO 创建日志
  // 移动本次审核文件到备份文件夹
  await moveFolderContents(folderStore.folderHandle, handle)
  // 任务重置
  taskEndingFlag.value = false
  currentResult.value = []
  ElMessage({
    message: '审核结束!',
    type: 'success'
  })
}

/* 中间 */

/* 右边 */
const currentResult = ref(null)
const detailView = ref(false)
const toggleViewsButtonMessage = ref('详细视图')
function handletoggleDetailView() {
  if (detailView.value === true) {
    detailView.value = false
    toggleViewsButtonMessage.value = '详细视图'
  } else {
    detailView.value = true
    toggleViewsButtonMessage.value = '粗略视图'
  }
}

// 侦听器
watchEffect(() => {
  if (folderList.value === null) {
    return
  }
  if (folderList.value.length === 0) {
    currentStep.value = 0
    showPopover.value = true
  } else if (folderList.value.length > 0 && !taskEndingFlag.value) {
    // 已扫描文件但未开始审核
    currentStep.value = 1
  } else if (taskEndingFlag.value) {
    // 审核结束
    currentStep.value = 3
  }
})
// 初始化
onMounted(async () => {
  try {
    folderLoading.value = true
    await getFolderContent('folder', 'checkFolderTimerId', true)
    folderLoading.value = false
    await getFolderContent('backupFolder', 'checkBackupFolderTimerId', true)
  } catch (error) {
    console.error(error)
  } finally {
    folderLoading.value = false
  }

  if (!folderStore.checkFolderTimerId && !folderStore.checkBackupFolderTimerId) {
    router.push('/setting')
  }
})
</script>

<style scoped>
.home-container {
  padding: 0 15px;
  color: #333;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
}
.nav .steps {
  flex: 1;
  max-width: 600px;
  background-color: transparent;
  padding: 0;
}
.layout {
  box-sizing: border-box;
  padding: 0 0 15px 0;
  height: calc(100% - 62px);
  display: flex;
}
.layout > * {
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
}
.left-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.button-area {
  display: flex;
  flex-direction: column;
}
.button-area > *:nth-child(n) {
  margin: 0 15px 15px 15px;
}

.main-container {
  flex: 3;
  margin: 0 5px;
  padding: 5px;
}
.right-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.right-button {
  display: flex;
  flex-direction: column;
  margin: 15px;
}
.main-detailView {
  flex: 0;
  width: 0;
}
.right-detailView {
  flex: 5;
}
</style>

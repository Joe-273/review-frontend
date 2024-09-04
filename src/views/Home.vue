<template>
  <div class="home-container">
    <!-- nav 顶部 -->
    <!-- nav 顶部 -->
    <!-- nav 顶部 -->
    <div class="nav">
      <h3 style="margin: 0 5px">审核界面</h3>
      <el-steps class="steps" simple :active="currentStep" finish-status="success">
        <el-step title="扫描文档" />
        <el-step title="开始审核" />
        <el-step title="查看结果" />
        <el-step title="任务完成" />
      </el-steps>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="管理员操作：打开配置面板"
        placement="bottom"
      >
        <el-button @click="dialogFormVisible = true">
          <el-icon><Setting /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <!-- layout 主要界面 -->
    <!-- layout 主要界面 -->
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
      <div
        v-loading="isReviewing"
        class="main-container"
        :class="{ 'main-detailView': detailView }"
      >
        <div v-show="!isReviewing && currentStep >= 2">
          <div v-show="!isPass">
            <el-alert
              title="校验不合格"
              :closable="false"
              type="error"
              description="请点击 左侧 <扫描文件> 的文件查看不合格项目，也可以点击左下角 [审核结束 & 打印结果] 打印结果。"
              show-icon
            />
          </div>
          <div v-show="isPass">
            <el-alert title="校验合格" :closable="false" type="success" show-icon />
          </div>
        </div>
        <el-image :src="currentPicture" fit="contain" style="width: 100%; height: 100%" />
      </div>
      <div class="right-list" :class="{ 'right-detailView': detailView }">
        <el-table :data="currentResult" fit empty-text="无校验结果">
          <el-table-column label="检验项目" min-width="170" prop="name"></el-table-column>
          <el-table-column v-if="detailView" min-width="300" label="识别结果">
            <template #default="scope">
              <span>
                {{ scope.row.ocr }}
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="detailView" min-width="300" label="问题">
            <template #default="scope">
              <span v-if="!scope.row.result.right">
                {{ scope.row.result.checkItem }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="检验结果"
            align="right"
            min-width="140"
            prop="result.right"
            sortable
          >
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
    <!-- dialog 弹窗 -->
    <!-- dialog 弹窗 -->
    <el-dialog v-model="dialogFormVisible" title="管理员验证：" width="500">
      <el-form @submit.prevent="goToSetting">
        <el-form-item label="请输入密码：" :label-width="formLabelWidth">
          <el-input v-model="loginPwd" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.prevent="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click.prevent="goToSetting">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { Setting } from '@element-plus/icons-vue'
// Store
import { useFolderStore } from '@/stores/folder'
import { useUserStore } from '@/stores/user'
// Utils
import { createFolder, writeFile } from '@/utils/writeContent'
import { moveFolderContents } from '@/utils/moveFolderContents'
import { getCurrentDateTimeString } from '@/utils/getCurrentTime'
import getFolderContent from '@/utils/getFolderContent'
import Logger from '@/utils/recordLog'
// API
import { postOcr } from '@/api/ocr'
import { verify } from '@/api/verify'
// Config
import nameMap from '@/nameMap'
import { postUpload } from '@/api/upload'
import { ElMessage } from 'element-plus'
// 路由实例
const router = useRouter() // 路由实例
const folderStore = useFolderStore() // 文件夹仓库实例
const user = useUserStore() // 用户仓库实例
const logger = new Logger() // 日志实例

// Flags
const taskEndingFlag = ref(false) // 标记任务是否结束
const isReviewing = ref(false) // 标记审核是否进行中
const isPass = ref(true) //标记审核是否通过

/* Nav */
/* Nav */
/* Nav */
const loginPwd = ref(null)
const dialogFormVisible = ref(false)
const currentStep = ref(0)

// 导航设置
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

/* Left */
/* Left */
/* Left */
const reviewResult = ref(null) // 审核结果
const currentPicture = ref(null) // 显示的图片
const showPopover = ref(true) // 显示提示
const folderLoading = ref(false) // 加载效果
const startButtonRef = ref() // 开始审核按钮的 DOM
const folderList = computed(() => {
  if (folderStore.folderContent) {
    return folderStore.folderContent.map((i) => {
      i.url = URL.createObjectURL(i.file)
      return i
    })
  } else {
    return null
  }
}) // 扫描文件列表数组

// 点击效果，切换图片显示
function handleRowClick(row) {
  currentPicture.value = row.url
  if (currentStep.value >= 3 || reviewResult.value !== null) {
    // 审核结束的点击效果
    const [data] = reviewResult.value.filter((i) => i.name === row.name)
    currentResult.value = []
    const type = data.type
    for (const key in data.verifyResult) {
      currentResult.value.push({
        name: nameMap[type][key],
        result: data.verifyResult[key],
        ocr: data.ocrResult[key]
      })
    }
  }
}

// 重新扫描
async function handleRestart() {
  // 删除所有文件
  logger.info('开始重新扫描操作...')
  await moveFolderContents(folderStore.folderHandle)
  logger.info('删除所有文件，重新扫描')
  // 重置操作
  currentResult.value = null
  currentPicture.value = null
  // 到第一步
  ElMessage({
    message: '任务重置成功，请重新扫描文件！',
    type: 'success'
  })
  logger.info('重新扫描操作完成')
}

// 开始审核
async function handleReview() {
  if (currentStep.value >= 3) {
    // 审核已经结束
    ElMessage({
      message: '审核已经结束，请点击审核结束重启任务！',
      type: 'warning'
    })
    return
  }
  if (folderList.value.length === 0) {
    logger.warn('文件列表为空，请先扫描文件！')
    ElMessage({
      message: '请先扫描文件！',
      type: 'warning'
    })
    return
  }
  if (isReviewing.value) {
    logger.warn('审核中，请勿重复操作！')
    ElMessage({
      message: '审核中，请勿重复操作！',
      type: 'warning'
    })
    return
  }
  isReviewing.value = true
  logger.info('开始审核...')
  try {
    // 变为粗略视图
    detailView.value = false
    toggleViewsButtonMessage.value = '详细视图'

    const reviewResponse = await postMultipleRequests(folderList.value)
    reviewResult.value = reviewResponse
    // 判断审核是否通过
    for (const i of reviewResult.value) {
      for (const key in i.verifyResult) {
        if (i.verifyResult[key]['right'] === false) {
          isPass.value = false
          break
        }
      }
      if (!isPass.value) {
        // 不通过
        break
      }
      // 通过
      logger.info(`校验合格：${JSON.stringify({ name: i.name, type: i.type }, null, 4)}`)
    }

    // 展示第一张图片的结果
   currentPicture.value = folderList.value[0].url
    currentResult.value = []
    const type = reviewResult.value[0].type
    for (const key in reviewResult.value[0].verifyResult) {
      currentResult.value.push({
        name: nameMap[type][key],
        result: reviewResult.value[0].verifyResult[key],
        ocr: reviewResult.value[0].ocrResult[key]
      })
    }

    logger.info('审核结束')
    taskEndingFlag.value = true // 任务结束
    currentStep.value = 2 // 当前进度
  } catch (error) {
    logger.error(`审核失败：${error.message}\n\n\n`)
    console.error(error)
    // 创建日志日志文件并保存到备份文件夹中
    writeFile(folderStore.backupFolderHandle, 'Error-log.txt', logger.getLogs())
    ElMessage({
      message: '审核失败！',
      type: 'error'
    })
  } finally {
    isReviewing.value = false // 审核结束
  }
}

// 请求审核接口
async function postMultipleRequests(pictureList) {
  try {
    // 请求upload接口，上传图片
    const uploadResponse = await Promise.all(
      pictureList.map(async (i) => {
        const resp = await postUpload(i.file)
        return { name: i.name, url: resp }
      })
    )
    // 请求 OCR 接口
    logger.info('开始请求 OCR 接口...')
    const ocrResponse = await Promise.all(
      uploadResponse.map(async (i) => {
        const resp = await postOcr({ url: i.url })
        if (resp.type !== undefined) {
          return {
            name: i.name,
            data: {
              data: processOcrData(JSON.parse(resp.data).data.data),
              type: resp.type.substring(1)
            }
          }
        } else {
          const result = { name: i.name, data: {} }
          for (let key in resp) {
            if (resp[key].type.includes('idCard')) {
              // 识别身份证信息
              const ocrData = JSON.parse(JSON.parse(resp[key].data).data).data
              result.data.data = { ...result.data.data, ...ocrData.face.data, ...ocrData.back.data }
            } else {
              // 自定义模板识别
              result.data.data = {
                ...result.data.data,
                ...processOcrData(JSON.parse(resp[key].data).data.data)
              }
              result.data.type = resp[key].type.substring(1)
            }
          }
          return result
        }
      })
    )
    logger.info(
      `/ocr 接口响应：${JSON.stringify(
        ocrResponse.map((i) => ({ name: i.name, type: i.data.type })),
        null,
        4
      )}`
    )
    logger.info('开始请求验证接口...')
    // 请求验证接口
    const reviewResponse = await Promise.all(
      ocrResponse.map(async (i) => {
        // const ocrResult = processOcrData(JSON.parse(i.data.data).data.data)
        const resp = await verify(i.data.type, i.data.data)
        return { name: i.name, type: i.data.type, verifyResult: resp, ocrResult: i.data.data }
      })
    )
    logger.info(
      `/reviewXXX 接口响应：${JSON.stringify(
        reviewResponse.map((i) => ({ name: i.name, type: i.type })),
        null,
        4
      )}`
    )
    return reviewResponse
  } catch (error) {
    logger.error(`请求错误：${error.message}`)
    ElMessage({
      message: '请求错误！',
      type: 'error'
    })
    return Promise.reject(error)
  }
}
// 处理ocr数据
function processOcrData(dataArray) {
  return dataArray.reduce((r, i) => {
    if (i.name !== undefined) {
      r[i.name] = i.fieldWord
    } else {
      r[i.fieldName] = i.fieldWord
    }
    return r
  }, {})
}

// 任务结束
async function handleReviewEnding() {
  if (!taskEndingFlag.value) {
    logger.warn('未进行审核，无法进行结束任务操作')
    ElMessageBox.alert('请先开始审核！', '错误：', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }
  const currentTimesName = getCurrentDateTimeString()
  logger.info('开始创建文件夹和移动文件...')
  // 创建文件夹，将本次扫描文件放入文件夹中
  const handle = await createFolder(folderStore.backupFolderHandle, currentTimesName)
  // 创建日志日志文件并保存
  logger.info('审核任务结束并重置任务')
  writeFile(handle, 'Log.txt', logger.getLogs())
  // 移动本次审核文件到备份文件夹
  await moveFolderContents(folderStore.folderHandle, handle)
  // 任务重置
  taskEndingFlag.value = false
  currentResult.value = []
  logger.clearLogs() //重置日志
  ElMessage({
    message: '本次审核任务结束!',
    type: 'success'
  })
}

/* Right */
/* Right */
/* Right */
const currentResult = ref(null)
const detailView = ref(false)
const toggleViewsButtonMessage = ref('详细视图')

// 切换视图
function handletoggleDetailView() {
  detailView.value = !detailView.value
  toggleViewsButtonMessage.value = detailView.value ? '粗略视图' : '详细视图'
}

// 侦听器
watchEffect(() => {
  if (folderList.value === null) {
    return
  }
  if (folderList.value.length === 0) {
    // 未扫描文件
    currentStep.value = 0
    showPopover.value = true
  } else if (folderList.value.length > 0 && !taskEndingFlag.value) {
    // 已扫描文件但未开始审核
    currentPicture.value = folderList.value[0].url
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
  width: 240px;
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
  opacity: 1;
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
  transform: scaleX(0);
  margin: 0;
  padding: 0;
  border: none;
  padding-left: 5px;
}
.right-detailView {
  flex: 4;
}
</style>

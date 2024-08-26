<template>
  <div class="setting-container">
    <div class="button-area">
      <h3 style="margin-top: 0">设置界面</h3>
      <el-button class="button" type="primary" @click="goToHome">完成 / 回到首页 </el-button>
      <h4>配置操作<label style="color: lightcoral">*</label></h4>
      <!-- 配置扫描文件按钮 -->
      <span style="font-size: 12px">
        <strong>状态：</strong>
        <span v-if="folderList" style="color: lightgreen">已配置</span>
        <span v-if="!folderList" style="color: lightcoral">未配置</span>
      </span>
      <el-button
        class="button"
        plain
        type="primary"
        @click="handleClick('folder', 'checkFolderTimerId')"
        style="margin-bottom: 15px"
      >
        指定扫描文件存放文件夹
      </el-button>
      <!-- 配置备份文件按钮 -->
      <span style="font-size: 12px">
        <strong>状态：</strong>
        <span v-if="backupFolderList" style="color: lightgreen">已配置</span>
        <span v-if="!backupFolderList" style="color: lightcoral">未配置</span>
      </span>
      <el-button
        class="button"
        plain
        type="primary"
        @click="handleClick('backupFolder', 'checkBackupFolderTimerId')"
      >
        指定备份文件存放文件夹
      </el-button>
    </div>
    <div class="explore-area">
      <!-- 展示区域 -->
      <!-- 展示区域 -->
      <el-table
        :height="600"
        :data="folderList"
        style="width: 200px; margin-bottom: 20px"
        row-key="name"
        border
        v-loading="folderLoading"
        empty-text="空目录"
      >
        <el-table-column prop="fileName" label="扫描文件夹" sortable>
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
      </el-table>
      <!-- 展示区域 -->
      <el-table
        :height="600"
        :data="backupFolderList"
        style="width: 200px; margin-bottom: 20px"
        row-key="name"
        border
        empty-text="空目录"
        v-loading="backupFolderLoading"
      >
        <el-table-column prop="fileName" label="备份文件夹" sortable>
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import getFolderContent from '@/utils/getFolderContent'
import { useFolderStore } from '@/stores/folder'
import { ref, computed, onMounted } from 'vue'

const folderStore = useFolderStore()
const router = useRouter()
const folderList = computed(() => folderStore.folderContent)
const backupFolderList = computed(() => folderStore.backupFolderContent)

const folderLoading = ref(false)
const backupFolderLoading = ref(false)

const handleClick = async (folder, timer) => {
  try {
    // 调用 getFolderContent 并等待结果
    await getFolderContent(folder, timer)

    // 成功后的弹出框
    ElMessageBox.alert('文件夹已成功配置', '操作成功', {
      confirmButtonText: '确定',
      type: 'success'
    })
  } catch (error) {
    // 失败后的弹出框
    ElMessageBox.alert(error.message || '文件夹配置失败', '操作失败', {
      confirmButtonText: '确定',
      type: 'warning'
    })
  }
}

// 回到首页
function goToHome() {
  if (folderStore.checkFolderTimerId === null || folderStore.checkBackupFolderTimerId === null) {
    ElMessage({
      message: '请先完成配置操作！',
      type: 'warning'
    })
  }
  router.push('/home')
}
// 初始化
onMounted(async () => {
  try {
    // 获取历史文件
    folderLoading.value = true
    backupFolderLoading.value = true
    await getFolderContent('folder', 'checkFolderTimerId', true)
    folderLoading.value = false
    await getFolderContent('backupFolder', 'checkBackupFolderTimerId', true)
    backupFolderLoading.value = false
  } catch (error) {
    console.error(error)
  } finally {
    folderLoading.value = false
    backupFolderLoading.value = false
  }
})
</script>

<style scoped>
.setting-container {
  padding: 20px;
  color: #333;
  display: flex;
}
.explore-area {
  display: flex;
}
.explore-area > * {
  margin-right: 30px;
}
.button-area {
  margin-right: 30px;
  display: flex;
  flex-direction: column;
  width: 200px;
}
.button-area .button {
  margin: 5px 0;
}
</style>

import { defineStore } from 'pinia';

export const useFolderStore = defineStore('folderStore', {
  state: () => ({
    checkFolderTimerId: null, // 监控内容文件夹计时器ID
    checkBackupFolderTimerId: null, // 监控备份文件夹计时器ID
    folderContent: null, // 文件内容
    backupFolderContent: null, // 备份文件夹内容,
    // 文件夹句柄
    folderHandle: null,
    backupFolderHandle: null
  }),
  getters: {},
  actions: {
    // 设置状态
    setState(stateName, payload) {
      this[stateName] = payload;
    },
    // 获取状态
    getState(stateName) {
      return this[stateName];
    }
  }
});

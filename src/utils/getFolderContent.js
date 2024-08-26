import { processHandle } from './processHandle'
import { writeFile } from './writeContent'
import { deleteFile } from './deleteContent'
import arraysEqual from './contrastContent'
import { useFolderStore } from '@/stores/folder'

const folderStore = useFolderStore()

/**
 * 将文件夹中的内容保存到仓库中
 * @returns
 */
async function getFolderContent(folder, timer, getHandleFromIndexedDB = false) {
  try {
    const handleKey = folder + 'Handle'
    const folderName = folder + 'Content'

    let handle = await restoreDirectoryHandle(handleKey)
    if (getHandleFromIndexedDB === true) {
      // 选择从持久化存储中获取句柄
      const granted = await handle.requestPermission({ writable: true })
      if (granted !== 'granted') {
        console.error('Permission not granted to access the directory')
        return
      }
      if (!handle) {
        // 如果持久化存储中没有句柄
        // 则让用户选择文件夹后持久化存储到indexedDB
        // 使用 showDirectoryPicker 让用户选择文件夹
        handle = await window.showDirectoryPicker()
        // 存储句柄到 IndexedDB 中
        await saveHandleToIndexedDB(handle, handleKey)
      }
    } else {
      // 使用 showDirectoryPicker 让用户选择文件夹
      handle = await window.showDirectoryPicker()
      // 存储句柄到 IndexedDB 中
      await saveHandleToIndexedDB(handle, handleKey)
    }

    // 清除之前的计时器
    clearInterval(folderStore.getState(timer))

    // 保存句柄到仓库
    folderStore.setState(handleKey, handle)

    // 写入初始文件以获取权限
    await writeFile(handle, 'initial.txt', `>> 初始化`)
    await deleteFile(handle, 'initial.txt')

    // 监控文件夹变化
    folderStore.setState(
      timer,
      setInterval(async () => {
        const result = await processHandle(handle)
        if (
          !arraysEqual(folderStore.getState(folderName), result) ||
          folderStore.getState(folderName) === null
        ) {
          console.log(`>> ${folder} Folder Changed`)
          folderStore.setState(folderName, result)
        }
      }, 1000)
    )

    // 立即执行获取结果
    const result = await processHandle(handle)
    return result
  } catch (error) {
    console.error('取消配置:', error)
    throw new Error('取消配置')
  }
}
// 存储句柄到 IndexedDB
async function saveHandleToIndexedDB(handle, key) {
  const db = await openIndexedDB()
  const tx = db.transaction('file-handles', 'readwrite')
  const store = tx.objectStore('file-handles')

  store.put({ id: key, handle: handle })

  await tx.complete
}
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDatabase', 1)

    request.onupgradeneeded = function (event) {
      const db = event.target.result
      db.createObjectStore('file-handles', { keyPath: 'id' })
    }

    request.onsuccess = function (event) {
      resolve(event.target.result)
    }

    request.onerror = function (event) {
      reject(event.target.error)
    }
  })
}

// 从 IndexedDB 中检索并恢复句柄
// 从 IndexedDB 中检索并恢复句柄
async function restoreDirectoryHandle(handleKey) {
  try {
    const directoryHandle = await getHandleFromIndexedDB(handleKey)

    if (directoryHandle) {
      // 请求读写权限
      const granted = await directoryHandle.requestPermission({ writable: true })
      if (granted !== 'granted') {
        console.error('Permission not granted to access the directory')
        return null
      }

      console.log('>> Successfully retrieved and restored directory handle')

      // 返回成功获取的 directoryHandle
      return directoryHandle
    } else {
      console.log('No directory handle found in storage')
      return null
    }
  } catch (error) {
    console.error('Error restoring directory handle:', error)
    return null
  }
}
// 从 IndexedDB 检索句柄
async function getHandleFromIndexedDB(key) {
  const db = await openIndexedDB()
  const tx = db.transaction('file-handles', 'readonly')
  const store = tx.objectStore('file-handles')

  const request = store.get(key)

  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result?.handle)
    }

    request.onerror = function (event) {
      reject(event.target.error)
    }
  })
}

export default getFolderContent

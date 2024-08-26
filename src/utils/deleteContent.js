// 删除文件的函数
export async function deleteFile(folderHandle, fileName) {
  try {
    // 删除文件
    await folderHandle.removeEntry(fileName);
  } catch (error) {
    console.error(`删除文件 ${fileName} 时发生错误:`, error);
  }
}

// 删除文件夹的函数
export async function deleteFolder(folderHandle, folderName) {
  try {
    // 删除文件夹
    await folderHandle.removeEntry(folderName, { recursive: true });
    console.log(`文件夹 ${folderName} 删除成功`);
  } catch (error) {
    console.error(`删除文件夹 ${folderName} 时发生错误:`, error);
  }
}
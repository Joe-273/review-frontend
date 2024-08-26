// 写入文件的函数
export async function writeFile(folderHandle, fileName, content) {
  try {
    // 创建文件
    const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });

    // 创建写入流
    const writableStream = await fileHandle.createWritable();

    // 写入内容
    await writableStream.write(content);

    // 关闭写入流，保存文件
    await writableStream.close();
  } catch (error) {
    console.error(`写入文件 ${fileName} 时发生错误:`, error);
  }
}

// 创建文件夹的函数
export async function createFolder(parentFolderHandle, folderName) {
  try {
    // 创建或获取文件夹句柄
    const folderHandle = await parentFolderHandle.getDirectoryHandle(folderName, { create: true });
    console.log(`文件夹 ${folderName} 创建成功`);
    return folderHandle; // 返回新创建的文件夹句柄
  } catch (error) {
    console.error(`创建文件夹 ${folderName} 时发生错误:`, error);
  }
}
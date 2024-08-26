export async function moveFolderContents(sourceHandle, destinationHandle = null) {
  try {
    // 遍历第一个文件夹的所有内容
    for await (const [name, entry] of sourceHandle.entries()) {
      if (entry.kind === 'file') {
        if (destinationHandle === null) {
          // 删除文件
          await sourceHandle.removeEntry(name);
        } else {
          // 移动文件
          await moveFile(entry, destinationHandle);
        }
      } else if (entry.kind === 'directory') {
        if (destinationHandle === null) {
          // 递归删除文件夹内容并删除文件夹
          await deleteFolderContents(entry);
          await sourceHandle.removeEntry(name, { recursive: true });
        } else {
          // 如果是子文件夹，则递归移动其内容
          const newDirHandle = await destinationHandle.getDirectoryHandle(name, { create: true });
          await moveFolderContents(entry, newDirHandle);
          // 删除源文件夹
          await sourceHandle.removeEntry(name, { recursive: true });
        }
      }
    }
  } catch (error) {
    console.error('Error moving or deleting folder contents:', error);
  }
}

// 移动单个文件
async function moveFile(fileHandle, destinationFolderHandle) {
  try {
    const file = await fileHandle.getFile();
    const writableStream = await destinationFolderHandle.getFileHandle(file.name, { create: true })
      .then(handle => handle.createWritable());

    // 读取文件并写入新位置 (使用二进制流)
    const reader = file.stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writableStream.write(value);
    }
    await writableStream.close();

    // 删除源文件
    await fileHandle.remove();
  } catch (error) {
    console.error(`Error moving file: ${fileHandle.name}`, error);
  }
}

// 递归删除文件夹内容
async function deleteFolderContents(directoryHandle) {
  try {
    for await (const [name, entry] of directoryHandle.entries()) {
      if (entry.kind === 'file') {
        // 删除文件
        await directoryHandle.removeEntry(name);
      } else if (entry.kind === 'directory') {
        // 递归删除子文件夹内容
        await deleteFolderContents(entry);
        // 删除子文件夹
        await directoryHandle.removeEntry(name, { recursive: true });
      }
    }
  } catch (error) {
    console.error('Error deleting folder contents:', error);
  }
}

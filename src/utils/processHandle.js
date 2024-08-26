export async function processHandle(handle, isRoot = true) {
  if (handle.kind === 'file') {
    const file = await handle.getFile();
    return {
      name: handle.name,
      kind: 'file',
      file: file
    };
  }

  if (handle.kind === 'directory') {
    const directory = {
      name: handle.name,
      kind: 'directory',
      children: []
    };

    const iterator = handle.entries();
    for await (const entry of iterator) {
      const child = await processHandle(entry[1], false);
      directory.children.push(child);
    }

    // 如果是根节点，返回其子节点数组而不是根节点本身
    return isRoot ? directory.children : directory;
  }
}

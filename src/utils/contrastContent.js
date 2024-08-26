// 判断两个数组是否内容相同
function arraysEqual(arr1, arr2) {
  if (arr1 === null || arr2 === null || arr1 === undefined || arr2 === undefined) {
    // 如果其中一个数组为空，直接返回无变化
    return true
  }

  // 如果数组长度不同，则不相同
  if (arr1.length !== arr2.length) {
    return false
  }

  // 使用深度比较，检查每个对象的指定属性是否相同
  return arr1.every((item, index) => _deepEqual(item, arr2[index]))
}

// 深度检测两个对象是否相等，比较特定的属性
function _deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false
  }

  // 仅比较指定的属性（如 name 和子文件夹/文件内容）
  const keysToCompare = ['name', 'children', 'file']

  for (const key of keysToCompare) {
    // 如果属性存在并且不相同，返回 false
    if (obj1[key] !== undefined || obj2[key] !== undefined) {
      if (!_deepEqual(obj1[key], obj2[key])) {
        return false
      }
    }
  }

  return true
}

export default arraysEqual

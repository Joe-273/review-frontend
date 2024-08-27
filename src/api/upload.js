import request from './request'

export async function postUpload(file) {
  const formData = new FormData()
  formData.append('file', file) // 假设服务器接收名为 'file' 的字段

  // 发送请求
  const response = await request.post('/api/upload', formData)
  // 返回响应
  return response
}

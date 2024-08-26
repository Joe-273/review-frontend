import request from './request'

export async function verify(path, json) {
  // 发送请求
  const response = await request.post('/api/' + path, json)

  // 返回响应
  return response
}

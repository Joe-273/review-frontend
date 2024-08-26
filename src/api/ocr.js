import request from './request'

export async function postOcr(url) {
  // 发送请求
  const response = await request.post('/api/ocr', url)

  // 返回响应
  return response
}

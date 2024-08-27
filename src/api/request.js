import axios from 'axios'

const request = axios.create({
  baseURL: 'http://47.115.173.133'
})
request.interceptors.response.use(
  function (response) {
    return response.data
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default request

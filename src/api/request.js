import axios from 'axios'

const request = axios.create({
  // baseURL: 'http://localhost:8081'
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

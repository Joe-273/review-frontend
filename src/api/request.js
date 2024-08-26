import axios from 'axios'

const request = axios.create()
request.interceptors.response.use(
  function (response) {
    return response.data
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default request

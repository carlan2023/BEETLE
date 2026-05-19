import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const raw = localStorage.getItem('beetle-auth')
  if (raw) {
    const { state } = JSON.parse(raw)
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('beetle-auth')
      window.location.href = '/vendor/login'
    }
    return Promise.reject(err)
  }
)

export default api

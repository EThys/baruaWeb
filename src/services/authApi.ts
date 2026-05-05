import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Auth backend : chemins à la racine (`/auth/login`, `/auth/register`), pas sous `/api/v1`.
 * Sinon Axios fusionne en `/api/v1/auth/login`.
 *
 * Important : le **backend** attend du **POST** avec JSON sur ces URLs.
 * Le navigateur affiche la page SPA avec un **GET** sur `/auth/login` — c’est la route Vue, pas l’API.
 */
export const authApi: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

authApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('barua_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

authApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const reqUrl = String(error.config?.url ?? '')
    const isAuthAttempt =
      reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register')
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('barua_token')
      localStorage.removeItem('barua_user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)

export default authApi

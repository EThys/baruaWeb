import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

/**
 * En prod sur HTTPS (Vercel), une URL `http://…` dans VITE_API_URL est “baked” au build
 * et provoque du mixed content. On n’accepte en prod que HTTPS absolu ou un chemin relatif.
 */
const envApi = (import.meta.env.VITE_API_URL as string | undefined)?.trim()

function resolveApiBaseUrl(): string {
  if (import.meta.env.PROD) {
    if (envApi?.startsWith('https://')) return envApi
    if (envApi?.startsWith('/')) return envApi
    return '/api/v1'
  }
  return envApi || 'http://localhost:3000/api'
}

const API_BASE_URL = resolveApiBaseUrl()

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

function normalizeRelativeUrl(url: string): string {
  // Axios ignore `baseURL` when `url` starts with `/`.
  // We want `/api/v1` + `public/foo` (not `/public/foo`).
  return url.startsWith('/') ? url.slice(1) : url
}

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('barua_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response Interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
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

// ─── Typed helpers ────────────────────────────────────────────────────────
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(normalizeRelativeUrl(url), { params })
  return data
}

export async function apiPost<T>(url: string, payload?: unknown): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(normalizeRelativeUrl(url), payload)
  return data
}

export async function apiPut<T>(url: string, payload?: unknown): Promise<ApiResponse<T>> {
  const { data } = await api.put<ApiResponse<T>>(normalizeRelativeUrl(url), payload)
  return data
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await api.delete<ApiResponse<T>>(normalizeRelativeUrl(url))
  return data
}

export async function apiPostForm<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(normalizeRelativeUrl(url), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export default api

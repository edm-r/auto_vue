import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

import {
  clearStoredAuth,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from '../auth/storage'

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined
if (!baseURL) {
  throw new Error(
    'Missing VITE_API_BASE_URL. Define it in .env (ex: VITE_API_BASE_URL=https://api.example.com/api).',
  )
}

const refreshClient = axios.create({ baseURL })
export const api = axios.create({ baseURL })

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (!original || error.response?.status !== 401) {
      throw error
    }

    if (original._retry) {
      clearStoredAuth()
      window.location.assign('/login')
      throw error
    }
    original._retry = true

    const refresh = getRefreshToken()
    if (!refresh) {
      clearStoredAuth()
      window.location.assign('/login')
      throw error
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post('/auth/token/refresh/', { refresh })
          .then((r) => {
            const access = (r.data as { access?: string }).access
            if (!access) throw new Error('No access token returned')
            setAccessToken(access)
            return access
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const access = await refreshPromise
      original.headers.Authorization = `Bearer ${access}`
      return api.request(original)
    } catch (e) {
      clearStoredAuth()
      window.location.assign('/login')
      throw e
    }
  },
)

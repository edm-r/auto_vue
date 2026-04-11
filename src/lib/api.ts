import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

import {
  clearStoredAuth,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from '../auth/storage'
import { getApiBaseUrl } from '../config/apiBaseUrl'
import { getOrCreateSessionId } from '../cart/session'

const refreshClient = axios.create()
export const api = axios.create()

function applyBaseUrl(config: InternalAxiosRequestConfig) {
  const baseURL = getApiBaseUrl()
  if (!baseURL) {
    throw new Error(
      'API base URL is not configured. Set VITE_API_BASE_URL in .env or provide /runtime-config.js.',
    )
  }
  config.baseURL = baseURL
  config.headers['X-Session-Id'] = getOrCreateSessionId()
  return config
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  applyBaseUrl(config)
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

refreshClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return applyBaseUrl(config)
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

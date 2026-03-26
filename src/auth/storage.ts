export type AuthTokens = {
  access: string
  refresh: string
}

export type AuthUser = {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
}

type StoredAuth = {
  tokens: AuthTokens
  user?: AuthUser
}

const STORAGE_KEY = 'auto_vue_auth'

export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function setStoredAuth(value: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken(): string | null {
  return getStoredAuth()?.tokens?.access ?? null
}

export function getRefreshToken(): string | null {
  return getStoredAuth()?.tokens?.refresh ?? null
}

export function setAccessToken(access: string) {
  const current = getStoredAuth()
  if (!current) return
  setStoredAuth({ ...current, tokens: { ...current.tokens, access } })
}


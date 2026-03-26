import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from './storage'
import type { AuthTokens, AuthUser } from './storage'
import { isJwtExpired } from './jwt'
import { api } from '../lib/api'

type AuthContextValue = {
  user: AuthUser | null
  tokens: AuthTokens | null
  isInitializing: boolean
  isAuthenticated: boolean
  login: (params: { username: string; password: string }) => Promise<void>
  register: (params: {
    username: string
    email: string
    password: string
    password2: string
    first_name?: string
    last_name?: string
  }) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)

  useEffect(() => {
    const stored = getStoredAuth()
    if (!stored?.tokens?.access || !stored?.tokens?.refresh) {
      setIsInitializing(false)
      return
    }

    // Keep session even if access is expired; interceptor will refresh on first call.
    setTokens(stored.tokens)
    setUser(stored.user ?? null)

    // If access is obviously invalid and refresh missing, clear.
    if (stored.tokens.access && isJwtExpired(stored.tokens.access) && !stored.tokens.refresh) {
      clearStoredAuth()
      setTokens(null)
      setUser(null)
    }

    setIsInitializing(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isInitializing,
      isAuthenticated: Boolean(tokens?.access),
      login: async ({ username, password }) => {
        const response = await api.post('/auth/login/', { username, password })
        const data = response.data as {
          access: string
          refresh: string
          user?: AuthUser
        }
        const nextTokens = { access: data.access, refresh: data.refresh }
        setTokens(nextTokens)
        setUser(data.user ?? null)
        setStoredAuth({ tokens: nextTokens, user: data.user })
      },
      register: async (payload) => {
        await api.post('/auth/register/', payload)
      },
      refreshUser: async () => {
        const stored = getStoredAuth()
        if (!stored?.tokens?.access) return
        const res = await api.get('/auth/users/me/')
        const nextUser = res.data as AuthUser
        setUser(nextUser)
        setStoredAuth({ tokens: stored.tokens, user: nextUser })
      },
      logout: () => {
        clearStoredAuth()
        setTokens(null)
        setUser(null)
      },
    }),
    [user, tokens, isInitializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

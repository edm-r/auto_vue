import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'auto_vue_theme'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('light', theme === 'light')
  root.style.colorScheme = theme
}


export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? null
    const next: Theme = stored === 'light' ? 'light' : 'dark'
    setThemeState(next)
    applyThemeClass(next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (next) => {
        setThemeState(next)
        localStorage.setItem(STORAGE_KEY, next)
        applyThemeClass(next)
      },
      toggleTheme: () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark'
        setThemeState(next)
        localStorage.setItem(STORAGE_KEY, next)
        applyThemeClass(next)
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user, refreshUser } = useAuth()
  const [checking, setChecking] = useState(false)

  const isAdmin = Boolean(user?.is_superuser || user?.is_staff)
  const isUnknown = isAuthenticated && (user?.is_staff == null || user?.is_superuser == null)

  useEffect(() => {
    let mounted = true
    if (!isUnknown) return
    ;(async () => {
      try {
        setChecking(true)
        await refreshUser()
      } finally {
        if (!mounted) return
        setChecking(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [isUnknown, refreshUser])

  if (isInitializing || checking) {
    return <div style={{ padding: 24 }}>Chargement…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />
  }

  return children
}


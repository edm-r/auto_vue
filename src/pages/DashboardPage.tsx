import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import { getAccessToken } from '../auth/storage'
import { parseJwtPayload } from '../auth/jwt'

export function DashboardPage() {
  const { user, logout } = useAuth()

  const tokenInfo = useMemo(() => {
    const token = getAccessToken()
    if (!token) return null
    const payload = parseJwtPayload(token)
    return payload?.exp ? new Date(payload.exp * 1000).toISOString() : null
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Dashboard (protégé)</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)' }}>
        Connecté en tant que <strong>{user?.username ?? 'Utilisateur'}</strong>
      </p>
      {tokenInfo ? (
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Access token exp: {tokenInfo}</p>
      ) : null}

      <div className="actions">
        <button
          className="btn"
          onClick={() => {
            logout()
            window.location.assign('/login')
          }}
        >
          Logout
        </button>
        <Link className="btn btn-primary" to="/login">
          Aller login
        </Link>
      </div>
    </div>
  )
}


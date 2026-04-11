import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="auth-shell">
      <div className="auth-topbar">
        <Link className="auth-logo" to="/" aria-label="Retour à l'accueil">
          <span className="auth-logoMark">AV</span>
          <span className="auth-logoText">AutoVue</span>
        </Link>
      </div>
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>
        {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  )
}

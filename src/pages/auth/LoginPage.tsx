import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import { AuthLayout } from '../../components/AuthLayout'
import { InputField } from '../../components/InputField'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      await login({ username, password })
      const next = (location.state as { from?: string } | null)?.from
      navigate(next ?? '/dashboard', { replace: true })
    } catch (err) {
      setError('Identifiants invalides ou serveur indisponible.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Connecte-toi pour accéder à ton compte."
    >
      {success ? <AlertMessage type="success" message={success} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      <form onSubmit={onSubmit}>
        <InputField
          label="Nom d'utilisateur"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <InputField
          label="Mot de passe"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>

        <div className="helper">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </div>
        <div className="helper">
          Pas de compte ? <Link to="/register">Créer un compte</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

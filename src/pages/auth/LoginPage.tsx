import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import { AuthLayout } from '../../components/AuthLayout'
import { InputField } from '../../components/InputField'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isInitializing } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      await login({ username, password })
      const next = (location.state as { from?: string } | null)?.from
      navigate(next ?? '/', { replace: true })
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

      <form onSubmit={onSubmit} className="space-y-4">
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

        <button
          className="w-full btn btn-primary mt-6"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>

        <div className="text-center text-sm text-neutral-600 mt-4">
          <Link
            to="/forgot-password"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="text-center text-sm text-neutral-600">
          Pas de compte ?{' '}
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Créer un compte
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

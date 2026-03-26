import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { api } from '../../lib/api'
import { AlertMessage } from '../../components/AlertMessage'
import { AuthLayout } from '../../components/AuthLayout'
import { InputField } from '../../components/InputField'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const params = useParams()
  const token = params.token ? decodeURIComponent(params.token) : ''

  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!token) {
      setError('Token manquant.')
      return
    }
    if (newPassword !== newPassword2) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.post('/auth/reset-password/', {
        token,
        new_password: newPassword,
        new_password2: newPassword2,
      })
      const data = res.data as { message?: string }
      setSuccess(data.message ?? 'Mot de passe réinitialisé.')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 800)
    } catch {
      setError('Impossible de réinitialiser le mot de passe. Vérifie le token.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Réinitialiser le mot de passe" subtitle="Choisis un nouveau mot de passe.">
      {success ? <AlertMessage type="success" message={success} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      <form onSubmit={onSubmit}>
        <InputField
          label="Nouveau mot de passe"
          name="new_password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <InputField
          label="Confirmer le mot de passe"
          name="new_password2"
          type="password"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          autoComplete="new-password"
          required
        />

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Validation…' : 'Valider'}
          </button>
        </div>

        <div className="helper">
          <Link to="/login">Retour</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

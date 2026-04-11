import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../lib/api'
import { AlertMessage } from '../../components/AlertMessage'
import { AuthLayout } from '../../components/AuthLayout'
import { InputField } from '../../components/InputField'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setResetToken(null)
    setIsSubmitting(true)
    try {
      const res = await api.post('/auth/forgot-password/', { email })
      const data = res.data as { message?: string; reset_token?: string | null }
      setSuccess(data.message ?? 'Si un compte existe, un lien a été envoyé.')
      if (data.reset_token) setResetToken(data.reset_token)
    } catch {
      setError('Impossible de traiter la demande. Réessaie plus tard.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entre ton email pour recevoir un lien de réinitialisation."
    >
      {success ? <AlertMessage type="success" message={success} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      <form onSubmit={onSubmit}>
        <InputField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>

        {resetToken ? (
          <div className="helper">
            (Dev) reset_token reçu: <code>{resetToken}</code>
            <div>
              <Link to={`/reset-password/${encodeURIComponent(resetToken)}`}>
                Aller à la page reset
              </Link>
            </div>
          </div>
        ) : null}

        <div className="helper">
          <Link to="/login">Retour</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

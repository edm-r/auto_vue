import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import { AuthLayout } from '../../components/AuthLayout'
import { InputField } from '../../components/InputField'
import { useAuth } from '../../auth/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register(form)
      navigate('/login', {
        replace: true,
        state: { message: 'Inscription réussie. Tu peux maintenant te connecter.' },
      })
    } catch (err) {
      setError("Impossible de créer le compte. Vérifie les champs et réessaie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Inscription"
      subtitle="Crée ton compte pour commander plus vite."
    >
      {error ? <AlertMessage type="error" message={error} /> : null}

      <form onSubmit={onSubmit}>
        <InputField
          label="Nom d'utilisateur"
          name="username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          autoComplete="username"
          required
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          required
        />
        <div className="actions" style={{ marginTop: 0 }}>
          <div style={{ flex: 1 }}>
            <InputField
              label="Prénom"
              name="first_name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              autoComplete="given-name"
            />
          </div>
          <div style={{ flex: 1 }}>
            <InputField
              label="Nom"
              name="last_name"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              autoComplete="family-name"
            />
          </div>
        </div>
        <InputField
          label="Mot de passe"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          required
        />
        <InputField
          label="Confirmer le mot de passe"
          name="password2"
          type="password"
          value={form.password2}
          onChange={(e) => setForm({ ...form, password2: e.target.value })}
          autoComplete="new-password"
          required
        />

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création…' : 'Créer mon compte'}
          </button>
        </div>

        <div className="helper">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

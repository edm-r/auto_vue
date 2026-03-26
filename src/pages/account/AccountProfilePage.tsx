import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { useAuth } from '../../auth/AuthContext'
import {
  changePassword,
  fetchMeUser,
  fetchUserProfile,
  updateMeUser,
  updateUserProfile,
} from '../../account/accountApi'

export function AccountProfilePage() {
  const { refreshUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')

  const [saving, setSaving] = useState(false)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        setSuccess(null)
        const [me, profile] = await Promise.all([fetchMeUser(), fetchUserProfile()])
        if (!isMounted) return
        setUsername(me.username ?? '')
        setEmail(me.email ?? '')
        setFirstName(me.first_name ?? '')
        setLastName(me.last_name ?? '')
        setPhone(profile.phone_number ?? '')
      } catch {
        if (!isMounted) return
        setError('Impossible de charger ton profil.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  async function saveProfile() {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      await Promise.all([
        updateMeUser({ email, first_name: firstName, last_name: lastName }),
        updateUserProfile({ phone_number: phone }),
      ])
      await refreshUser()
      setSuccess('Profil mis à jour.')
    } catch (e) {
      const detail =
        isAxiosError(e) && e.response
          ? (e.response.data as { detail?: string; email?: string[] }).detail ??
            ((e.response.data as { email?: string[] }).email?.[0] ?? null)
          : null
      setError(detail || 'Impossible de mettre à jour le profil.')
    } finally {
      setSaving(false)
    }
  }

  async function doChangePassword() {
    try {
      setChanging(true)
      setError(null)
      setSuccess(null)
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      })
      setOldPassword('')
      setNewPassword('')
      setNewPassword2('')
      setSuccess('Mot de passe modifié.')
    } catch (e) {
      const detail =
        isAxiosError(e) && e.response
          ? (e.response.data as { detail?: string; old_password?: string[]; new_password?: string[] }).detail ??
            (e.response.data as { old_password?: string[] }).old_password?.[0] ??
            (e.response.data as { new_password?: string[] }).new_password?.[0]
          : null
      setError(detail || 'Impossible de changer le mot de passe.')
    } finally {
      setChanging(false)
    }
  }

  if (loading) {
    return <div className="skeleton-detail" />
  }

  return (
    <div className="account-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="account-card">
        <div className="account-card-title">Informations</div>

        <InputField
          label="Username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled
        />
        <InputField label="Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="account-grid">
          <InputField label="Prénom" name="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <InputField label="Nom" name="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <InputField label="Téléphone" name="phone_number" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <div className="actions">
          <button className="btn btn-primary" type="button" onClick={saveProfile} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
        <div className="account-muted">Note: le username est géré côté backend et peut être non modifiable.</div>
      </div>

      <div className="account-card">
        <div className="account-card-title">Mot de passe</div>
        <InputField
          label="Ancien mot de passe"
          name="old_password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <div className="account-grid">
          <InputField
            label="Nouveau mot de passe"
            name="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <InputField
            label="Confirmation"
            name="new_password2"
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
          />
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={doChangePassword}
            disabled={changing || !oldPassword || !newPassword || !newPassword2}
          >
            {changing ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
        </div>
      </div>
    </div>
  )
}

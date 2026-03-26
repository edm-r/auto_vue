import { useState } from 'react'
import type { FormEvent } from 'react'

import { AlertMessage } from '../AlertMessage'
import { useCart } from '../../cart/CartContext'

export function PromoCodeInput() {
  const { promo, applyPromo, clearPromo } = useCart()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus(null)
    const value = code.trim()
    if (!value) return

    try {
      setLoading(true)
      const res = await applyPromo(value)
      if (res.valid) {
        setStatus(`Code appliqué: ${res.code}`)
      } else {
        setError(res.detail ?? 'Code promo invalide.')
      }
    } catch {
      setError('Impossible de valider le code promo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cart-card">
      <div className="cart-card-title">Code promo</div>
      {status ? <AlertMessage type="success" message={status} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      {promo?.valid ? (
        <div className="cart-row">
          <div className="cart-muted">Actif: {promo.code}</div>
          <button className="btn" type="button" onClick={clearPromo}>
            Retirer
          </button>
        </div>
      ) : (
        <form className="promo-form" onSubmit={onSubmit}>
          <input
            className="promo-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: AUTO10"
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Validation…' : 'Appliquer'}
          </button>
        </form>
      )}
    </div>
  )
}


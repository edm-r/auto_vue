import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import type { Order } from '../checkout/checkoutApi'
import { fetchOrder } from '../checkout/checkoutApi'

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = Number(searchParams.get('order_id') ?? '0') || 0

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    let isMounted = true
    let attempts = 0
    const timer = window.setInterval(async () => {
      attempts += 1
      try {
        const o = await fetchOrder(orderId)
        if (!isMounted) return
        setOrder(o)
        setLoading(false)
        setError(null)
        if (o.status === 'paid' || attempts >= 10) {
          window.clearInterval(timer)
        }
      } catch {
        if (!isMounted) return
        setError('Impossible de charger la commande.')
        setLoading(false)
        if (attempts >= 3) window.clearInterval(timer)
      }
    }, 1200)

    return () => {
      isMounted = false
      window.clearInterval(timer)
    }
  }, [orderId])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Paiement réussi</h1>
          <div className="page-subtitle">Merci pour ta commande.</div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/">
            Accueil
          </Link>
          <Link className="btn btn-primary" to="/products">
            Continuer les achats
          </Link>
        </div>
      </div>

      {error ? <AlertMessage type="error" message={error} /> : null}

      {loading ? (
        <div className="skeleton-detail" />
      ) : order ? (
        <div className="empty">
          <div style={{ marginBottom: 10 }}>
            Commande <strong>#{order.id}</strong> — statut: <strong>{order.status}</strong>
          </div>
          <div>
            <Link to="/dashboard">Voir mon compte</Link>
          </div>
        </div>
      ) : (
        <div className="empty">Commande introuvable.</div>
      )}
    </div>
  )
}


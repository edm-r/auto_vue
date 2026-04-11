import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import type { Order } from '../../account/accountApi'
import { fetchOrder } from '../../account/accountApi'

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'En attente',
    paid: 'Payée',
    payment_failed: 'Paiement échoué',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    canceled: 'Annulée',
    refunded: 'Remboursée',
  }
  return map[status] ?? status
}

export function AccountOrderDetailPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        if (!id) return
        setLoading(true)
        setError(null)
        const data = await fetchOrder(id)
        if (!isMounted) return
        setOrder(data)
      } catch {
        if (!isMounted) return
        setError("Impossible de charger la commande.")
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <div className="account-section">
      <div className="actions" style={{ marginTop: 0 }}>
        <Link className="btn" to="/account/orders">
          ← Retour
        </Link>
      </div>

      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="account-card">
        <div className="account-card-title">Commande {id ? `#${id}` : ''}</div>
        {loading ? (
          <div className="skeleton-detail" />
        ) : order ? (
          <>
            <div className="account-kv">
              <div className="account-kv-item">
                <div className="account-kv-label">Statut</div>
                <div className="account-kv-value">{statusLabel(order.status)}</div>
              </div>
              <div className="account-kv-item">
                <div className="account-kv-label">Total</div>
                <div className="account-kv-value">{order.total} $</div>
              </div>
              <div className="account-kv-item">
                <div className="account-kv-label">Adresse</div>
                <div className="account-kv-value">
                  {order.shipping_address_id ? `#${order.shipping_address_id}` : '—'}
                </div>
              </div>
              <div className="account-kv-item">
                <div className="account-kv-label">Créée le</div>
                <div className="account-kv-value">{new Date(order.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="account-subtitle">Articles</div>
            <div className="account-table">
              <div className="account-row account-row--head account-row--4">
                <div>Produit</div>
                <div>Qté</div>
                <div>PU</div>
                <div>Total</div>
              </div>
              {order.items.map((it) => (
                <div className="account-row account-row--4" key={it.id}>
                  <div>{it.product_name ?? `Produit #${it.product}`}</div>
                  <div>{it.quantity}</div>
                  <div>{it.unit_price} $</div>
                  <div>{it.total_price} $</div>
                </div>
              ))}
            </div>

            <div className="account-subtitle">Résumé</div>
            <div className="account-kv">
              <div className="account-kv-item">
                <div className="account-kv-label">Sous-total</div>
                <div className="account-kv-value">{order.subtotal} $</div>
              </div>
              <div className="account-kv-item">
                <div className="account-kv-label">Taxe</div>
                <div className="account-kv-value">{order.tax} $</div>
              </div>
              <div className="account-kv-item">
                <div className="account-kv-label">Livraison</div>
                <div className="account-kv-value">{order.shipping_cost} $</div>
              </div>
              <div className="account-kv-item">
                <div className="account-kv-label">Total</div>
                <div className="account-kv-value">{order.total} $</div>
              </div>
            </div>
          </>
        ) : (
          <div className="account-muted">Commande introuvable.</div>
        )}
      </div>
    </div>
  )
}

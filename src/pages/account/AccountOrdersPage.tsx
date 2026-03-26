import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import type { Order } from '../../account/accountApi'
import { fetchOrdersPage } from '../../account/accountApi'

function formatMoney(value: string) {
  return `${value} $`
}

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

export function AccountOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState<number | null>(null)
  const [next, setNext] = useState<string | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const p = await fetchOrdersPage({ page })
        if (!isMounted) return
        setOrders(p.items)
        setCount(p.count)
        setNext(p.next)
        setPrevious(p.previous)
      } catch {
        if (!isMounted) return
        setError("Impossible de charger l'historique des commandes.")
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [page])

  return (
    <div className="account-section">
      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="account-card">
        <div className="account-card-title">Historique des commandes</div>
        {loading ? (
          <div className="skeleton-detail" />
        ) : orders.length ? (
          <div className="account-table">
            <div className="account-row account-row--head">
              <div>ID</div>
              <div>Statut</div>
              <div>Total</div>
              <div>Date</div>
              <div />
            </div>
            {orders.map((o) => (
              <div className="account-row" key={o.id}>
                <div>#{o.id}</div>
                <div>{statusLabel(o.status)}</div>
                <div>{formatMoney(o.total)}</div>
                <div>{new Date(o.created_at).toLocaleString()}</div>
                <div>
                  <Link className="btn" to={`/account/orders/${o.id}`}>
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="account-muted">Aucune commande pour le moment.</div>
        )}

        <div className="actions">
          <button className="btn" type="button" disabled={!previous || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Précédent
          </button>
          <div className="account-muted">
            Page {page}
            {count != null ? ` • ${count} total` : ''}
          </div>
          <button className="btn" type="button" disabled={!next} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}


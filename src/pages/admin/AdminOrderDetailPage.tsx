import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import type { AdminOrder } from '../../admin/adminApi'
import { fetchAdminOrder } from '../../admin/adminApi'

function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill status-pill--${status}`}>{status}</span>
}

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<AdminOrder | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!id) return
        setLoading(true)
        setError(null)
        const data = await fetchAdminOrder(id)
        if (!mounted) return
        setOrder(data)
      } catch {
        if (!mounted) return
        setError('Impossible de charger la commande.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  return (
    <div className="admin-section">
      <div className="admin-pager" style={{ marginTop: 0 }}>
        <Link className="btn" to="/admin/orders">
          ← Retour
        </Link>
        <div />
      </div>

      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Commande {id ? `#${id}` : ''}</div>
            <div className="admin-muted">Détails, articles et totaux.</div>
          </div>
          {order ? <StatusPill status={order.status} /> : null}
        </div>

        {loading ? (
          <div className="skeleton-detail" />
        ) : order ? (
          <>
            <div className="admin-kv">
              <div className="admin-kv-item">
                <div className="admin-kv-label">Client</div>
                <div className="admin-kv-value">#{order.user}</div>
              </div>
              <div className="admin-kv-item">
                <div className="admin-kv-label">Total</div>
                <div className="admin-kv-value">{order.total}</div>
              </div>
              <div className="admin-kv-item">
                <div className="admin-kv-label">Adresse</div>
                <div className="admin-kv-value">{order.shipping_address_id ? `#${order.shipping_address_id}` : '—'}</div>
              </div>
              <div className="admin-kv-item">
                <div className="admin-kv-label">Date</div>
                <div className="admin-kv-value">{new Date(order.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="admin-subtitle">Articles</div>
            <div className="admin-tableWrap">
              <div className="admin-table">
                <div className="admin-tr admin-tr--head admin-tr--4">
                  <div>Produit</div>
                  <div>Qté</div>
                  <div>PU</div>
                  <div>Total</div>
                </div>
                {order.items.map((it) => (
                  <div className="admin-tr admin-tr--4" key={it.id}>
                    <div>{it.product_name ?? `Produit #${it.product_id}`}</div>
                    <div>{it.quantity}</div>
                    <div>{it.unit_price}</div>
                    <div>{it.total_price}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="admin-muted">Commande introuvable.</div>
        )}
      </div>
    </div>
  )
}


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { DataTable } from '../../admin/components/DataTable'
import type { AdminOrder } from '../../admin/adminApi'
import { fetchAdminOrdersPage, updateOrderStatus } from '../../admin/adminApi'

const STATUS_OPTIONS = [
  'pending',
  'paid',
  'payment_failed',
  'shipped',
  'delivered',
  'canceled',
  'refunded',
] as const

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'pending',
    paid: 'paid',
    payment_failed: 'payment_failed',
    shipped: 'shipped',
    delivered: 'delivered',
    canceled: 'canceled',
    refunded: 'refunded',
  }
  return map[status] ?? status
}

export function AdminOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [next, setNext] = useState<string | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)
  const [items, setItems] = useState<AdminOrder[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    const p = await fetchAdminOrdersPage({ page })
    setItems(p.items)
    setNext(p.next)
    setPrevious(p.previous)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        await load()
      } catch {
        if (!mounted) return
        setError('Impossible de charger les commandes.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-card-title">Commandes</div>
        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <>
            <DataTable
              rows={items}
              columns={[
                { key: 'id', title: 'ID', render: (o) => <Link to={`/admin/orders/${o.id}`}>#{o.id}</Link> },
                { key: 'user', title: 'User', render: (o) => o.user },
                { key: 'total', title: 'Total', render: (o) => o.total },
                { key: 'date', title: 'Date', render: (o) => new Date(o.created_at).toLocaleString() },
                {
                  key: 'status',
                  title: 'Statut',
                  render: (o) => (
                    <select
                      className="field-input"
                      value={o.status}
                      disabled={busyId === o.id}
                      onChange={async (e) => {
                        const nextStatus = e.target.value
                        try {
                          setBusyId(o.id)
                          setError(null)
                          setSuccess(null)
                          const updated = await updateOrderStatus(o.id, nextStatus)
                          setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                          setSuccess(`Commande #${o.id} → ${statusLabel(nextStatus)}`)
                        } catch (err) {
                          const detail =
                            isAxiosError(err) && err.response
                              ? (err.response.data as { detail?: string }).detail
                              : null
                          setError(detail || 'Impossible de mettre à jour le statut.')
                        } finally {
                          setBusyId(null)
                        }
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  ),
                },
              ]}
            />

            <div className="actions">
              <button className="btn" type="button" disabled={!previous || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Précédent
              </button>
              <div className="admin-muted">Page {page}</div>
              <button className="btn" type="button" disabled={!next} onClick={() => setPage((p) => p + 1)}>
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


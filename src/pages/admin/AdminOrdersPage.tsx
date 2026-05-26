import { useEffect, useMemo, useState } from 'react'
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

const STATUS_FILTERS: Array<{ key: 'all' | (typeof STATUS_OPTIONS)[number]; label: string }> = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'refunded', label: 'Refunded' },
]

function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill status-pill--${status}`}>{status}</span>
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

  const [statusFilter, setStatusFilter] = useState<'all' | (typeof STATUS_OPTIONS)[number]>('all')
  const [search, setSearch] = useState('')

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

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (!q) return true
      return String(o.id).includes(q) || String(o.user).includes(q) || o.status.toLowerCase().includes(q)
    })
  }, [items, search, statusFilter])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Commandes</div>
            <div className="admin-muted">Mise à jour de statut + consultation des détails.</div>
          </div>
          <div className="admin-cardActions">
            <input
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche: ID, user, statut…"
              aria-label="Recherche commandes"
            />
          </div>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Filtre statut">
          {STATUS_FILTERS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`admin-tab ${statusFilter === t.key ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <>
            <DataTable
              rows={visibleItems}
              columns={[
                { key: 'id', title: 'ID', render: (o) => <Link to={`/admin/orders/${o.id}`}>#{o.id}</Link> },
                { key: 'user', title: 'Client', render: (o) => `#${o.user}` },
                { key: 'total', title: 'Total', render: (o) => o.total },
                { key: 'date', title: 'Date', render: (o) => new Date(o.created_at).toLocaleString() },
                { key: 'pill', title: 'Statut', render: (o) => <StatusPill status={o.status} /> },
                {
                  key: 'update',
                  title: 'Mettre à jour',
                  render: (o) => (
                    <select
                      className="admin-select"
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
                          setSuccess(`Commande #${o.id} → ${nextStatus}`)
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
                          {s}
                        </option>
                      ))}
                    </select>
                  ),
                },
              ]}
              empty="Aucune commande."
            />

            <div className="admin-pager">
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


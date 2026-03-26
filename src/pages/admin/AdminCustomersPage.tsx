import { useEffect, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { DataTable } from '../../admin/components/DataTable'
import type { AdminUser } from '../../admin/adminApi'
import { fetchCustomersPage } from '../../admin/adminApi'

export function AdminCustomersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<AdminUser[]>([])
  const [page, setPage] = useState(1)
  const [next, setNext] = useState<string | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const p = await fetchCustomersPage({ page })
        if (!mounted) return
        setItems(p.items)
        setNext(p.next)
        setPrevious(p.previous)
      } catch {
        if (!mounted) return
        setError('Impossible de charger les clients.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [page])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="admin-card">
        <div className="admin-card-title">Clients</div>
        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <>
            <DataTable
              rows={items}
              columns={[
                { key: 'id', title: 'ID', render: (u) => `#${u.id}` },
                { key: 'username', title: 'Username', render: (u) => u.username },
                { key: 'email', title: 'Email', render: (u) => u.email ?? '—' },
                { key: 'joined', title: 'Inscription', render: (u) => (u.date_joined ? new Date(u.date_joined).toLocaleString() : '—') },
                { key: 'role', title: 'Rôle', render: (u) => (u.is_superuser ? 'superuser' : u.is_staff ? 'staff' : 'client') },
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


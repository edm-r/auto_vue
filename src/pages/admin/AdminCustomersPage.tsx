import { useEffect, useMemo, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { DataTable } from '../../admin/components/DataTable'
import type { AdminUser } from '../../admin/adminApi'
import { fetchCustomersPage } from '../../admin/adminApi'

function roleLabel(u: AdminUser) {
  if (u.is_superuser) return 'superuser'
  if (u.is_staff) return 'staff'
  return 'client'
}

export function AdminCustomersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<AdminUser[]>([])
  const [page, setPage] = useState(1)
  const [next, setNext] = useState<string | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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
        setError('Impossible de charger les utilisateurs.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [page])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((u) => {
      return (
        String(u.id).includes(q) ||
        (u.username ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        roleLabel(u).includes(q)
      )
    })
  }, [items, search])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Utilisateurs</div>
            <div className="admin-muted">Liste des comptes (clients, staff, superuser).</div>
          </div>
          <div className="admin-cardActions">
            <input
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche: id, username, email…"
              aria-label="Recherche utilisateurs"
            />
          </div>
        </div>

        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <>
            <DataTable
              rows={visible}
              columns={[
                { key: 'id', title: 'ID', render: (u) => `#${u.id}` },
                { key: 'username', title: 'Username', render: (u) => u.username },
                { key: 'email', title: 'Email', render: (u) => u.email ?? '—' },
                { key: 'joined', title: 'Inscription', render: (u) => (u.date_joined ? new Date(u.date_joined).toLocaleString() : '—') },
                { key: 'role', title: 'Rôle', render: (u) => roleLabel(u) },
              ]}
              empty="Aucun utilisateur."
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


import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { DataTable } from '../../admin/components/DataTable'
import { InputField } from '../../components/InputField'
import type { AdminProduct } from '../../admin/adminApi'
import { fetchAdminProducts, updateProduct } from '../../admin/adminApi'

export function AdminInventoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<AdminProduct[]>([])

  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    const p = await fetchAdminProducts({ page: 1, search: search.trim() || undefined, is_active: 'all', ordering: 'stock_quantity' })
    setItems(p.items)
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
        setError('Impossible de charger le stock.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-card-title">Gestion du stock</div>
        <div className="admin-toolbar">
          <InputField label="Recherche" name="search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="actions" style={{ marginTop: 10 }}>
            <button
              className="btn"
              type="button"
              onClick={() => {
                void load()
              }}
            >
              Rechercher
            </button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <DataTable
            rows={items}
            columns={[
              { key: 'id', title: 'ID', render: (p) => `#${p.id}` },
              { key: 'name', title: 'Produit', render: (p) => p.name },
              { key: 'stock', title: 'Stock', render: (p) => p.stock_quantity ?? 0 },
              {
                key: 'update',
                title: 'Mise à jour',
                render: (p) => {
                  const current = p.stock_quantity ?? 0
                  return (
                    <div className="admin-actions">
                      <input
                        className="field-input"
                        type="number"
                        defaultValue={String(current)}
                        disabled={busyId === p.id}
                        onKeyDown={async (e) => {
                          if (e.key !== 'Enter') return
                          const value = Number((e.target as HTMLInputElement).value)
                          try {
                            setBusyId(p.id)
                            setError(null)
                            setSuccess(null)
                            await updateProduct(p.id, { stock_quantity: value })
                            setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock_quantity: value } : x)))
                            setSuccess(`Stock mis à jour pour #${p.id}`)
                          } catch (err) {
                            const detail =
                              isAxiosError(err) && err.response
                                ? (err.response.data as { detail?: string }).detail
                                : null
                            setError(detail || 'Impossible de mettre à jour le stock.')
                          } finally {
                            setBusyId(null)
                          }
                        }}
                      />
                      <div className="admin-muted">Entrée pour valider</div>
                    </div>
                  )
                },
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
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
  const [draft, setDraft] = useState<Record<number, string>>({})

  async function load() {
    const p = await fetchAdminProducts({
      page: 1,
      search: search.trim() || undefined,
      is_active: 'all',
      ordering: 'stock_quantity',
    })
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

  const lowStockCount = useMemo(() => items.filter((p) => Number(p.stock_quantity ?? 0) <= 3).length, [items])

  async function saveStock(productId: number) {
    const raw = draft[productId]
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0) {
      setError('Stock invalide.')
      return
    }

    try {
      setBusyId(productId)
      setError(null)
      setSuccess(null)
      await updateProduct(productId, { stock_quantity: value })
      setItems((prev) => prev.map((x) => (x.id === productId ? { ...x, stock_quantity: value } : x)))
      setSuccess(`Stock mis à jour pour #${productId}.`)
    } catch (err) {
      const detail =
        isAxiosError(err) && err.response ? (err.response.data as { detail?: string }).detail : null
      setError(detail || 'Impossible de mettre à jour le stock.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Stock</div>
            <div className="admin-muted">
              Trié par stock (les plus faibles en premier). {lowStockCount ? `⚠ ${lowStockCount} produit(s) ≤ 3.` : ''}
            </div>
          </div>
          <div className="admin-cardActions">
            <div style={{ minWidth: 320 }}>
              <InputField
                label="Recherche"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, SKU…"
              />
            </div>
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
              { key: 'stock', title: 'Stock', render: (p) => <span className={Number(p.stock_quantity ?? 0) <= 3 ? 'admin-stockLow' : ''}>{p.stock_quantity ?? 0}</span> },
              {
                key: 'update',
                title: 'Mise à jour',
                render: (p) => {
                  const current = String(p.stock_quantity ?? 0)
                  const value = draft[p.id] ?? current
                  return (
                    <div className="admin-inline">
                      <input
                        className="admin-inlineInput"
                        type="number"
                        value={value}
                        disabled={busyId === p.id}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => void saveStock(p.id)}
                      >
                        Enregistrer
                      </button>
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


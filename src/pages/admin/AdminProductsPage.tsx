import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import { InputField } from '../../components/InputField'
import type { AdminCarModel, AdminProduct, AdminProductUpsert } from '../../admin/adminApi'
import {
  createProduct,
  deleteProduct,
  fetchAdminCarModels,
  fetchAdminProductDetail,
  fetchAdminProducts,
  updateProduct,
} from '../../admin/adminApi'
import { fetchBrands, fetchCategories, type Brand, type Category } from '../../lib/catalogApi'

function toBool(v: unknown) {
  return Boolean(v)
}

function modelLabel(m: AdminCarModel) {
  const brand = m.brand_detail?.name ? m.brand_detail.name : `#${m.brand}`
  const years = `${m.year_start}${m.year_end ? `–${m.year_end}` : ''}`
  return `${brand} • ${m.name} (${years})`
}

export function AdminProductsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [next, setNext] = useState<string | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)
  const [items, setItems] = useState<AdminProduct[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [carModels, setCarModels] = useState<AdminCarModel[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminProduct | null>(null)

  const [form, setForm] = useState<AdminProductUpsert>({
    name: '',
    sku: '',
    description: '',
    price: '0.00',
    cost: null,
    stock_quantity: 0,
    low_stock_alert: 10,
    weight: null,
    dimensions: '',
    warranty_months: 12,
    category: null,
    brand: null,
    compatible_car_models_ids: [],
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()])
        if (!mounted) return
        setCategories(cats)
        setBrands(brs)
      } catch {
        // ignore (product list still works)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const models = await fetchAdminCarModels()
        if (!mounted) return
        setCarModels(models)
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function load() {
    const res = await fetchAdminProducts({ page, search: search.trim() || undefined, is_active: 'all' })
    setItems(res.items)
    setNext(res.next)
    setPrevious(res.previous)
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
        setError('Impossible de charger les produits.')
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

  const canPrev = Boolean(previous) && page > 1
  const canNext = Boolean(next)

  const modalTitle = useMemo(() => (editing ? `Modifier #${editing.id}` : 'Nouveau produit'), [editing])

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories],
  )
  const brandOptions = useMemo(() => brands.map((b) => ({ id: b.id, name: b.name })), [brands])

  function openCreate() {
    setEditing(null)
    setForm({
      name: '',
      sku: '',
      description: '',
      price: '0.00',
      cost: null,
      stock_quantity: 0,
      low_stock_alert: 10,
      weight: null,
      dimensions: '',
      warranty_months: 12,
      category: null,
      brand: null,
      compatible_car_models_ids: [],
      is_active: true,
      is_featured: false,
    })
    setModalOpen(true)
  }

  async function openEdit(p: AdminProduct) {
    setEditing(p)
    setModalOpen(true)
    setDetailLoading(true)
    try {
      const detail = await fetchAdminProductDetail(p.id)
      const ids =
        detail.compatible_car_models_ids ??
        (detail.compatible_car_models ? detail.compatible_car_models.map((m) => m.id) : [])

      setForm({
        name: detail.name ?? '',
        sku: detail.sku ?? '',
        description: String(detail.description ?? ''),
        price: String(detail.price ?? '0.00'),
        cost: detail.cost ?? null,
        stock_quantity: Number(detail.stock_quantity ?? 0),
        low_stock_alert: Number(detail.low_stock_alert ?? 10),
        weight: detail.weight ?? null,
        dimensions: String(detail.dimensions ?? ''),
        warranty_months: Number(detail.warranty_months ?? 12),
        category: detail.category ?? null,
        brand: detail.brand ?? null,
        compatible_car_models_ids: ids ?? [],
        is_active: toBool(detail.is_active ?? true),
        is_featured: toBool(detail.is_featured ?? false),
      })
    } catch {
      setError('Impossible de charger les détails du produit.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function submit() {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      const payload: AdminProductUpsert = {
        ...form,
        name: form.name.trim(),
        sku: form.sku?.trim() || undefined,
        description: String(form.description ?? '').trim() || undefined,
        price: String(form.price ?? '0.00'),
        cost: form.cost != null && String(form.cost).trim() ? String(form.cost).trim() : null,
        weight: form.weight != null && String(form.weight).trim() ? String(form.weight).trim() : null,
        dimensions: String(form.dimensions ?? '').trim(),
        stock_quantity: Number(form.stock_quantity ?? 0),
        low_stock_alert: Number(form.low_stock_alert ?? 10),
        warranty_months: Number(form.warranty_months ?? 12),
        category: form.category ?? null,
        brand: form.brand ?? null,
        compatible_car_models_ids: form.compatible_car_models_ids ?? [],
        is_active: Boolean(form.is_active),
        is_featured: Boolean(form.is_featured),
      }

      if (editing) {
        await updateProduct(editing.id, payload)
        setSuccess('Produit mis à jour.')
      } else {
        await createProduct(payload)
        setSuccess('Produit créé.')
      }

      setModalOpen(false)
      setEditing(null)
      await load()
    } catch (e) {
      const detail =
        isAxiosError(e) && e.response
          ? (e.response.data as { detail?: string; sku?: string[]; name?: string[] }).detail ??
            (e.response.data as { sku?: string[] }).sku?.[0] ??
            (e.response.data as { name?: string[] }).name?.[0]
          : null
      setError(detail || 'Impossible de sauvegarder le produit.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setError(null)
      setSuccess(null)
      await deleteProduct(deleting.id)
      setSuccess('Produit supprimé.')
      setConfirmOpen(false)
      setDeleting(null)
      await load()
    } catch {
      setError('Impossible de supprimer le produit.')
    }
  }

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Produits</div>
            <div className="admin-muted">Produit, compatibilité véhicule, prix, stock et options.</div>
          </div>
          <div className="admin-cardActions">
            <input
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche: nom, SKU…"
              aria-label="Recherche produits"
            />
            <button
              className="btn"
              type="button"
              onClick={() => {
                setPage(1)
                void load()
              }}
            >
              Rechercher
            </button>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Ajouter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <>
            <DataTable
              rows={items}
              columns={[
                { key: 'id', title: 'ID', render: (r) => `#${r.id}` },
                { key: 'name', title: 'Nom', render: (r) => r.name },
                { key: 'sku', title: 'SKU', render: (r) => r.sku ?? '—' },
                { key: 'price', title: 'Prix', render: (r) => r.price },
                { key: 'stock', title: 'Stock', render: (r) => r.stock_quantity ?? 0 },
                { key: 'active', title: 'Actif', render: (r) => (r.is_active ? 'Oui' : 'Non') },
                {
                  key: 'actions',
                  title: 'Actions',
                  render: (r) => (
                    <div className="admin-actions">
                      <button className="btn" type="button" onClick={() => void openEdit(r)}>
                        Modifier
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => {
                          setDeleting(r)
                          setConfirmOpen(true)
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  ),
                },
              ]}
            />

            <div className="admin-pager">
              <button className="btn" type="button" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Précédent
              </button>
              <div className="admin-muted">Page {page}</div>
              <button className="btn" type="button" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>
                Suivant
              </button>
            </div>
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={modalTitle}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      >
        {detailLoading ? (
          <div className="skeleton-detail" />
        ) : (
          <div className="admin-form">
            <InputField
              label="Nom"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />

            <div className="field">
              <label className="field-label" htmlFor="field_description">
                Description
              </label>
              <textarea
                id="field_description"
                className="field-input"
                rows={4}
                value={String(form.description ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <InputField
                label="SKU"
                name="sku"
                value={form.sku ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
              <InputField
                label="Prix"
                name="price"
                value={String(form.price ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <InputField
                label="Coût (optionnel)"
                name="cost"
                value={String(form.cost ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              />
              <InputField
                label="Poids (kg, optionnel)"
                name="weight"
                value={String(form.weight ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              />
            </div>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <InputField
                label="Stock"
                name="stock_quantity"
                type="number"
                value={String(form.stock_quantity ?? 0)}
                onChange={(e) => setForm((f) => ({ ...f, stock_quantity: Number(e.target.value) }))}
              />
              <InputField
                label="Alerte stock bas"
                name="low_stock_alert"
                type="number"
                value={String(form.low_stock_alert ?? 10)}
                onChange={(e) => setForm((f) => ({ ...f, low_stock_alert: Number(e.target.value) }))}
              />
            </div>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <InputField
                label="Dimensions"
                name="dimensions"
                value={String(form.dimensions ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))}
                placeholder="L x l x H"
              />
              <InputField
                label="Garantie (mois)"
                name="warranty_months"
                type="number"
                value={String(form.warranty_months ?? 12)}
                onChange={(e) => setForm((f) => ({ ...f, warranty_months: Number(e.target.value) }))}
              />
            </div>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <label className="field-label" htmlFor="field_category">
                  Catégorie
                </label>
                <select
                  id="field_category"
                  className="field-input"
                  value={form.category ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value ? Number(e.target.value) : null }))}
                >
                  <option value="">—</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="field_brand">
                  Marque
                </label>
                <select
                  id="field_brand"
                  className="field-input"
                  value={form.brand ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value ? Number(e.target.value) : null }))}
                >
                  <option value="">—</option>
                  {brandOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="field_compat">
                Compatibilité véhicules
              </label>
              <select
                id="field_compat"
                className="field-input"
                multiple
                size={6}
                value={(form.compatible_car_models_ids ?? []).map(String)}
                onChange={(e) => {
                  const ids = Array.from(e.target.selectedOptions).map((o) => Number(o.value))
                  setForm((f) => ({ ...f, compatible_car_models_ids: ids }))
                }}
              >
                {carModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {modelLabel(m)}
                  </option>
                ))}
              </select>
              <div className="admin-muted" style={{ marginTop: 8 }}>
                Astuce: Ctrl/Cmd pour multi-sélection.
              </div>
            </div>

            <div className="field">
              <label className="field-label">Options</label>
              <div className="admin-flags">
                <label className="admin-flag">
                  <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                  Actif
                </label>
                <label className="admin-flag">
                  <input type="checkbox" checked={Boolean(form.is_featured)} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
                  En vedette
                </label>
              </div>
            </div>

            <div className="actions">
              <button className="btn btn-primary" type="button" disabled={submitting} onClick={submit}>
                {submitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer le produit"
        message={deleting ? `Confirmer la suppression de “${deleting.name}” ?` : 'Confirmer ?'}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleting(null)
        }}
      />
    </div>
  )
}


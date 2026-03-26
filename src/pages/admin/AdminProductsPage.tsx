import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import type { AdminProduct, AdminProductUpsert } from '../../admin/adminApi'
import { createProduct, deleteProduct, fetchAdminProducts, updateProduct } from '../../admin/adminApi'
import { fetchBrands, fetchCategories, type Brand, type Category } from '../../lib/catalogApi'

function toBool(v: unknown) {
  return Boolean(v)
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

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminProduct | null>(null)

  const [form, setForm] = useState<AdminProductUpsert>({
    name: '',
    sku: '',
    price: '0.00',
    stock_quantity: 0,
    category: null,
    brand: null,
    is_active: true,
    is_featured: false,
    description: '',
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

  const modalTitle = editing ? `Modifier #${editing.id}` : 'Nouveau produit'

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
      price: '0.00',
      stock_quantity: 0,
      category: null,
      brand: null,
      is_active: true,
      is_featured: false,
      description: '',
    })
    setModalOpen(true)
  }

  function openEdit(p: AdminProduct) {
    setEditing(p)
    setForm({
      name: p.name ?? '',
      sku: p.sku ?? '',
      price: p.price ?? '0.00',
      stock_quantity: p.stock_quantity ?? 0,
      category: p.category ?? null,
      brand: p.brand ?? null,
      is_active: toBool(p.is_active ?? true),
      is_featured: toBool(p.is_featured ?? false),
      description: '',
    })
    setModalOpen(true)
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
        price: String(form.price ?? '0.00'),
        stock_quantity: Number(form.stock_quantity ?? 0),
        category: form.category ?? null,
        brand: form.brand ?? null,
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
        <div className="admin-card-title">Produits</div>
        <div className="admin-toolbar">
          <InputField
            label="Recherche"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, SKU…"
          />
          <div className="actions" style={{ marginTop: 10 }}>
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
                      <button className="btn" type="button" onClick={() => openEdit(r)}>
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

            <div className="actions">
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
        <div className="admin-form">
          <InputField label="Nom" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="admin-grid">
            <InputField label="SKU" name="sku" value={form.sku ?? ''} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
            <InputField label="Prix" name="price" value={String(form.price ?? '')} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div className="admin-grid">
            <InputField
              label="Stock"
              name="stock_quantity"
              type="number"
              value={String(form.stock_quantity ?? 0)}
              onChange={(e) => setForm((f) => ({ ...f, stock_quantity: Number(e.target.value) }))}
            />
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
          </div>
          <div className="admin-grid">
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
            <div className="field">
              <label className="field-label">Flags</label>
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
          </div>

          <div className="actions">
            <button className="btn btn-primary" type="button" disabled={submitting} onClick={submit}>
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
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


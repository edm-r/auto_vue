import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import type { AdminProductVariant } from '../../admin/adminApi'
import {
  createAdminProductVariant,
  deleteAdminProductVariant,
  fetchAdminProductVariants,
  updateAdminProductVariant,
} from '../../admin/adminApi'

const ATTRS: Array<{ value: string; label: string }> = [
  { value: 'color', label: 'Couleur' },
  { value: 'size', label: 'Taille' },
  { value: 'version', label: 'Version' },
  { value: 'material', label: 'Matière' },
  { value: 'fit', label: 'Ajustement' },
  { value: 'strength', label: 'Puissance' },
  { value: 'other', label: 'Autre' },
]

export function AdminProductVariantsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<AdminProductVariant[]>([])

  const [productId, setProductId] = useState('')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProductVariant | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminProductVariant | null>(null)

  const [formProduct, setFormProduct] = useState('')
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [attrName, setAttrName] = useState('other')
  const [attrValue, setAttrValue] = useState('')
  const [priceMod, setPriceMod] = useState('0')
  const [stockQty, setStockQty] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const productIdNum = useMemo(() => {
    const v = productId.trim()
    if (!v) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }, [productId])

  async function load() {
    const data = await fetchAdminProductVariants({
      product_id: productIdNum,
      search: search.trim() || undefined,
      is_active: 'all',
    })
    setItems(data)
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
        setError('Impossible de charger les variantes.')
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

  function openCreate() {
    setEditing(null)
    setFormProduct(productId.trim())
    setName('')
    setSku('')
    setAttrName('other')
    setAttrValue('')
    setPriceMod('0')
    setStockQty('0')
    setIsActive(true)
    setModalOpen(true)
  }

  function openEdit(v: AdminProductVariant) {
    setEditing(v)
    setFormProduct(String(v.product))
    setName(v.name ?? '')
    setSku(v.sku ?? '')
    setAttrName(v.attribute_name ?? 'other')
    setAttrValue(v.attribute_value ?? '')
    setPriceMod(String(v.price_modifier ?? '0'))
    setStockQty(String(v.stock_quantity ?? 0))
    setIsActive(Boolean(v.is_active ?? true))
    setModalOpen(true)
  }

  async function submit() {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      const pid = Number(formProduct)
      if (!Number.isFinite(pid)) {
        setError('product id invalide.')
        return
      }
      if (!name.trim() || !sku.trim() || !attrValue.trim()) {
        setError('Nom, SKU et valeur attribut sont requis.')
        return
      }

      if (editing) {
        const updated = await updateAdminProductVariant(editing.id, {
          name: name.trim(),
          sku: sku.trim(),
          attribute_name: attrName,
          attribute_value: attrValue.trim(),
          price_modifier: String(priceMod || '0'),
          stock_quantity: Number(stockQty || 0),
          is_active: Boolean(isActive),
        })
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        setSuccess('Variante mise à jour.')
      } else {
        const created = await createAdminProductVariant({
          product: pid,
          name: name.trim(),
          sku: sku.trim(),
          attribute_name: attrName,
          attribute_value: attrValue.trim(),
          price_modifier: String(priceMod || '0'),
          stock_quantity: Number(stockQty || 0),
          is_active: Boolean(isActive),
        })
        setItems((prev) => [created, ...prev])
        setSuccess('Variante créée.')
      }

      setModalOpen(false)
      setEditing(null)
    } catch (e) {
      const detail =
        isAxiosError(e) && e.response ? (e.response.data as { detail?: string }).detail : null
      setError(detail || 'Impossible de sauvegarder la variante.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setError(null)
      setSuccess(null)
      await deleteAdminProductVariant(deleting.id)
      setItems((prev) => prev.filter((x) => x.id !== deleting.id))
      setSuccess('Variante supprimée.')
      setConfirmOpen(false)
      setDeleting(null)
    } catch {
      setError('Impossible de supprimer la variante.')
    }
  }

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Product Variants</div>
            <div className="admin-muted">Variantes par produit (SKU, attributs, stock).</div>
          </div>
          <div className="admin-cardActions">
            <input
              className="admin-search"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Filtre: product_id (optionnel)"
              aria-label="Filtre product_id"
            />
            <input
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche (name, sku…)"
              aria-label="Recherche variantes"
            />
            <button className="btn" type="button" onClick={() => void load()}>
              Charger
            </button>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Ajouter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <DataTable
            rows={items}
            columns={[
              { key: 'id', title: 'ID', render: (v) => `#${v.id}` },
              { key: 'product', title: 'Product', render: (v) => `#${v.product}` },
              { key: 'name', title: 'Nom', render: (v) => v.name },
              { key: 'sku', title: 'SKU', render: (v) => v.sku },
              { key: 'attr', title: 'Attribut', render: (v) => `${v.attribute_name}:${v.attribute_value}` },
              { key: 'stock', title: 'Stock', render: (v) => v.stock_quantity },
              { key: 'active', title: 'Actif', render: (v) => (v.is_active ? 'Oui' : 'Non') },
              {
                key: 'actions',
                title: 'Actions',
                render: (v) => (
                  <div className="admin-actions">
                    <button className="btn" type="button" onClick={() => openEdit(v)}>
                      Modifier
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setDeleting(v)
                        setConfirmOpen(true)
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            empty="Aucune variante."
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? `Modifier #${editing.id}` : 'Nouvelle variante'}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      >
        <div className="admin-form">
          <InputField label="Product ID" name="product" value={formProduct} onChange={(e) => setFormProduct(e.target.value)} />

          <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <InputField label="Nom" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <InputField label="SKU" name="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label className="field-label" htmlFor="field_attr_name">
                Attribut
              </label>
              <select id="field_attr_name" className="field-input" value={attrName} onChange={(e) => setAttrName(e.target.value)}>
                {ATTRS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <InputField label="Valeur" name="attribute_value" value={attrValue} onChange={(e) => setAttrValue(e.target.value)} />
          </div>

          <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <InputField label="Price modifier" name="price_modifier" value={priceMod} onChange={(e) => setPriceMod(e.target.value)} />
            <InputField label="Stock" name="stock_quantity" value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
          </div>

          <div className="field">
            <label className="admin-flag">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Actif
            </label>
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
        title="Supprimer la variante"
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


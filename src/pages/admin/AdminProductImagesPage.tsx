import { useEffect, useMemo, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import type { AdminProductImage } from '../../admin/adminApi'
import {
  createAdminProductImage,
  deleteAdminProductImage,
  fetchAdminProductImages,
  updateAdminProductImage,
} from '../../admin/adminApi'

export function AdminProductImagesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<AdminProductImage[]>([])

  const [productId, setProductId] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminProductImage | null>(null)

  const [formProduct, setFormProduct] = useState('')
  const [altText, setAltText] = useState('')
  const [isPrimary, setIsPrimary] = useState(true)
  const [displayOrder, setDisplayOrder] = useState('0')
  const [image, setImage] = useState<File | null>(null)

  const productIdNum = useMemo(() => {
    const v = productId.trim()
    if (!v) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }, [productId])

  async function load() {
    const data = await fetchAdminProductImages({ product_id: productIdNum })
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
        setError('Impossible de charger les images.')
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
    setFormProduct(productId.trim())
    setAltText('')
    setIsPrimary(true)
    setDisplayOrder('0')
    setImage(null)
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
      if (!image) {
        setError('Image requise.')
        return
      }

      const created = await createAdminProductImage({
        product: pid,
        image,
        alt_text: altText.trim(),
        is_primary: Boolean(isPrimary),
        display_order: Number(displayOrder || 0),
      })
      setItems((prev) => [created, ...prev])
      setSuccess('Image ajoutée.')
      setModalOpen(false)
    } catch {
      setError("Impossible d'ajouter l'image.")
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setError(null)
      setSuccess(null)
      await deleteAdminProductImage(deleting.id)
      setItems((prev) => prev.filter((x) => x.id !== deleting.id))
      setSuccess('Image supprimée.')
      setConfirmOpen(false)
      setDeleting(null)
    } catch {
      setError("Impossible de supprimer l'image.")
    }
  }

  async function setPrimary(img: AdminProductImage) {
    try {
      setError(null)
      setSuccess(null)
      const updated = await updateAdminProductImage(img.id, { is_primary: true })
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      setSuccess('Image primaire mise à jour.')
    } catch {
      setError("Impossible de mettre l'image en primaire.")
    }
  }

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Product Images</div>
            <div className="admin-muted">Filtrer par produit, ajouter et définir l’image primaire.</div>
          </div>
          <div className="admin-cardActions">
            <input
              className="admin-search"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Filtre: product_id (optionnel)"
              aria-label="Filtre product_id"
            />
            <button
              className="btn"
              type="button"
              onClick={() => {
                void load()
              }}
            >
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
              { key: 'id', title: 'ID', render: (i) => `#${i.id}` },
              { key: 'product', title: 'Product', render: (i) => `#${i.product}` },
              { key: 'primary', title: 'Primary', render: (i) => (i.is_primary ? 'Oui' : 'Non') },
              { key: 'order', title: 'Order', render: (i) => i.display_order ?? 0 },
              { key: 'alt', title: 'Alt', render: (i) => i.alt_text ?? '—' },
              {
                key: 'actions',
                title: 'Actions',
                render: (i) => (
                  <div className="admin-actions">
                    {!i.is_primary ? (
                      <button className="btn" type="button" onClick={() => void setPrimary(i)}>
                        Mettre primaire
                      </button>
                    ) : null}
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setDeleting(i)
                        setConfirmOpen(true)
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            empty="Aucune image."
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        title="Ajouter une image"
        onClose={() => {
          setModalOpen(false)
        }}
      >
        <div className="admin-form">
          <InputField
            label="Product ID"
            name="product"
            value={formProduct}
            onChange={(e) => setFormProduct(e.target.value)}
            placeholder="ex: 12"
          />
          <InputField label="Alt text" name="alt_text" value={altText} onChange={(e) => setAltText(e.target.value)} />
          <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <InputField
              label="Display order"
              name="display_order"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
            <div className="field">
              <label className="field-label">Options</label>
              <label className="admin-flag">
                <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
                Primary
              </label>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="field_image">
              Image
            </label>
            <input
              id="field_image"
              className="field-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
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
        title="Supprimer l'image"
        message={deleting ? `Confirmer la suppression de l'image #${deleting.id} ?` : 'Confirmer ?'}
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


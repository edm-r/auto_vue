import { useEffect, useMemo, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import type { AdminCategory } from '../../admin/adminApi'
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from '../../admin/adminApi'

export function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<AdminCategory[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState<File | null>(null)

  async function load() {
    const data = await fetchAdminCategories()
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
        setError('Impossible de charger les catégories.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const modalTitle = useMemo(() => (editing ? `Modifier #${editing.id}` : 'Nouvelle catégorie'), [editing])

  function openCreate() {
    setEditing(null)
    setName('')
    setDescription('')
    setIsActive(true)
    setImage(null)
    setModalOpen(true)
  }

  function openEdit(c: AdminCategory) {
    setEditing(c)
    setName(c.name ?? '')
    setDescription(String(c.description ?? ''))
    setIsActive(Boolean(c.is_active ?? true))
    setImage(null)
    setModalOpen(true)
  }

  async function submit() {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      if (!name.trim()) {
        setError('Le nom est requis.')
        return
      }

      if (editing) {
        const updated = await updateAdminCategory(editing.id, {
          name: name.trim(),
          description: description.trim(),
          is_active: Boolean(isActive),
          image,
        })
        setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
        setSuccess('Catégorie mise à jour.')
      } else {
        const created = await createAdminCategory({
          name: name.trim(),
          description: description.trim(),
          is_active: Boolean(isActive),
          image,
        })
        setItems((prev) => [created, ...prev])
        setSuccess('Catégorie créée.')
      }

      setModalOpen(false)
      setEditing(null)
    } catch {
      setError('Impossible de sauvegarder la catégorie.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setError(null)
      setSuccess(null)
      await deleteAdminCategory(deleting.id)
      setItems((prev) => prev.filter((x) => x.id !== deleting.id))
      setSuccess('Catégorie supprimée.')
      setConfirmOpen(false)
      setDeleting(null)
    } catch {
      setError('Impossible de supprimer la catégorie.')
    }
  }

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Categories</div>
            <div className="admin-muted">Créer et organiser les catégories.</div>
          </div>
          <div className="admin-cardActions">
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
              { key: 'id', title: 'ID', render: (c) => `#${c.id}` },
              { key: 'name', title: 'Nom', render: (c) => c.name },
              { key: 'slug', title: 'Slug', render: (c) => c.slug ?? '—' },
              { key: 'count', title: 'Produits', render: (c) => c.product_count ?? '—' },
              { key: 'active', title: 'Active', render: (c) => (c.is_active ? 'Oui' : 'Non') },
              {
                key: 'actions',
                title: 'Actions',
                render: (c) => (
                  <div className="admin-actions">
                    <button className="btn" type="button" onClick={() => openEdit(c)}>
                      Modifier
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setDeleting(c)
                        setConfirmOpen(true)
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            empty="Aucune catégorie."
          />
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
          <InputField label="Nom" name="name" value={name} onChange={(e) => setName(e.target.value)} />

          <div className="field">
            <label className="field-label" htmlFor="field_description">
              Description
            </label>
            <textarea
              id="field_description"
              className="field-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="field_image">
              Image (optionnel)
            </label>
            <input
              id="field_image"
              className="field-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="field">
            <label className="admin-flag">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
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
        title="Supprimer la catégorie"
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


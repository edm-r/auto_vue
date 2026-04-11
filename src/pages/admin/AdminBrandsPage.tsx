import { useEffect, useMemo, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import type { AdminBrand } from '../../admin/adminApi'
import {
  createAdminBrand,
  deleteAdminBrand,
  fetchAdminBrands,
  updateAdminBrand,
} from '../../admin/adminApi'

export function AdminBrandsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<AdminBrand[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminBrand | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminBrand | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [country, setCountry] = useState('')
  const [website, setWebsite] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [logo, setLogo] = useState<File | null>(null)

  async function load() {
    const data = await fetchAdminBrands()
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
        setError('Impossible de charger les marques.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const modalTitle = useMemo(() => (editing ? `Modifier #${editing.id}` : 'Nouvelle marque'), [editing])

  function openCreate() {
    setEditing(null)
    setName('')
    setDescription('')
    setCountry('')
    setWebsite('')
    setIsActive(true)
    setLogo(null)
    setModalOpen(true)
  }

  function openEdit(b: AdminBrand) {
    setEditing(b)
    setName(b.name ?? '')
    setDescription(String(b.description ?? ''))
    setCountry(String(b.country ?? ''))
    setWebsite(String(b.website ?? ''))
    setIsActive(Boolean(b.is_active ?? true))
    setLogo(null)
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
        const updated = await updateAdminBrand(editing.id, {
          name: name.trim(),
          description: description.trim(),
          country: country.trim(),
          website: website.trim(),
          is_active: Boolean(isActive),
          logo,
        })
        setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
        setSuccess('Marque mise à jour.')
      } else {
        const created = await createAdminBrand({
          name: name.trim(),
          description: description.trim(),
          country: country.trim(),
          website: website.trim(),
          is_active: Boolean(isActive),
          logo,
        })
        setItems((prev) => [created, ...prev])
        setSuccess('Marque créée.')
      }

      setModalOpen(false)
      setEditing(null)
    } catch {
      setError('Impossible de sauvegarder la marque.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setError(null)
      setSuccess(null)
      await deleteAdminBrand(deleting.id)
      setItems((prev) => prev.filter((x) => x.id !== deleting.id))
      setSuccess('Marque supprimée.')
      setConfirmOpen(false)
      setDeleting(null)
    } catch {
      setError('Impossible de supprimer la marque.')
    }
  }

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Brands</div>
            <div className="admin-muted">Marques, pays, site web et activation.</div>
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
              { key: 'id', title: 'ID', render: (b) => `#${b.id}` },
              { key: 'name', title: 'Nom', render: (b) => b.name },
              { key: 'country', title: 'Pays', render: (b) => b.country || '—' },
              { key: 'website', title: 'Site', render: (b) => b.website || '—' },
              { key: 'active', title: 'Active', render: (b) => (b.is_active ? 'Oui' : 'Non') },
              {
                key: 'actions',
                title: 'Actions',
                render: (b) => (
                  <div className="admin-actions">
                    <button className="btn" type="button" onClick={() => openEdit(b)}>
                      Modifier
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setDeleting(b)
                        setConfirmOpen(true)
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            empty="Aucune marque."
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

          <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <InputField label="Pays" name="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <InputField label="Site web" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
          </div>

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
            <label className="field-label" htmlFor="field_logo">
              Logo (optionnel)
            </label>
            <input
              id="field_logo"
              className="field-input"
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
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
        title="Supprimer la marque"
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


import { useEffect, useMemo, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import type { AdminBrand, AdminCarModel } from '../../admin/adminApi'
import {
  createAdminCarModel,
  deleteAdminCarModel,
  fetchAdminBrands,
  fetchAdminCarModels,
  updateAdminCarModel,
} from '../../admin/adminApi'

const BODY_TYPES: Array<{ value: string; label: string }> = [
  { value: 'sedan', label: 'Berline' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Monospace' },
  { value: 'station_wagon', label: 'Break' },
  { value: 'van', label: 'Fourgonnette' },
  { value: 'truck', label: 'Camion' },
  { value: 'other', label: 'Autre' },
]

function bodyLabel(value?: string) {
  return BODY_TYPES.find((b) => b.value === value)?.label ?? (value || '—')
}

export function AdminCarModelsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<AdminCarModel[]>([])
  const [brands, setBrands] = useState<AdminBrand[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCarModel | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminCarModel | null>(null)

  const [brand, setBrand] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [yearStart, setYearStart] = useState('2020')
  const [yearEnd, setYearEnd] = useState('')
  const [bodyType, setBodyType] = useState('sedan')
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState<File | null>(null)

  async function load() {
    const [brandList, models] = await Promise.all([fetchAdminBrands(), fetchAdminCarModels()])
    setBrands(brandList)
    setItems(models)
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
        setError('Impossible de charger les modèles de véhicules.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const modalTitle = useMemo(() => (editing ? `Modifier #${editing.id}` : 'Nouveau modèle'), [editing])

  function openCreate() {
    setEditing(null)
    setBrand(brands[0]?.id ?? null)
    setName('')
    setYearStart('2020')
    setYearEnd('')
    setBodyType('sedan')
    setIsActive(true)
    setImage(null)
    setModalOpen(true)
  }

  function openEdit(m: AdminCarModel) {
    setEditing(m)
    setBrand(m.brand ?? null)
    setName(m.name ?? '')
    setYearStart(String(m.year_start ?? ''))
    setYearEnd(m.year_end != null ? String(m.year_end) : '')
    setBodyType(m.body_type ?? 'sedan')
    setIsActive(Boolean(m.is_active ?? true))
    setImage(null)
    setModalOpen(true)
  }

  async function submit() {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      if (!brand) {
        setError('La marque est requise.')
        return
      }
      if (!name.trim()) {
        setError('Le nom est requis.')
        return
      }
      const ys = Number(yearStart)
      const ye = yearEnd.trim() ? Number(yearEnd) : null
      if (!Number.isFinite(ys)) {
        setError("Année de début invalide.")
        return
      }

      if (editing) {
        const updated = await updateAdminCarModel(editing.id, {
          brand,
          name: name.trim(),
          year_start: ys,
          year_end: ye,
          body_type: bodyType,
          is_active: Boolean(isActive),
          image,
        })
        setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
        setSuccess('Modèle mis à jour.')
      } else {
        const created = await createAdminCarModel({
          brand,
          name: name.trim(),
          year_start: ys,
          year_end: ye,
          body_type: bodyType,
          is_active: Boolean(isActive),
          image,
        })
        setItems((prev) => [created, ...prev])
        setSuccess('Modèle créé.')
      }

      setModalOpen(false)
      setEditing(null)
    } catch {
      setError('Impossible de sauvegarder le modèle.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setError(null)
      setSuccess(null)
      await deleteAdminCarModel(deleting.id)
      setItems((prev) => prev.filter((x) => x.id !== deleting.id))
      setSuccess('Modèle supprimé.')
      setConfirmOpen(false)
      setDeleting(null)
    } catch {
      setError('Impossible de supprimer le modèle.')
    }
  }

  const brandNameById = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-cardHead">
          <div>
            <div className="admin-card-title">Car Models</div>
            <div className="admin-muted">Marque, années, carrosserie et activation.</div>
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
              { key: 'id', title: 'ID', render: (m) => `#${m.id}` },
              { key: 'brand', title: 'Marque', render: (m) => brandNameById.get(m.brand) ?? `#${m.brand}` },
              { key: 'name', title: 'Modèle', render: (m) => m.name },
              { key: 'years', title: 'Années', render: (m) => `${m.year_start}${m.year_end ? `–${m.year_end}` : ''}` },
              { key: 'body', title: 'Type', render: (m) => bodyLabel(m.body_type) },
              { key: 'active', title: 'Actif', render: (m) => (m.is_active ? 'Oui' : 'Non') },
              {
                key: 'actions',
                title: 'Actions',
                render: (m) => (
                  <div className="admin-actions">
                    <button className="btn" type="button" onClick={() => openEdit(m)}>
                      Modifier
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setDeleting(m)
                        setConfirmOpen(true)
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            empty="Aucun modèle."
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
          <div className="field">
            <label className="field-label" htmlFor="field_brand">
              Marque
            </label>
            <select
              id="field_brand"
              className="field-input"
              value={brand ?? ''}
              onChange={(e) => setBrand(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">—</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <InputField label="Nom du modèle" name="name" value={name} onChange={(e) => setName(e.target.value)} />

          <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <InputField label="Année début" name="year_start" value={yearStart} onChange={(e) => setYearStart(e.target.value)} />
            <InputField label="Année fin (optionnel)" name="year_end" value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="field_body_type">
              Type carrosserie
            </label>
            <select id="field_body_type" className="field-input" value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
              {BODY_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
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
        title="Supprimer le modèle"
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


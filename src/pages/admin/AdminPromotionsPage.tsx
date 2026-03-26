import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import { ConfirmDialog } from '../../admin/components/ConfirmDialog'
import { DataTable } from '../../admin/components/DataTable'
import { Modal } from '../../admin/components/Modal'
import type { PromoCode, PromoCodeUpsert } from '../../admin/adminApi'
import { createPromotion, deletePromotion, fetchPromotions, updatePromotion } from '../../admin/adminApi'

function toLocalDatetimeValue(value: string | null) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function fromLocalDatetimeValue(value: string): string | null {
  if (!value.trim()) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function AdminPromotionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<PromoCode[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PromoCode | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<PromoCode | null>(null)

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('10')
  const [expiresAt, setExpiresAt] = useState('')
  const [isActive, setIsActive] = useState(true)

  async function load() {
    const data = await fetchPromotions()
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
        setError('Impossible de charger les promotions.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const modalTitle = useMemo(() => (editing ? `Modifier ${editing.code}` : 'Nouveau code promo'), [editing])

  function openCreate() {
    setEditing(null)
    setCode('')
    setDiscountType('percent')
    setValue('10')
    setExpiresAt('')
    setIsActive(true)
    setModalOpen(true)
  }

  function openEdit(p: PromoCode) {
    setEditing(p)
    setCode(p.code)
    setDiscountType(p.discount_type)
    setValue(String(p.value))
    setExpiresAt(toLocalDatetimeValue(p.expires_at))
    setIsActive(Boolean(p.is_active))
    setModalOpen(true)
  }

  async function submit() {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      const payload = {
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        value: String(value).trim(),
        expires_at: fromLocalDatetimeValue(expiresAt),
        is_active: Boolean(isActive),
      } satisfies PromoCodeUpsert

      if (editing) {
        const updated = await updatePromotion(editing.id, payload)
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        setSuccess('Code promo mis à jour.')
      } else {
        const created = await createPromotion(payload)
        setItems((prev) => [created, ...prev])
        setSuccess('Code promo créé.')
      }

      setModalOpen(false)
      setEditing(null)
    } catch (e) {
      const detail =
        isAxiosError(e) && e.response
          ? (e.response.data as { detail?: string; code?: string[] }).detail ?? (e.response.data as { code?: string[] }).code?.[0]
          : null
      setError(detail || 'Impossible de sauvegarder le code promo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setError(null)
      setSuccess(null)
      await deletePromotion(deleting.id)
      setItems((prev) => prev.filter((x) => x.id !== deleting.id))
      setSuccess('Code promo supprimé.')
      setConfirmOpen(false)
      setDeleting(null)
    } catch {
      setError('Impossible de supprimer le code promo.')
    }
  }

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="admin-card">
        <div className="admin-card-title">Promotions</div>
        <div className="actions" style={{ marginTop: 10 }}>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Créer un code
          </button>
        </div>

        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <DataTable
            rows={items}
            columns={[
              { key: 'code', title: 'Code', render: (p) => p.code },
              { key: 'type', title: 'Type', render: (p) => p.discount_type },
              { key: 'value', title: 'Valeur', render: (p) => p.value },
              { key: 'exp', title: 'Expiration', render: (p) => (p.expires_at ? new Date(p.expires_at).toLocaleString() : '—') },
              { key: 'active', title: 'Actif', render: (p) => (p.is_active ? 'Oui' : 'Non') },
              {
                key: 'actions',
                title: 'Actions',
                render: (p) => (
                  <div className="admin-actions">
                    <button className="btn" type="button" onClick={() => openEdit(p)}>
                      Modifier
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setDeleting(p)
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
          <div className="admin-grid">
            <InputField label="Code" name="code" value={code} onChange={(e) => setCode(e.target.value)} />
            <InputField label="Valeur" name="value" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>

          <div className="admin-grid">
            <div className="field">
              <label className="field-label" htmlFor="field_discount_type">
                Type
              </label>
              <select
                id="field_discount_type"
                className="field-input"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="field_expires_at">
                Expiration
              </label>
              <input
                id="field_expires_at"
                className="field-input"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
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
        title="Supprimer le code promo"
        message={deleting ? `Confirmer la suppression de “${deleting.code}” ?` : 'Confirmer ?'}
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

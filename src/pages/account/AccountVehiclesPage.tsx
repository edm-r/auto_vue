import { useEffect, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { InputField } from '../../components/InputField'
import type { VehiclePreference } from '../../account/accountApi'
import { createVehicle, deleteVehicle, fetchVehicles, updateVehicle } from '../../account/accountApi'

export function AccountVehiclesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<VehiclePreference[]>([])

  const [editing, setEditing] = useState<VehiclePreference | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [engineType, setEngineType] = useState('')

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchVehicles()
        if (!isMounted) return
        setItems(data)
      } catch {
        if (!isMounted) return
        setError("Impossible de charger tes véhicules.")
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  function openCreate() {
    setEditing(null)
    setBrand('')
    setModel('')
    setYear('')
    setEngineType('')
    setShowForm(true)
  }

  function openEdit(v: VehiclePreference) {
    setEditing(v)
    setBrand(v.brand ?? '')
    setModel(v.model ?? '')
    setYear(v.year != null ? String(v.year) : '')
    setEngineType(v.engine_type ?? '')
    setShowForm(true)
  }

  async function submit() {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      const payload = {
        brand: brand.trim(),
        model: model.trim(),
        year: year.trim() ? Number(year) : null,
        engine_type: engineType.trim(),
      }

      if (editing) {
        const updated = await updateVehicle(editing.id, payload)
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        setSuccess('Véhicule mis à jour.')
      } else {
        const created = await createVehicle(payload)
        setItems((prev) => [created, ...prev])
        setSuccess('Véhicule ajouté.')
      }

      setShowForm(false)
      setEditing(null)
    } catch {
      setError("Impossible de sauvegarder le véhicule.")
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(v: VehiclePreference) {
    if (!window.confirm('Supprimer ce véhicule ?')) return
    try {
      setError(null)
      setSuccess(null)
      await deleteVehicle(v.id)
      setItems((prev) => prev.filter((x) => x.id !== v.id))
      setSuccess('Véhicule supprimé.')
    } catch {
      setError("Impossible de supprimer le véhicule.")
    }
  }

  return (
    <div className="account-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="account-card">
        <div className="account-card-title">Mes véhicules</div>
        {loading ? (
          <div className="skeleton-detail" />
        ) : items.length ? (
          <div className="account-table">
            <div className="account-row account-row--head">
              <div>Marque</div>
              <div>Modèle</div>
              <div>Année</div>
              <div>Moteur</div>
              <div />
            </div>
            {items.map((v) => (
              <div className="account-row" key={v.id}>
                <div>{v.brand || '—'}</div>
                <div>{v.model || '—'}</div>
                <div>{v.year ?? '—'}</div>
                <div>{v.engine_type || '—'}</div>
                <div className="account-actions">
                  <button className="btn" type="button" onClick={() => openEdit(v)}>
                    Modifier
                  </button>
                  <button className="btn" type="button" onClick={() => remove(v)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="account-muted">Aucun véhicule enregistré.</div>
        )}

        <div className="actions">
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Ajouter un véhicule
          </button>
        </div>

        {showForm ? (
          <div className="account-subcard">
            <div className="account-card-title">{editing ? 'Modifier' : 'Nouveau véhicule'}</div>
            <div className="account-grid">
              <InputField label="Marque" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
              <InputField label="Modèle" name="model" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="account-grid">
              <InputField label="Année" name="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
              <InputField
                label="Type moteur"
                name="engine_type"
                value={engineType}
                onChange={(e) => setEngineType(e.target.value)}
              />
            </div>
            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={submit} disabled={submitting}>
                {submitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                disabled={submitting}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}


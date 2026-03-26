import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../../components/AlertMessage'
import { AddressForm } from '../../components/checkout/AddressForm'
import { AddressList } from '../../components/checkout/AddressList'
import type { Address } from '../../checkout/checkoutApi'
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from '../../checkout/checkoutApi'

export function AccountAddressesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [items, setItems] = useState<Address[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const [editing, setEditing] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAddresses()
        if (!isMounted) return
        setItems(data)
        const defaultId = data.find((a) => a.is_default)?.id ?? null
        setSelectedId(defaultId ?? data[0]?.id ?? null)
      } catch {
        if (!isMounted) return
        setError('Impossible de charger les adresses.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  async function removeAddress(address: Address) {
    if (!window.confirm('Supprimer cette adresse ?')) return
    try {
      setError(null)
      setSuccess(null)
      await deleteAddress(address.id)
      const next = items.filter((a) => a.id !== address.id)
      setItems(next)
      setSelectedId((prev) => {
        if (prev === address.id) return next[0]?.id ?? null
        return prev
      })
      setSuccess('Adresse supprimée.')
    } catch (e) {
      const detail =
        isAxiosError(e) && e.response
          ? (e.response.data as { detail?: string }).detail
          : null
      setError(detail || "Impossible de supprimer l'adresse.")
    }
  }

  return (
    <div className="account-section">
      {error ? <AlertMessage type="error" message={error} /> : null}
      {success ? <AlertMessage type="success" message={success} /> : null}

      <div className="account-card">
        <div className="account-card-title">Adresses de livraison</div>
        {loading ? (
          <div className="skeleton-detail" />
        ) : (
          <>
            {items.length ? (
              <AddressList
                items={items}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                onEdit={(a) => {
                  setEditing(a)
                  setShowForm(true)
                }}
                onDelete={removeAddress}
              />
            ) : (
              <div className="account-muted">Aucune adresse enregistrée.</div>
            )}

            <div className="actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setEditing(null)
                  setShowForm(true)
                }}
              >
                Ajouter une adresse
              </button>
              {showForm ? (
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                >
                  Fermer
                </button>
              ) : null}
            </div>

            {showForm ? (
              <div className="checkout-subcard">
                <div className="checkout-subtitle">{editing ? 'Modifier' : 'Nouvelle adresse'}</div>
                <AddressForm
                  initial={editing ?? undefined}
                  isSubmitting={submitting}
                  onCancel={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                  onSubmit={async (values) => {
                    try {
                      setSubmitting(true)
                      setError(null)
                      setSuccess(null)
                      if (editing) {
                        const updated = await updateAddress(editing.id, values)
                        const next = items.map((a) => (a.id === updated.id ? updated : a))
                        setItems(next)
                        setSelectedId(updated.id)
                        setSuccess('Adresse mise à jour.')
                      } else {
                        const created = await createAddress(values)
                        setItems([created, ...items])
                        setSelectedId(created.id)
                        setSuccess('Adresse ajoutée.')
                      }
                      setShowForm(false)
                      setEditing(null)
                    } catch (e) {
                      const detail =
                        isAxiosError(e) && e.response
                          ? (e.response.data as { detail?: string }).detail
                          : null
                      setError(detail || "Impossible de sauvegarder l'adresse.")
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}


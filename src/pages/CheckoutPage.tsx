import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'

import { AlertMessage } from '../components/AlertMessage'
import { AddressForm } from '../components/checkout/AddressForm'
import { AddressList } from '../components/checkout/AddressList'
import { CheckoutStepper } from '../components/checkout/CheckoutStepper'
import { OrderSummary } from '../components/checkout/OrderSummary'
import { ShippingMethodSelector } from '../components/checkout/ShippingMethodSelector'
import type { ShippingMethod } from '../components/checkout/ShippingMethodSelector'
import type { Address } from '../checkout/checkoutApi'
import {
  createAddress,
  createOrderFromCart,
  createStripeCheckoutSession,
  fetchAddresses,
  updateAddress,
} from '../checkout/checkoutApi'
import { clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft } from '../checkout/checkoutStorage'
import { useCart } from '../cart/CartContext'

type Step = 1 | 2 | 3

export function CheckoutPage() {
  const { cart, isLoading: cartLoading, refresh: refreshCart } = useCart()
  const cartItems = cart?.items ?? []

  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState<string | null>(null)

  // Step 1: address
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [addrError, setAddrError] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Step 2: shipping
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null)
  const [shippingCost, setShippingCost] = useState(0)

  // Step 3: paymen
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const draft = loadCheckoutDraft()
    if (!draft) return
    if (draft.step) setStep(draft.step)
    if (draft.addressId) setSelectedAddressId(draft.addressId)
    if (draft.shippingMethod) setShippingMethod(draft.shippingMethod)
    if (draft.shippingCost) setShippingCost(draft.shippingCost)
  }, [])

  useEffect(() => {
    saveCheckoutDraft({
      step,
      addressId: selectedAddressId ?? undefined,
      shippingMethod: shippingMethod ?? undefined,
      shippingCost: shippingCost || undefined,
    })
  }, [step, selectedAddressId, shippingMethod, shippingCost])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setAddrLoading(true)
        setAddrError(null)
        const data = await fetchAddresses()
        if (!isMounted) return
        setAddresses(data)
        const defaultId = data.find((a) => a.is_default)?.id ?? null
        setSelectedAddressId((prev) => {
          if (prev && data.some((a) => a.id === prev)) return prev
          return defaultId ?? data[0]?.id ?? null
        })
      } catch {
        if (!isMounted) return
        setAddrError('Impossible de charger les adresses.')
      } finally {
        if (!isMounted) return
        setAddrLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(selectedAddressId)
    if (step === 2) return Boolean(shippingMethod)
    return true
  }, [step, selectedAddressId, shippingMethod])

  if (cartLoading) {
    return (
      <div className="page">
        <div className="skeleton-detail" />
      </div>
    )
  }

  if (!cartItems.length) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">Checkout</h1>
            <div className="page-subtitle">Ton panier est vide.</div>
          </div>
          <div className="page-actions">
            <Link className="btn btn-primary" to="/products">
              Voir les produits
            </Link>
          </div>
        </div>
        <div className="empty">
          Ajoute des produits au panier avant de passer commande. <Link to="/cart">Aller au panier</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page checkout">
      <div className="page-head">
        <div>
          <h1 className="page-title">Checkout</h1>
          <div className="page-subtitle">Finalise ta commande en 4 étapes.</div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/cart">
            Retour panier
          </Link>
        </div>
      </div>

      {error ? <AlertMessage type="error" message={error} /> : null}

      <CheckoutStepper active={step} />

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 ? (
            <div className="checkout-card">
              <div className="checkout-card-title">1) Adresse</div>
              {addrError ? <AlertMessage type="error" message={addrError} /> : null}
              {addrLoading ? (
                <div className="skeleton-detail" />
              ) : (
                <>
                  <AddressList
                    items={addresses}
                    selectedId={selectedAddressId}
                    onSelect={(id) => setSelectedAddressId(id)}
                    onEdit={(a) => {
                      setEditing(a)
                      setShowForm(true)
                    }}
                  />

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
                  </div>

                  {showForm ? (
                    <div className="checkout-subcard">
                      <div className="checkout-subtitle">{editing ? 'Modifier' : 'Nouvelle adresse'}</div>
                      <AddressForm
                        initial={editing ?? undefined}
                        isSubmitting={formSubmitting}
                        onCancel={() => {
                          setShowForm(false)
                          setEditing(null)
                        }}
                        onSubmit={async (values) => {
                          try {
                            setFormSubmitting(true)
                            if (editing) {
                              const updated = await updateAddress(editing.id, values)
                              const next = addresses.map((a) => (a.id === updated.id ? updated : a))
                              setAddresses(next)
                              setSelectedAddressId(updated.id)
                            } else {
                              const created = await createAddress(values)
                              setAddresses([created, ...addresses])
                              setSelectedAddressId(created.id)
                            }
                            setShowForm(false)
                            setEditing(null)
                          } catch {
                            setAddrError('Impossible de sauvegarder l’adresse.')
                          } finally {
                            setFormSubmitting(false)
                          }
                        }}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="checkout-card">
              <div className="checkout-card-title">2) Livraison</div>
              <ShippingMethodSelector
                value={shippingMethod}
                onChange={(m, price) => {
                  setShippingMethod(m)
                  setShippingCost(price)
                }}
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="checkout-card">
              <div className="checkout-card-title">3) Paiement</div>
              <div className="checkout-muted">
                Paiement sécurisé via Stripe. Tu vas être redirigé vers la page de paiement.
              </div>
              <div className="checkout-muted">
                Note: le code promo du panier n’est pas encore appliqué au paiement (à brancher côté backend).
              </div>
              <div className="actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={paying || !selectedAddressId || !shippingMethod}
                  onClick={async () => {
                    if (!selectedAddressId) return
                    try {
                      setError(null)
                      setPaying(true)
                      const order = await createOrderFromCart({
                        addressId: selectedAddressId,
                        shippingCost: String(shippingCost),
                        taxRate: '0.0000',
                      })
                      await refreshCart()

                      const origin = window.location.origin
                      const successUrl = `${origin}/checkout/success?order_id=${order.id}`
                      const cancelUrl = `${origin}/checkout/cancel?order_id=${order.id}`
                      const session = await createStripeCheckoutSession({
                        orderId: order.id,
                        successUrl,
                        cancelUrl,
                      })

                      clearCheckoutDraft()
                      window.location.assign(session.checkout_url)
                    } catch (e) {
                      const detail =
                        isAxiosError(e) && e.response
                          ? (e.response.data as { detail?: string; message?: string }).detail ??
                            (e.response.data as { detail?: string; message?: string }).message
                          : null
                      setError(detail || 'Impossible de démarrer le paiement.')
                    } finally {
                      setPaying(false)
                    }
                  }}
                >
                  {paying ? 'Redirection…' : 'Payer avec Stripe'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="checkout-actions">
            <button
              className="btn"
              type="button"
              disabled={step === 1}
              onClick={() => {
                setError(null)
                setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)))
              }}
            >
              Retour
            </button>
            <button
              className="btn btn-primary"
              type="button"
              disabled={!canGoNext || step === 3}
              onClick={() => {
                setError(null)
                setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)))
              }}
            >
              Continuer
            </button>
          </div>
        </div>

        <OrderSummary shippingCost={shippingCost} />
      </div>
    </div>
  )
}

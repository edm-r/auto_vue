import { useMemo } from 'react'

import { useCart } from '../../cart/CartContext'

function toNumber(value: string | undefined) {
  const n = Number(value ?? '0')
  return Number.isFinite(n) ? n : 0
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n))
}

export function CartSummary({
  shippingCost,
  onCheckout,
  isCheckoutDisabled,
}: {
  shippingCost: number
  onCheckout: () => void
  isCheckoutDisabled?: boolean
}) {
  const { cart, promo } = useCart()

  const subtotal = useMemo(() => toNumber(cart?.subtotal), [cart?.subtotal])
  const discount = useMemo(() => toNumber(promo?.valid ? promo.discount_amount : '0'), [promo])
  const total = Math.max(0, subtotal - discount) + shippingCost

  return (
    <div className="cart-card">
      <div className="cart-card-title">Résumé</div>

      <div className="cart-summary">
        <div className="cart-row">
          <span>Sous-total</span>
          <strong>{fmt(subtotal)} FCFA</strong>
        </div>
        <div className="cart-row">
          <span>Livraison</span>
          <strong>{fmt(shippingCost)} FCFA</strong>
        </div>
        {discount ? (
          <div className="cart-row">
            <span>Réduction</span>
            <strong>-{fmt(discount)} FCFA</strong>
          </div>
        ) : null}
        <div className="cart-divider" />
        <div className="cart-row">
          <span>Total</span>
          <strong>{fmt(total)} FCFA</strong>
        </div>
      </div>

      <button className="btn btn-primary cart-checkout" type="button" onClick={onCheckout} disabled={isCheckoutDisabled}>
        Passer la commande
      </button>
    </div>
  )
}


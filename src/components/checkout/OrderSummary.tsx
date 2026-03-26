import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useCart } from '../../cart/CartContext'

function toNumber(value: string | undefined) {
  const n = Number(value ?? '0')
  return Number.isFinite(n) ? n : 0
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n))
}

export function OrderSummary({
  shippingCost,
}: {
  shippingCost: number
}) {
  const { cart } = useCart()
  const items = cart?.items ?? []

  const subtotal = useMemo(() => toNumber(cart?.subtotal), [cart?.subtotal])
  const total = subtotal + (items.length ? shippingCost : 0)

  return (
    <div className="summary">
      <div className="summary-title">Résumé de commande</div>

      <div className="summary-items">
        {items.map((i) => (
          <div key={i.id} className="summary-item">
            <Link to={`/products/${i.product_id}`} className="summary-name">
              {i.product_name}
            </Link>
            <div className="summary-qty">x{i.quantity}</div>
            <div className="summary-price">{fmt(toNumber(i.total_price))} FCFA</div>
          </div>
        ))}
      </div>

      <div className="summary-totals">
        <div className="cart-row">
          <span>Sous-total</span>
          <strong>{fmt(subtotal)} FCFA</strong>
        </div>
        <div className="cart-row">
          <span>Livraison</span>
          <strong>{items.length ? fmt(shippingCost) : '0'} FCFA</strong>
        </div>
        <div className="cart-divider" />
        <div className="cart-row">
          <span>Total</span>
          <strong>{fmt(total)} FCFA</strong>
        </div>
      </div>
    </div>
  )
}

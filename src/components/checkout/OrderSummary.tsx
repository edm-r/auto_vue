import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useCart } from '../../cart/CartContext'

function toNumber(value: string | undefined) {
  const n = Number(value ?? '0')
  return Number.isFinite(n) ? n : 0
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
            <div className="summary-price">${(toNumber(i.total_price) / 650).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="summary-totals">
        <div className="cart-row">
          <span>Sous-total</span>
          <strong>${(subtotal / 650).toFixed(2)}</strong>
        </div>
        <div className="cart-row">
          <span>Livraison</span>
          <strong>{items.length ? `$${(shippingCost / 650).toFixed(2)}` : '$0.00'}</strong>
        </div>
        <div className="cart-divider" />
        <div className="cart-row">
          <span>Total</span>
          <strong>${(total / 650).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

import type { ApiCartItem } from '../../cart/cartApi'
import { useCart } from '../../cart/CartContext'
import { resolveAssetUrl } from '../../lib/assetUrl'
import { QuantitySelector } from './QuantitySelector'

function fmt(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  return new Intl.NumberFormat('fr-FR').format(Math.round(n))
}

export function CartItemRow({ item }: { item: ApiCartItem }) {
  const { updateItem, removeItem } = useCart()
  const imageUrl = resolveAssetUrl(item.product_primary_image ?? null)

  return (
    <div className="cart-item">
      <div className="cart-item-media">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product_primary_image_alt_text ?? item.product_name}
            loading="lazy"
          />
        ) : (
          <div className="product-media-fallback">—</div>
        )}
      </div>

      <div className="cart-item-body">
        <Link className="cart-item-name" to={`/products/${item.product_id}`}>
          {item.product_name}
        </Link>
        <div className="cart-item-meta">
          <span>{fmt(item.unit_price)} FCFA</span>
          <span className={item.product_is_in_stock ? 'cart-ok' : 'cart-out'}>
            {item.product_is_in_stock ? 'En stock' : 'Rupture'}
          </span>
        </div>

        <div className="cart-item-actions">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => void updateItem(item.id, q)}
          />
          <div className="cart-item-total">{fmt(item.total_price)} FCFA</div>
          <button className="btn" type="button" onClick={() => void removeItem(item.id)}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}


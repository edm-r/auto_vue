import { Link } from 'react-router-dom'

import type { ProductListItem } from '../lib/catalogApi'
import { resolveAssetUrl } from '../lib/assetUrl'

export function ProductCard({
  product,
  onAddToCart,
}: {
  product: ProductListItem
  onAddToCart: (p: ProductListItem) => void
}) {
  const imageUrl = resolveAssetUrl(product.primary_image?.image)
  const inStock = product.is_in_stock ?? (product.stock_quantity ?? 0) > 0
  return (
    <div className="product-card">
      <Link className="product-media" to={`/products/${product.id}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.primary_image?.alt_text ?? product.name}
            loading="lazy"
          />
        ) : (
          <div className="product-media-fallback">Aucune image</div>
        )}
      </Link>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-brand">{product.brand_name ?? 'Marque'}</span>
          <span className={`product-stock ${inStock ? 'is-ok' : 'is-out'}`}>
            {inStock ? 'En stock' : 'Rupture'}
          </span>
        </div>
        <Link className="product-name" to={`/products/${product.id}`}>
          {product.name}
        </Link>
        <div className="product-footer">
          <div className="product-price">{product.price} FCFA</div>
          <button className="btn" type="button" onClick={() => onAddToCart(product)}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}

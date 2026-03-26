import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import { addToCart } from '../cart/cartStorage'
import type { ProductDetail } from '../lib/catalogApi'
import { fetchProduct } from '../lib/catalogApi'
import { resolveAssetUrl } from '../lib/assetUrl'

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const p = await fetchProduct(id)
        if (!isMounted) return
        setProduct(p)
      } catch {
        if (!isMounted) return
        setError('Impossible de charger le produit.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [id])

  function handleAdd() {
    if (!product) return
    addToCart({ productId: product.id, name: product.name, price: product.price }, 1)
    setToast('Produit ajouté au panier.')
    window.setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{loading ? 'Produit' : product?.name ?? 'Produit'}</h1>
          <div className="page-subtitle">
            {product?.brand_name ? <>Marque: {product.brand_name}</> : null}
          </div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/products">
            Retour
          </Link>
          <button className="btn btn-primary" type="button" onClick={handleAdd} disabled={!product}>
            Ajouter au panier
          </button>
        </div>
      </div>

      {toast ? <AlertMessage type="success" message={toast} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      {loading ? (
        <div className="skeleton-detail" />
      ) : product ? (
        <div className="detail">
          <div className="detail-media">
            {product.images?.length ? (
              <img
                src={resolveAssetUrl(product.images[0].image) ?? product.images[0].image}
                alt={product.name}
                loading="lazy"
              />
            ) : product.primary_image?.image ? (
              <img
                src={resolveAssetUrl(product.primary_image.image) ?? product.primary_image.image}
                alt={product.name}
                loading="lazy"
              />
            ) : (
              <div className="product-media-fallback">Aucune image</div>
            )}
          </div>
          <div className="detail-body">
            <div className="detail-price">{product.price} FCFA</div>
            <div className="detail-stock">
              {product.is_in_stock ? 'En stock' : 'Rupture de stock'}
            </div>
            {product.description ? (
              <p className="detail-desc">{product.description}</p>
            ) : (
              <p className="detail-desc is-muted">Aucune description.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

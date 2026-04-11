import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import { ProductCard } from '../../components/ProductCard'
import { useCart } from '../../cart/CartContext'
import { fetchProduct, type ProductListItem } from '../../lib/catalogApi'
import { fetchWishlist, removeFromWishlist } from '../../account/accountApi'

export function AccountWishlistPage() {
  const { addProduct } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productIds, setProductIds] = useState<number[]>([])
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const wl = await fetchWishlist()
        const ids = wl.product_ids ?? []
        if (!isMounted) return
        setProductIds(ids)

        const details = await Promise.all(ids.map((id) => fetchProduct(String(id)).catch(() => null)))
        if (!isMounted) return
        setProducts(details.filter(Boolean) as ProductListItem[])
      } catch {
        if (!isMounted) return
        setError('Impossible de charger la wishlist.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const missingCount = useMemo(() => productIds.length - products.length, [productIds.length, products.length])

  async function remove(id: number) {
    try {
      setBusyId(id)
      setError(null)
      await removeFromWishlist(id)
      setProductIds((prev) => prev.filter((x) => x !== id))
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError("Impossible de retirer le produit de la wishlist.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="account-section">
      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="account-card">
        <div className="account-card-title">Liste de souhaits</div>
        {loading ? (
          <div className="skeleton-detail" />
        ) : products.length ? (
          <>
            {missingCount > 0 ? <div className="account-muted">{missingCount} produit(s) indisponible(s).</div> : null}
            <div className="product-grid">
              {products.map((p) => (
                <div key={p.id} className="account-wishlist-item">
                  <ProductCard
                    product={p}
                    onAddToCart={(prod) => {
                      void addProduct({ id: prod.id, name: prod.name, price: prod.price }, 1)
                    }}
                  />
                  <button className="btn" type="button" disabled={busyId === p.id} onClick={() => remove(p.id)}>
                    {busyId === p.id ? 'Suppression…' : 'Retirer'}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="account-muted">
            Ta wishlist est vide. <Link to="/products">Découvrir des produits</Link>
          </div>
        )}
      </div>
    </div>
  )
}


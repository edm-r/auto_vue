import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import { ProductCard } from '../components/ProductCard'
import { addToCart } from '../cart/cartStorage'
import type { ProductListItem } from '../lib/catalogApi'
import { fetchProducts } from '../lib/catalogApi'

export function ProductsPage() {
  const [searchParams] = useSearchParams()

  const [items, setItems] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const query = useMemo(() => {
    return {
      search: searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      brand: searchParams.get('brand') ?? undefined,
      compatible_car_models: searchParams.get('compatible_car_models') ?? undefined,
    }
  }, [searchParams])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProducts(query)
        if (!isMounted) return
        setItems(data)
      } catch {
        if (!isMounted) return
        setError('Impossible de charger les produits.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [query])

  function handleAddToCart(p: ProductListItem) {
    addToCart({ productId: p.id, name: p.name, price: p.price }, 1)
    setToast('Produit ajouté au panier.')
    window.setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Produits</h1>
          <div className="page-subtitle">
            {query.search ? <>Recherche: “{query.search}”</> : null}
          </div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/">
            Accueil
          </Link>
        </div>
      </div>

      {toast ? <AlertMessage type="success" message={toast} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="product-grid" aria-busy={loading}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div className="skeleton-product" key={i} />)
          : items.map((p) => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
      </div>

      {!loading && !items.length ? (
        <div className="empty">Aucun produit trouvé.</div>
      ) : null}
    </div>
  )
}


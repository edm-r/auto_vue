import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import { BrandCarousel } from '../components/BrandCarousel'
import { CategoryCard } from '../components/CategoryCard'
import { HeroBanner } from '../components/HeroBanner'
import { ProductCard } from '../components/ProductCard'
import { PromoBanner } from '../components/PromoBanner'
import { useCart } from '../cart/CartContext'
import type { Brand, Category, ProductListItem } from '../lib/catalogApi'
import {
  fetchBrands,
  fetchCategories,
  fetchFeaturedProducts,
  fetchProducts,
} from '../lib/catalogApi'

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function HomePage() {
  const navigate = useNavigate()
  const { addProduct } = useCart()

  const [toast, setToast] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [featured, setFeatured] = useState<ProductListItem[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const [cats, brs, feat] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchFeaturedProducts(),
        ])

        const featuredFallback = feat.length ? feat : await fetchProducts({})

        if (!isMounted) return
        setCategories(cats)
        setBrands(brs)
        setFeatured(featuredFallback.slice(0, 8))
      } catch {
        if (!isMounted) return
        setError("Impossible de charger la page d'accueil.")
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const popularCategories = useMemo(() => {
    const wanted = ['moteur', 'freins', 'electricite', 'carrosserie']
    const map = new Map(categories.map((c) => [normalizeName(c.name), c]))
    const picked = wanted.map((w) => map.get(w)).filter(Boolean) as Category[]
    if (picked.length >= 4) return picked.slice(0, 4)
    if (categories.length) return categories.slice(0, 4)
    return [
      { id: 0, name: 'Moteur', description: 'Filtres, courroies, joints…' },
      { id: 0, name: 'Freins', description: 'Plaquettes, disques, liquide…' },
      { id: 0, name: 'Électricité', description: 'Batteries, capteurs, ampoules…' },
      { id: 0, name: 'Carrosserie', description: 'Phares, pare-chocs, rétros…' },
    ] as unknown as Category[]
  }, [categories])

  function handleAddToCart(p: ProductListItem) {
    void addProduct({ id: p.id, name: p.name, price: p.price }, 1)
    setToast('Produit ajouté au panier.')
    window.setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="home">
      <HeroBanner
        onSearch={({ search, brand, carModel }) => {
          const params = new URLSearchParams()
          if (search) params.set('search', search)
          if (brand) params.set('brand', String(brand))
          if (carModel) params.set('compatible_car_models', String(carModel))
          navigate(`/products?${params.toString()}`)
        }}
      />

      <div className="home-container">
        {toast ? <AlertMessage type="success" message={toast} /> : null}
        {error ? <AlertMessage type="error" message={error} /> : null}

        <PromoBanner />

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Marques populaires</h2>
            <div className="section-subtitle">Retrouvez les meilleurs équipementiers.</div>
          </div>

          {loading ? (
            <div className="skeleton-strip" />
          ) : (
            <BrandCarousel brands={brands.slice(0, 16)} />
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Produits en vedette</h2>
            <div className="section-subtitle">Best sellers & recommandations.</div>
          </div>

          <div className="product-grid" aria-busy={loading}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div className="skeleton-product" key={i} />
                ))
              : featured.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Catégories</h2>
            <div className="section-subtitle">Explorez les pièces par système.</div>
          </div>

          <div className="category-grid" aria-busy={loading}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div className="skeleton-card" key={i} />
                ))
              : popularCategories.map((c) =>
                  c.id ? (
                    <CategoryCard key={c.id} category={c} />
                  ) : (
                    <div key={c.name} className="category-card is-disabled">
                      <div className="category-title">{c.name}</div>
                      <div className="category-desc">{c.description}</div>
                    </div>
                  ),
                )}
          </div>
        </section>
      </div>
    </div>
  )
}

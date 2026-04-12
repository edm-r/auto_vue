import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import { FilterSidebar } from '../components/FilterSidebar'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../cart/CartContext'
import type { ProductListItem, ProductSuggestion } from '../lib/catalogApi'
import { fetchProductSuggestions, fetchProductsPage } from '../lib/catalogApi'

export function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addProduct } = useCart()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = useMemo(() => {
    return {
      search: searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      brand: searchParams.get('brand') ?? undefined,
      compatible_car_models: searchParams.get('compatible_car_models') ?? undefined,
      vehicle_brand: searchParams.get('vehicle_brand') ?? undefined,
      price_min: searchParams.get('price_min') ?? undefined,
      price_max: searchParams.get('price_max') ?? undefined,
      ordering: searchParams.get('ordering') ?? undefined,
      page: Number(searchParams.get('page') ?? '1') || 1,
    }
  }, [searchParams])

  const [items, setItems] = useState<ProductListItem[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProductsPage({
          search: query.search,
          category: query.category,
          brand: query.brand,
          compatible_car_models: query.compatible_car_models,
          price_min: query.price_min,
          price_max: query.price_max,
          ordering: query.ordering,
          page: query.page,
        })
        if (!isMounted) return
        setItems(data.items)
        setCount(data.count)
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
  }, [
    query.search,
    query.category,
    query.brand,
    query.compatible_car_models,
    query.price_min,
    query.price_max,
    query.ordering,
    query.page,
  ])

  function addParam(next: Record<string, string | undefined>, { resetPage = true } = {}) {
    const merged = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([k, v]) => {
      if (!v) merged.delete(k)
      else merged.set(k, v)
    })
    if (resetPage) merged.delete('page')
    setSearchParams(merged, { replace: true })
  }

  function clearFilters() {
    const merged = new URLSearchParams(searchParams)
    ;[
      'category',
      'brand',
      'price_min',
      'price_max',
      'vehicle_brand',
      'compatible_car_models',
    ].forEach((k) => merged.delete(k))
    merged.delete('page')
    setSearchParams(merged, { replace: true })
  }

  function handleAddToCart(p: ProductListItem) {
    void addProduct({ id: p.id, name: p.name, price: p.price }, 1)
    setToast('Produit ajouté au panier.')
    window.setTimeout(() => setToast(null), 2500)
  }

  const page = query.page
  const pageSize = 10
  const totalPages = count ? Math.max(1, Math.ceil(count / pageSize)) : null

  const [searchInput, setSearchInput] = useState(query.search ?? '')
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const suggestTimer = useRef<number | null>(null)

  useEffect(() => {
    setSearchInput(query.search ?? '')
  }, [query.search])

  useEffect(() => {
    const q = searchInput.trim()
    if (!q || q.length < 2) {
      setSuggestions([])
      setSuggestOpen(false)
      return
    }

    if (suggestTimer.current) window.clearTimeout(suggestTimer.current)
    suggestTimer.current = window.setTimeout(async () => {
      try {
        setSuggestLoading(true)
        const data = await fetchProductSuggestions(q)
        setSuggestions(data)
        setSuggestOpen(true)
      } catch {
        setSuggestions([])
        setSuggestOpen(false)
      } finally {
        setSuggestLoading(false)
      }
    }, 250)

    return () => {
      if (suggestTimer.current) window.clearTimeout(suggestTimer.current)
    }
  }, [searchInput])

  return (
    <div className="page catalog">
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
          <Link className="btn btn-primary" to="/cart">
            Panier
          </Link>
        </div>
      </div>

      {toast ? <AlertMessage type="success" message={toast} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      <div className="catalog-head">
        <form
          className="catalog-search"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            addParam({ search: searchInput.trim() || undefined })
            setSuggestOpen(false)
          }}
        >
          <input
            className="catalog-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Recherche (nom, SKU...)"
            onFocus={() => {
              if (suggestions.length) setSuggestOpen(true)
            }}
            onBlur={() => window.setTimeout(() => setSuggestOpen(false), 150)}
          />
          <button className="btn btn-primary" type="submit">
            Rechercher
          </button>
          {suggestOpen ? (
            <div className="suggestions">
              {suggestLoading ? (
                <div className="suggestion-item">Chargement…</div>
              ) : null}
              {!suggestLoading && suggestions.length ? (
                suggestions.map((s) => (
                  <button
                    type="button"
                    className="suggestion-item"
                    key={s.id}
                    onMouseDown={() => {
                      navigate(`/products/${s.id}`)
                    }}
                  >
                    <div className="suggestion-name">{s.name}</div>
                    <div className="suggestion-meta">
                      {s.sku ? <span>SKU: {s.sku}</span> : null}
                      {s.price ? <span>{s.price} FCFA</span> : null}
                    </div>
                  </button>
                ))
              ) : !suggestLoading ? (
                <div className="suggestion-item is-muted">Aucune suggestion</div>
              ) : null}
            </div>
          ) : null}
        </form>

        <div className="catalog-sort">
          <label className="catalog-sort-label">Trier</label>
          <select
            className="catalog-sort-select"
            value={query.ordering ?? ''}
            onChange={(e) => addParam({ ordering: e.target.value || undefined })}
          >
            <option value="">Pertinence</option>
            <option value="-created_at">Nouveautés</option>
            <option value="price">Prix croissant</option>
            <option value="-price">Prix décroissant</option>
          </select>
        </div>

        <button 
          type="button" 
          className="catalog-filter-btn"
          onClick={() => setFiltersOpen(true)}
        >
          Filtrer
        </button>
      </div>

      <div className="catalog-layout">
        <FilterSidebar
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          selected={{
            category: query.category,
            brand: query.brand,
            price_min: query.price_min,
            price_max: query.price_max,
            vehicle_brand: query.vehicle_brand,
            compatible_car_models: query.compatible_car_models,
          }}
          onChange={(next) => addParam(next as Record<string, string | undefined>)}
          onClearAll={clearFilters}
        />

        <div className="catalog-content">
          <div className="product-grid" aria-busy={loading}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div className="skeleton-product" key={i} />
                ))
              : items.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))}
          </div>

          {!loading && !items.length ? <div className="empty">Aucun produit trouvé.</div> : null}

          <div className="pager">
            <button
              className="btn"
              type="button"
              disabled={page <= 1}
              onClick={() => addParam({ page: String(page - 1) }, { resetPage: false })}
            >
              Précédent
            </button>
            <div className="pager-info">
              Page {page}
              {totalPages ? ` / ${totalPages}` : ''}
            </div>
            <button
              className="btn"
              type="button"
              disabled={totalPages ? page >= totalPages : items.length < pageSize}
              onClick={() => addParam({ page: String(page + 1) }, { resetPage: false })}
            >
              Suivant
            </button>
          </div>
          <div className="pager-clear">
            <button className="btn" type="button" onClick={clearFilters}>
              Effacer les filtres
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


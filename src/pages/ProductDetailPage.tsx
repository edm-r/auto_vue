import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import { ProductCard } from '../components/ProductCard'
import { addToCart } from '../cart/cartStorage'
import type { ProductDetail, ProductListItem } from '../lib/catalogApi'
import { fetchProduct, fetchProducts } from '../lib/catalogApi'
import { resolveAssetUrl } from '../lib/assetUrl'

type TabKey = 'features' | 'compatibility' | 'reviews'

export function ProductDetailPage() {
  const { id } = useParams()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<TabKey>('features')
  const [activeImage, setActiveImage] = useState(0)

  const [similar, setSimilar] = useState<ProductListItem[]>([])
  const [similarLoading, setSimilarLoading] = useState(false)

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
        setActiveImage(0)
        setQty(1)
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

  const images = useMemo(() => {
    const list = (product?.images ?? []).map((img) => ({
      url: resolveAssetUrl(img.image) ?? img.image,
      alt: img.alt_text ?? product?.name ?? 'Image',
    }))
    if (list.length) return list
    const primary = product?.primary_image?.image
    if (primary) {
      return [
        {
          url: resolveAssetUrl(primary) ?? primary,
          alt: product?.primary_image?.alt_text ?? product?.name ?? 'Image',
        },
      ]
    }
    return []
  }, [product])

  const inStock = product?.is_in_stock ?? (product?.stock_quantity ?? 0) > 0
  const lowStock =
    (product as unknown as { is_low_stock?: boolean } | null)?.is_low_stock ?? false

  const brandLabel =
    (product as unknown as { brand_detail?: { name?: string } } | null)?.brand_detail?.name ??
    product?.brand_name ??
    null

  const categoryLabel =
    (product as unknown as { category_detail?: { name?: string } } | null)?.category_detail?.name ??
    product?.category_name ??
    null

  useEffect(() => {
    if (!product?.id) return
    if (!product.category && !product.brand) return
    let isMounted = true
    ;(async () => {
      try {
        setSimilarLoading(true)
        const data = await fetchProducts({
          category: product.category ? String(product.category) : undefined,
          brand: product.brand ? String(product.brand) : undefined,
        })
        if (!isMounted) return
        setSimilar(data.filter((p) => p.id !== product.id).slice(0, 4))
      } catch {
        if (!isMounted) return
        setSimilar([])
      } finally {
        if (!isMounted) return
        setSimilarLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [product?.id, product?.category, product?.brand])

  function handleAdd() {
    if (!product) return
    addToCart({ productId: product.id, name: product.name, price: product.price }, qty)
    setToast('Produit ajouté au panier.')
    window.setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{loading ? 'Produit' : product?.name ?? 'Produit'}</h1>
          <div className="page-subtitle">
            {brandLabel ? <>Marque: {brandLabel}</> : null}
            {product?.sku ? <span style={{ marginLeft: 10 }}>SKU: {product.sku}</span> : null}
          </div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/products">
            Retour
          </Link>
          <button className="btn btn-primary" type="button" onClick={handleAdd} disabled={!product}>
            Ajouter
          </button>
        </div>
      </div>

      {toast ? <AlertMessage type="success" message={toast} /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}

      {loading ? (
        <div className="skeleton-detail" />
      ) : product ? (
        <>
          <div className="detail">
            <div className="detail-media">
              {images.length ? (
                <img src={images[Math.min(activeImage, images.length - 1)].url} alt={product.name} loading="lazy" />
              ) : (
                <div className="product-media-fallback">Aucune image</div>
              )}
              {images.length > 1 ? (
                <div className="thumbs">
                  {images.map((img, idx) => (
                    <button
                      className={`thumb ${idx === activeImage ? 'is-active' : ''}`}
                      type="button"
                      key={img.url}
                      onClick={() => setActiveImage(idx)}
                      aria-label={`Image ${idx + 1}`}
                    >
                      <img src={img.url} alt={img.alt} loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="detail-body">
              <div className="detail-price">{product.price} FCFA</div>
              <div className={`detail-stock-badge ${inStock ? 'is-ok' : 'is-out'}`}>
                {inStock ? (lowStock ? 'Stock faible' : 'En stock') : 'Rupture de stock'}
              </div>

              <div className="qty">
                <label className="qty-label">Quantité</label>
                <input
                  className="qty-input"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                />
                <button className="btn btn-primary" type="button" onClick={handleAdd} disabled={!inStock}>
                  Ajouter au panier
                </button>
              </div>

              {product.description ? (
                <p className="detail-desc">{product.description}</p>
              ) : (
                <p className="detail-desc is-muted">Aucune description.</p>
              )}
            </div>
          </div>

          <div className="tabs">
            <div className="tabs-head">
              <button className={`tab ${tab === 'features' ? 'is-active' : ''}`} type="button" onClick={() => setTab('features')}>
                Caractéristiques
              </button>
              <button className={`tab ${tab === 'compatibility' ? 'is-active' : ''}`} type="button" onClick={() => setTab('compatibility')}>
                Compatibilité
              </button>
              <button className={`tab ${tab === 'reviews' ? 'is-active' : ''}`} type="button" onClick={() => setTab('reviews')}>
                Avis
              </button>
            </div>
            <div className="tabs-body">
              {tab === 'features' ? (
                <ul className="kv">
                  <li>
                    <span>SKU</span>
                    <span>{product.sku ?? '—'}</span>
                  </li>
                  <li>
                    <span>Catégorie</span>
                    <span>{categoryLabel ?? '—'}</span>
                  </li>
                  <li>
                    <span>Marque</span>
                    <span>{brandLabel ?? '—'}</span>
                  </li>
                  <li>
                    <span>Stock</span>
                    <span>{String(product.stock_quantity ?? '—')}</span>
                  </li>
                </ul>
              ) : null}

              {tab === 'compatibility' ? (
                <div>
                  {(product as unknown as { compatible_car_models?: Array<{ id: number; brand_name?: string; name: string }> })
                    .compatible_car_models?.length ? (
                    <ul className="compat-list">
                      {(product as unknown as { compatible_car_models?: Array<{ id: number; brand_name?: string; name: string }> })
                        .compatible_car_models!.map((m) => (
                          <li key={m.id}>
                            {m.brand_name ? `${m.brand_name} ` : ''}
                            {m.name}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="empty">Aucune compatibilité renseignée.</div>
                  )}
                </div>
              ) : null}

              {tab === 'reviews' ? (
                <div className="empty">Avis clients à venir.</div>
              ) : null}
            </div>
          </div>

          <section className="section">
            <div className="section-head">
              <h2 className="section-title">Produits similaires</h2>
              <div className="section-subtitle">Tu pourrais aussi aimer.</div>
            </div>

            <div className="product-grid" aria-busy={similarLoading}>
              {similarLoading
                ? Array.from({ length: 4 }).map((_, i) => <div className="skeleton-product" key={i} />)
                : similar.map((p) => (
                    <ProductCard key={p.id} product={p} onAddToCart={(x) => addToCart({ productId: x.id, name: x.name, price: x.price }, 1)} />
                  ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

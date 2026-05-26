import { useEffect, useMemo, useState } from 'react'

import type { Brand, Category } from '../lib/catalogApi'
import { fetchBrands, fetchCarModels, fetchCategories } from '../lib/catalogApi'
import { PriceRangeFilter } from './PriceRangeFilter'

export function FilterSidebar({
  selected,
  onChange,
  onClearAll,
  isOpen,
  onClose,
}: {
  isOpen?: boolean
  onClose?: () => void
  selected: {
    category?: string
    brand?: string
    price_min?: string
    price_max?: string
    vehicle_brand?: string
    compatible_car_models?: string
  }
  onChange: (next: Partial<typeof selected>) => void
  onClearAll: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [models, setModels] = useState<Array<{ id: number; name: string }>>([])

  const vehicleBrandId = selected.vehicle_brand ? Number(selected.vehicle_brand) : null

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()])
        if (!isMounted) return
        setCategories(cats)
        setBrands(brs)
      } catch {
        if (!isMounted) return
        setError('Impossible de charger les filtres.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!vehicleBrandId) {
      setModels([])
      return
    }
    let isMounted = true
    ;(async () => {
      try {
        setModelsLoading(true)
        setModelsError(null)
        const data = await fetchCarModels({ brand: vehicleBrandId })
        if (!isMounted) return
        setModels(data.map((m) => ({ id: m.id, name: m.name })))
      } catch {
        if (!isMounted) return
        setModelsError('Impossible de charger les modèles.')
      } finally {
        if (!isMounted) return
        setModelsLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [vehicleBrandId])

  const hasAnyFilter = useMemo(() => {
    return Boolean(
      selected.category ||
        selected.brand ||
        selected.price_min ||
        selected.price_max ||
        selected.compatible_car_models,
    )
  }, [selected])

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar-backdrop" onClick={onClose} />
      <div className="sidebar-content">
        <div className="sidebar-head">
          <div className="sidebar-title">Filtres</div>
          <div className="flex gap-2">
            <button className="btn" type="button" onClick={onClearAll} disabled={!hasAnyFilter}>
              Reset
            </button>
            {onClose && (
                <button className="btn sidebar-close" type="button" onClick={onClose}>
                    Fermer
                </button>
            )}
          </div>
        </div>

      {error ? <div className="sidebar-error">{error}</div> : null}

      <div className="filter-block">
        <div className="filter-title">Catégorie</div>
        <select
          className="filter-select"
          value={selected.category ?? ''}
          onChange={(e) => onChange({ category: e.target.value || undefined })}
          disabled={loading}
        >
          <option value="">Toutes</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-block">
        <div className="filter-title">Marque</div>
        <select
          className="filter-select"
          value={selected.brand ?? ''}
          onChange={(e) => onChange({ brand: e.target.value || undefined })}
          disabled={loading}
        >
          <option value="">Toutes</option>
          {brands.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <PriceRangeFilter
        value={{ min: selected.price_min, max: selected.price_max }}
        onApply={({ min, max }) => onChange({ price_min: min, price_max: max })}
        onClear={() => onChange({ price_min: undefined, price_max: undefined })}
      />

      <div className="filter-block">
        <div className="filter-title">Compatibilité véhicule</div>
        <div className="filter-stack">
          <select
            className="filter-select"
            value={selected.vehicle_brand ?? ''}
            onChange={(e) => {
              const nextBrand = e.target.value || undefined
              onChange({
                vehicle_brand: nextBrand,
                compatible_car_models: undefined,
              })
            }}
            disabled={loading}
          >
            <option value="">Marque</option>
            {brands.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selected.compatible_car_models ?? ''}
            onChange={(e) => onChange({ compatible_car_models: e.target.value || undefined })}
            disabled={!vehicleBrandId || modelsLoading || Boolean(modelsError)}
          >
            <option value="">Modèle</option>
            {models.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {modelsError ? <div className="sidebar-hint is-error">{modelsError}</div> : null}
      </div>
      </div>
    </aside>
  )
}


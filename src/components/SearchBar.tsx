import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { fetchBrands, fetchCarModels } from '../lib/catalogApi'

type Mode = 'reference' | 'vehicle'

type Option = { id: number; name: string }

// Simple in-memory cache to avoid refetching when SearchBar is mounted multiple times
// (e.g. header + homepage hero).
let cachedBrands: Option[] | null = null
let cachedBrandsPromise: Promise<Option[]> | null = null
const cachedModels = new Map<number, Option[]>()
const cachedModelsPromise = new Map<number, Promise<Option[]>>()

export function SearchBar({
  onSearch,
}: {
  onSearch: (params: { search?: string; brand?: number; carModel?: number }) => void
}) {
  const [mode, setMode] = useState<Mode>('reference')

  const [search, setSearch] = useState('')

  const [brandsLoading, setBrandsLoading] = useState(true)
  const [brandsError, setBrandsError] = useState<string | null>(null)
  const [brands, setBrands] = useState<Option[]>([])

  const [brandId, setBrandId] = useState<number | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [models, setModels] = useState<Option[]>([])
  const [modelId, setModelId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setBrandsLoading(true)
        setBrandsError(null)
        if (cachedBrands) {
          if (isMounted) setBrands(cachedBrands)
          return
        }
        if (!cachedBrandsPromise) {
          cachedBrandsPromise = fetchBrands().then((data) =>
            data.map((b) => ({ id: b.id, name: b.name })),
          )
        }
        const options = await cachedBrandsPromise
        if (!isMounted) return
        cachedBrands = options
        setBrands(options)
      } catch {
        if (!isMounted) return
        setBrandsError('Impossible de charger les marques.')
      } finally {
        if (!isMounted) return
        setBrandsLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!brandId) {
      setModels([])
      setModelId(null)
      return
    }
    let isMounted = true
    ;(async () => {
      try {
        setModelsLoading(true)
        setModelsError(null)
        const cached = cachedModels.get(brandId)
        if (cached) {
          if (isMounted) setModels(cached)
          return
        }
        let p = cachedModelsPromise.get(brandId)
        if (!p) {
          p = fetchCarModels({ brand: brandId }).then((data) =>
            data.map((m) => ({ id: m.id, name: m.name })),
          )
          cachedModelsPromise.set(brandId, p)
        }
        const options = await p
        if (!isMounted) return
        cachedModels.set(brandId, options)
        setModels(options)
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
  }, [brandId])

  const vehicleDisabled = useMemo(() => brandsLoading || Boolean(brandsError), [brandsLoading, brandsError])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'reference') {
      const q = search.trim()
      onSearch({ search: q || undefined })
      return
    }
    onSearch({
      brand: brandId ?? undefined,
      carModel: modelId ?? undefined,
    })
  }

  return (
    <div className="searchbar">
      <form className="searchbar-form" onSubmit={submit}>
        <div className="searchbar-modes">
          <label className="searchbar-mode-label">
            <input
              type="radio"
              name="search-mode"
              value="reference"
              checked={mode === 'reference'}
              onChange={(e) => {
                setMode(e.target.value as Mode)
                setSearch('')
              }}
              style={{ display: 'none' }}
            />
            <span className={`searchbar-mode-btn ${mode === 'reference' ? 'is-active' : ''}`}>
              Par référence
            </span>
          </label>
          <label className="searchbar-mode-label">
            <input
              type="radio"
              name="search-mode"
              value="vehicle"
              checked={mode === 'vehicle'}
              onChange={(e) => setMode(e.target.value as Mode)}
              style={{ display: 'none' }}
            />
            <span className={`searchbar-mode-btn ${mode === 'vehicle' ? 'is-active' : ''}`}>
              Par véhicule
            </span>
          </label>
        </div>

        {mode === 'reference' ? (
          <input
            className="searchbar-input"
            placeholder="Recherchez une pièce, marque, modèle... (ex: filtre à huile, 9812345)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            aria-label="Recherche par référence"
          />
        ) : (
          <>
            <select
              className="searchbar-select"
              value={brandId ?? ''}
              onChange={(e) =>
                setBrandId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={vehicleDisabled}
              aria-label="Sélectionnez une marque"
            >
              <option value="">— Marque —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              className="searchbar-select"
              value={modelId ?? ''}
              onChange={(e) =>
                setModelId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={!brandId || modelsLoading || Boolean(modelsError)}
              aria-label="Sélectionnez un modèle"
            >
              <option value="">— Modèle —</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          className="searchbar-submit"
          type="submit"
          disabled={mode === 'vehicle' && !brandId}
          aria-label={mode === 'reference' ? 'Rechercher des pièces' : 'Chercher les pièces compatibles'}
        >
          Rechercher
        </button>
      </form>

      {brandsError ? <div className="searchbar-hint is-error">Erreur: {brandsError}</div> : null}
      {modelsError ? <div className="searchbar-hint is-error">Erreur: {modelsError}</div> : null}
      {mode === 'reference' && search && (
        <div className="searchbar-hint">Résultats pour: <strong>{search}</strong></div>
      )}
    </div>
  )
}


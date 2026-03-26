import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { fetchBrands, fetchCarModels } from '../lib/catalogApi'

type Mode = 'reference' | 'vehicle'

export function SearchBar({
  onSearch,
}: {
  onSearch: (params: { search?: string; brand?: number; carModel?: number }) => void
}) {
  const [mode, setMode] = useState<Mode>('reference')

  const [search, setSearch] = useState('')

  const [brandsLoading, setBrandsLoading] = useState(true)
  const [brandsError, setBrandsError] = useState<string | null>(null)
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([])

  const [brandId, setBrandId] = useState<number | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [models, setModels] = useState<Array<{ id: number; name: string }>>([])
  const [modelId, setModelId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setBrandsLoading(true)
        setBrandsError(null)
        const data = await fetchBrands()
        if (!isMounted) return
        setBrands(data.map((b) => ({ id: b.id, name: b.name })))
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
        const data = await fetchCarModels({ brand: brandId })
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
      <div className="searchbar-tabs" role="tablist" aria-label="Type de recherche">
        <button
          type="button"
          className={`searchbar-tab ${mode === 'reference' ? 'is-active' : ''}`}
          onClick={() => setMode('reference')}
        >
          Par référence
        </button>
        <button
          type="button"
          className={`searchbar-tab ${mode === 'vehicle' ? 'is-active' : ''}`}
          onClick={() => setMode('vehicle')}
        >
          Par véhicule
        </button>
      </div>

      <form className="searchbar-form" onSubmit={submit}>
        {mode === 'reference' ? (
          <>
            <input
              className="searchbar-input"
              placeholder="Ex: 9812345, filtre à huile, plaquettes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Rechercher
            </button>
          </>
        ) : (
          <>
            <select
              className="searchbar-select"
              value={brandId ?? ''}
              onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : null)}
              disabled={vehicleDisabled}
            >
              <option value="">Marque</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              className="searchbar-select"
              value={modelId ?? ''}
              onChange={(e) => setModelId(e.target.value ? Number(e.target.value) : null)}
              disabled={!brandId || modelsLoading || Boolean(modelsError)}
            >
              <option value="">Modèle</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit" disabled={!brandId}>
              Rechercher
            </button>
          </>
        )}
      </form>

      {brandsError ? <div className="searchbar-hint is-error">{brandsError}</div> : null}
      {modelsError ? <div className="searchbar-hint is-error">{modelsError}</div> : null}
    </div>
  )
}


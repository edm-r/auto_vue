import { useEffect, useState } from 'react'

export function PriceRangeFilter({
  value,
  onApply,
  onClear,
}: {
  value: { min?: string; max?: string }
  onApply: (next: { min?: string; max?: string }) => void
  onClear: () => void
}) {
  const [min, setMin] = useState(value.min ?? '')
  const [max, setMax] = useState(value.max ?? '')

  useEffect(() => {
    setMin(value.min ?? '')
    setMax(value.max ?? '')
  }, [value.min, value.max])

  function apply() {
    onApply({
      min: min.trim() || undefined,
      max: max.trim() || undefined,
    })
  }

  return (
    <div className="filter-block">
      <div className="filter-title">Prix</div>
      <div className="filter-row">
        <input
          className="filter-input"
          inputMode="numeric"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <input
          className="filter-input"
          inputMode="numeric"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
      </div>
      <div className="filter-actions">
        <button className="btn btn-primary" type="button" onClick={apply}>
          Appliquer
        </button>
        <button className="btn" type="button" onClick={onClear}>
          Effacer
        </button>
      </div>
    </div>
  )
}


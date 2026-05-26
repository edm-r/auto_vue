export type ShippingMethod = 'standard' | 'express'

const methods: Array<{
  key: ShippingMethod
  label: string
  price: number
  eta: string
}> = [
  { key: 'standard', label: 'Standard', price: 3000, eta: '2–4 jours' },
  { key: 'express', label: 'Express', price: 6000, eta: '24–48h' },
]

export function ShippingMethodSelector({
  value,
  onChange,
}: {
  value: ShippingMethod | null
  onChange: (m: ShippingMethod, price: number) => void
}) {
  return (
    <div className="ship-grid">
      {methods.map((m) => (
        <button
          type="button"
          key={m.key}
          className={`ship-card ${value === m.key ? 'is-selected' : ''}`}
          onClick={() => onChange(m.key, m.price)}
        >
          <div className="ship-title">{m.label}</div>
          <div className="ship-meta">
            <span>${(Number(m.price) / 650).toFixed(2)}</span>
            <span>{m.eta}</span>
          </div>
        </button>
      ))}
    </div>
  )
}


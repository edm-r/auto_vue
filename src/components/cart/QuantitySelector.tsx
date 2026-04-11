export function QuantitySelector({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (next: number) => void
  disabled?: boolean
}) {
  return (
    <div className="qtysel">
      <button
        className="qtysel-btn"
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label="Diminuer"
      >
        −
      </button>
      <input
        className="qtysel-input"
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        disabled={disabled}
      />
      <button
        className="qtysel-btn"
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        aria-label="Augmenter"
      >
        +
      </button>
    </div>
  )
}


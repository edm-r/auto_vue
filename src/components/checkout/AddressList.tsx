import type { Address } from '../../checkout/checkoutApi'

export function AddressList({
  items,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  items: Address[]
  selectedId: number | null
  onSelect: (id: number) => void
  onEdit: (address: Address) => void
  onDelete?: (address: Address) => void
}) {
  return (
    <div className="addr-list">
      {items.map((a) => (
        <div
          key={a.id}
          className={`addr-card ${selectedId === a.id ? 'is-selected' : ''}`}
          onClick={() => onSelect(a.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSelect(a.id)
          }}
        >
          <div className="addr-head">
            <label className="addr-radio">
              <input
                type="radio"
                name="address"
                checked={selectedId === a.id}
                onChange={() => onSelect(a.id)}
              />
              <span className="addr-name">{a.full_name}</span>
            </label>
            <button
              className="btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(a)
              }}
            >
              Modifier
            </button>
            {onDelete ? (
              <button
                className="btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(a)
                }}
              >
                Supprimer
              </button>
            ) : null}
          </div>
          <div className="addr-body">
            <div className="addr-muted">{a.phone_number}</div>
            <div>{a.address_line}</div>
            <div className="addr-muted">
              {a.city} • {a.region} • {a.country}
            </div>
            {a.is_default ? <div className="addr-pill">Par défaut</div> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

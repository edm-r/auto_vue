export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-modal-head">
          <div className="admin-modal-title">{title}</div>
        </div>
        <div className="admin-modal-body">
          <div className="admin-muted" style={{ marginBottom: 14 }}>
            {message}
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={onConfirm}>
              {confirmLabel}
            </button>
            <button className="btn" type="button" onClick={onCancel}>
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


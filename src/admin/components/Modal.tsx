import type { ReactNode } from 'react'

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-modal-head">
          <div className="admin-modal-title">{title}</div>
          <button className="btn" type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  )
}


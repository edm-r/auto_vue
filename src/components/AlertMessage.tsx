export function AlertMessage({
  type,
  message,
}: {
  type: 'error' | 'success' | 'info'
  message: string
}) {
  return <div className={`alert alert--${type}`}>{message}</div>
}


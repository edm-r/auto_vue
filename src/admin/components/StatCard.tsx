export function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle?: string
}) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">{title}</div>
      <div className="admin-stat">{value}</div>
      {subtitle ? <div className="admin-muted">{subtitle}</div> : null}
    </div>
  )
}


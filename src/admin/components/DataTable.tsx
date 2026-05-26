import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  title: string
  render: (row: T) => ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  empty,
}: {
  columns: Array<Column<T>>
  rows: T[]
  empty?: ReactNode
}) {
  if (!rows.length) {
    return <div className="admin-muted">{empty ?? 'Aucune donnée.'}</div>
  }

  return (
    <div className="admin-tableWrap">
      <div className="admin-table">
        <div
          className="admin-tr admin-tr--head"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((c) => (
            <div key={c.key}>{c.title}</div>
          ))}
        </div>

        {rows.map((row, idx) => (
          <div
            key={idx}
            className="admin-tr"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((c) => (
              <div key={c.key}>{c.render(row)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}


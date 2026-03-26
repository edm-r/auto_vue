import { useEffect, useMemo, useState } from 'react'

import { AlertMessage } from '../../components/AlertMessage'
import { StatCard } from '../../admin/components/StatCard'
import { DataTable } from '../../admin/components/DataTable'
import type { AdminOrder } from '../../admin/adminApi'
import { computeBestSellers, computeSalesSeries, fetchAdminOrdersPage } from '../../admin/adminApi'

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0)
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '0'
  return value.toFixed(2)
}

function MiniBarChart({ points }: { points: Array<{ label: string; revenue: number }> }) {
  const max = Math.max(1, ...points.map((p) => p.revenue))
  return (
    <div className="admin-chart">
      {points.map((p) => (
        <div key={p.label} className="admin-bar">
          <div className="admin-bar-fill" style={{ height: `${Math.round((p.revenue / max) * 100)}%` }} />
          <div className="admin-bar-label">{p.label.slice(5)}</div>
        </div>
      ))}
    </div>
  )
}

async function fetchSomeOrders(maxPages: number): Promise<AdminOrder[]> {
  const out: AdminOrder[] = []
  for (let page = 1; page <= maxPages; page++) {
    const p = await fetchAdminOrdersPage({ page })
    out.push(...p.items)
    if (!p.next) break
  }
  return out
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchSomeOrders(10)
        if (!mounted) return
        setOrders(data)
      } catch {
        if (!mounted) return
        setError('Impossible de charger les statistiques.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const totals = orders.map((o) => Number(o.total ?? 0))
    const revenue = sum(totals)
    const paid = orders.filter((o) => ['paid', 'delivered', 'shipped', 'refunded'].includes(o.status))
    const paidRevenue = sum(paid.map((o) => Number(o.total ?? 0)))
    const series = computeSalesSeries(orders).slice(-14)
    const best = computeBestSellers(orders).slice(0, 8)
    return { revenue, paidRevenue, totalOrders: orders.length, series, best }
  }, [orders])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}

      {loading ? (
        <div className="skeleton-detail" />
      ) : (
        <>
          <div className="admin-grid">
            <StatCard title="Commandes" value={String(stats.totalOrders)} subtitle="Sur les 10 dernières pages API" />
            <StatCard title="CA (total)" value={formatMoney(stats.revenue)} subtitle="Somme des totaux" />
            <StatCard title="CA (payé)" value={formatMoney(stats.paidRevenue)} subtitle="paid/shipped/delivered" />
          </div>

          <div className="admin-card" style={{ marginTop: 14 }}>
            <div className="admin-card-title">Ventes (14 derniers jours)</div>
            {stats.series.length ? <MiniBarChart points={stats.series.map((p) => ({ label: p.label, revenue: p.revenue }))} /> : <div className="admin-muted">Aucune donnée.</div>}
          </div>

          <div className="admin-card" style={{ marginTop: 14 }}>
            <div className="admin-card-title">Produits les plus vendus</div>
            <DataTable
              rows={stats.best}
              columns={[
                { key: 'name', title: 'Produit', render: (r) => r.name },
                { key: 'qty', title: 'Qté', render: (r) => r.qty },
                { key: 'rev', title: 'CA', render: (r) => formatMoney(r.revenue) },
              ]}
              empty="Aucun produit."
            />
          </div>
        </>
      )}
    </div>
  )
}


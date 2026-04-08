import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { AlertMessage } from '../../components/AlertMessage'
import { StatCard } from '../../admin/components/StatCard'
import { DataTable } from '../../admin/components/DataTable'
import type { AdminOrder, AdminProduct, PromoCode } from '../../admin/adminApi'
import {
  computeBestSellers,
  computeSalesSeries,
  fetchAdminOrdersPage,
  fetchAdminProducts,
  fetchPromotions,
} from '../../admin/adminApi'

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0)
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '0'
  return value.toFixed(2)
}

function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill status-pill--${status}`}>{status}</span>
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
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([])
  const [lowStock, setLowStock] = useState<AdminProduct[]>([])
  const [promos, setPromos] = useState<PromoCode[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const [allOrders, firstPage, stockPage, promoList] = await Promise.all([
          fetchSomeOrders(6),
          fetchAdminOrdersPage({ page: 1 }),
          fetchAdminProducts({ page: 1, ordering: 'stock_quantity', is_active: 'all' }),
          fetchPromotions(),
        ])

        if (!mounted) return
        setOrders(allOrders)
        setRecentOrders(firstPage.items.slice(0, 8))
        setLowStock(stockPage.items.slice(0, 8))
        setPromos(promoList)
      } catch {
        if (!mounted) return
        setError('Impossible de charger le dashboard admin.')
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
    const activePromos = promos.filter((p) => p.is_active)
    const lowStockCount = lowStock.filter((p) => Number(p.stock_quantity ?? 0) <= 3).length
    return { revenue, paidRevenue, totalOrders: orders.length, series, best, activePromos, lowStockCount }
  }, [orders, promos, lowStock])

  return (
    <div className="admin-section">
      {error ? <AlertMessage type="error" message={error} /> : null}

      {loading ? (
        <div className="skeleton-detail" />
      ) : (
        <>
          <div className="admin-grid admin-grid--4">
            <StatCard title="Commandes" value={String(stats.totalOrders)} subtitle="Échantillon (6 pages API)" />
            <StatCard title="CA (total)" value={formatMoney(stats.revenue)} subtitle="Somme des totaux" />
            <StatCard title="CA (payé)" value={formatMoney(stats.paidRevenue)} subtitle="paid/shipped/delivered" />
            <StatCard title="Promos actives" value={String(stats.activePromos.length)} subtitle="Codes promo actifs" />
          </div>

          <div className="admin-card">
            <div className="admin-card-title">Ventes (14 derniers jours)</div>
            {stats.series.length ? (
              <MiniBarChart points={stats.series.map((p) => ({ label: p.label, revenue: p.revenue }))} />
            ) : (
              <div className="admin-muted">Aucune donnée.</div>
            )}
          </div>

          <div className="admin-split">
            <div className="admin-card">
              <div className="admin-card-title">Commandes récentes</div>
              <DataTable
                rows={recentOrders}
                columns={[
                  { key: 'id', title: 'ID', render: (o) => <Link to={`/admin/orders/${o.id}`}>#{o.id}</Link> },
                  { key: 'user', title: 'Client', render: (o) => `#${o.user}` },
                  { key: 'total', title: 'Total', render: (o) => o.total },
                  { key: 'status', title: 'Statut', render: (o) => <StatusPill status={o.status} /> },
                ]}
                empty="Aucune commande."
              />
              <div className="admin-cardFoot">
                <Link className="btn" to="/admin/orders">
                  Voir toutes les commandes
                </Link>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-title">Stock faible</div>
              <div className="admin-muted" style={{ marginBottom: 10 }}>
                Produits triés par stock (les plus bas en haut). {stats.lowStockCount ? `⚠ ${stats.lowStockCount} critique(s).` : ''}
              </div>
              <DataTable
                rows={lowStock}
                columns={[
                  { key: 'id', title: 'ID', render: (p) => `#${p.id}` },
                  { key: 'name', title: 'Produit', render: (p) => p.name },
                  { key: 'stock', title: 'Stock', render: (p) => <span className={Number(p.stock_quantity ?? 0) <= 3 ? 'admin-stockLow' : ''}>{p.stock_quantity ?? 0}</span> },
                ]}
                empty="Aucun produit."
              />
              <div className="admin-cardFoot">
                <Link className="btn" to="/admin/inventory">
                  Gérer le stock
                </Link>
              </div>
            </div>
          </div>

          <div className="admin-card">
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


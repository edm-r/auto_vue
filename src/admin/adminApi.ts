import { api } from '../lib/api'
import { unwrapPage, unwrapResults, type Page } from '../lib/pagination'

export type AdminOrderItem = {
  id: number
  product_id: number
  product_name?: string
  quantity: number
  unit_price: string
  total_price: string
}

export type AdminOrder = {
  id: number
  user: number
  status: string
  subtotal: string
  tax: string
  shipping_cost: string
  shipping_address_id?: number | null
  total: string
  created_at: string
  updated_at: string
  items: AdminOrderItem[]
}

export async function fetchAdminOrdersPage(params: { page?: number } = {}): Promise<Page<AdminOrder>> {
  const res = await api.get('/orders/', { params })
  return unwrapPage<AdminOrder>(res.data)
}

export async function fetchAdminOrder(id: string | number): Promise<AdminOrder> {
  const res = await api.get(`/orders/${id}/`)
  return res.data as AdminOrder
}

export async function updateOrderStatus(orderId: number, status: string): Promise<AdminOrder> {
  const res = await api.post(`/orders/${orderId}/update-status/`, { status })
  return res.data as AdminOrder
}

export type AdminProduct = {
  id: number
  name: string
  sku?: string | null
  category?: number | null
  category_name?: string | null
  brand?: number | null
  brand_name?: string | null
  price: string
  stock_quantity?: number
  is_in_stock?: boolean
  rating?: string | number | null
  is_featured?: boolean
  is_active?: boolean
}

export async function fetchAdminProducts(params: {
  search?: string
  is_active?: string
  ordering?: string
  page?: number
} = {}): Promise<Page<AdminProduct>> {
  const res = await api.get('/products/', {
    params: { is_active: params.is_active ?? 'all', search: params.search, ordering: params.ordering, page: params.page },
  })
  return unwrapPage<AdminProduct>(res.data)
}

export type AdminProductUpsert = {
  name: string
  description?: string
  sku?: string
  category?: number | null
  brand?: number | null
  price: string
  stock_quantity: number
  is_active?: boolean
  is_featured?: boolean
}

export async function createProduct(payload: AdminProductUpsert) {
  const res = await api.post('/products/', payload)
  return res.data as unknown
}

export async function updateProduct(productId: number, payload: Partial<AdminProductUpsert>) {
  const res = await api.patch(`/products/${productId}/`, payload)
  return res.data as unknown
}

export async function deleteProduct(productId: number): Promise<void> {
  await api.delete(`/products/${productId}/`)
}

export type AdminUser = {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  date_joined?: string
  is_staff?: boolean
  is_superuser?: boolean
}

export async function fetchCustomersPage(params: { page?: number } = {}): Promise<Page<AdminUser>> {
  const res = await api.get('/auth/users/', { params })
  return unwrapPage<AdminUser>(res.data)
}

export type PromoCode = {
  id: number
  code: string
  discount_type: 'percent' | 'fixed'
  value: string
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PromoCodeUpsert = {
  code: string
  discount_type: 'percent' | 'fixed'
  value: string
  expires_at: string | null
  is_active: boolean
}

export async function fetchPromotions(): Promise<PromoCode[]> {
  const res = await api.get('/promotions/')
  return unwrapResults<PromoCode>(res.data)
}

export async function createPromotion(payload: PromoCodeUpsert): Promise<PromoCode> {
  const res = await api.post('/promotions/', payload)
  return res.data as PromoCode
}

export async function updatePromotion(id: number, payload: Partial<PromoCodeUpsert>): Promise<PromoCode> {
  const res = await api.patch(`/promotions/${id}/`, payload)
  return res.data as PromoCode
}

export async function deletePromotion(id: number): Promise<void> {
  await api.delete(`/promotions/${id}/`)
}

export type SalesPoint = { label: string; revenue: number; orders: number }

export function computeSalesSeries(orders: AdminOrder[]): SalesPoint[] {
  const map = new Map<string, SalesPoint>()
  for (const o of orders) {
    const date = new Date(o.created_at)
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const current = map.get(label) ?? { label, revenue: 0, orders: 0 }
    current.orders += 1
    current.revenue += Number(o.total ?? 0)
    map.set(label, current)
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

export function computeBestSellers(orders: AdminOrder[]) {
  const map = new Map<number, { product_id: number; name: string; qty: number; revenue: number }>()
  for (const o of orders) {
    for (const it of o.items ?? []) {
      const current = map.get(it.product_id) ?? { product_id: it.product_id, name: it.product_name ?? `Produit #${it.product_id}`, qty: 0, revenue: 0 }
      current.qty += it.quantity
      current.revenue += Number(it.total_price ?? 0)
      map.set(it.product_id, current)
    }
  }
  return Array.from(map.values()).sort((a, b) => b.qty - a.qty)
}

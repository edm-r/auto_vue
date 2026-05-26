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

function toFormData(payload: Record<string, unknown>) {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value == null) return
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v == null) return
        fd.append(key, v instanceof File ? v : String(v))
      })
      return
    }
    fd.append(key, value instanceof File ? value : String(value))
  })
  return fd
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
  compatible_car_models_ids?: number[]
  price: string
  cost?: string | null
  stock_quantity: number
  low_stock_alert?: number
  weight?: string | null
  dimensions?: string
  warranty_months?: number
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

export type AdminProductDetail = {
  id: number
  name: string
  description?: string | null
  sku?: string | null
  category?: number | null
  brand?: number | null
  compatible_car_models?: Array<{ id: number }>
  compatible_car_models_ids?: number[]
  price: string
  cost?: string | null
  stock_quantity: number
  low_stock_alert?: number
  weight?: string | null
  dimensions?: string | null
  warranty_months?: number
  is_active?: boolean
  is_featured?: boolean
}

export async function fetchAdminProductDetail(id: number | string): Promise<AdminProductDetail> {
  const res = await api.get(`/products/${id}/`)
  return res.data as AdminProductDetail
}

export type AdminCategory = {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  image?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
  product_count?: number
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const res = await api.get('/products/categories/')
  return unwrapResults<AdminCategory>(res.data)
}

export async function createAdminCategory(payload: {
  name: string
  description?: string
  is_active?: boolean
  image?: File | null
}): Promise<AdminCategory> {
  const res = await api.post('/products/categories/', toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data as AdminCategory
}

export async function updateAdminCategory(id: number, payload: Partial<{
  name: string
  description: string
  is_active: boolean
  image: File | null
}>): Promise<AdminCategory> {
  const hasFile = payload.image instanceof File
  const body = hasFile ? toFormData(payload as Record<string, unknown>) : payload
  const res = await api.patch(`/products/categories/${id}/`, body, hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  return res.data as AdminCategory
}

export async function deleteAdminCategory(id: number): Promise<void> {
  await api.delete(`/products/categories/${id}/`)
}

export type AdminBrand = {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  logo?: string | null
  country?: string
  website?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export async function fetchAdminBrands(): Promise<AdminBrand[]> {
  const res = await api.get('/products/brands/')
  return unwrapResults<AdminBrand>(res.data)
}

export async function createAdminBrand(payload: {
  name: string
  description?: string
  country?: string
  website?: string
  is_active?: boolean
  logo?: File | null
}): Promise<AdminBrand> {
  const res = await api.post('/products/brands/', toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data as AdminBrand
}

export async function updateAdminBrand(id: number, payload: Partial<{
  name: string
  description: string
  country: string
  website: string
  is_active: boolean
  logo: File | null
}>): Promise<AdminBrand> {
  const hasFile = payload.logo instanceof File
  const body = hasFile ? toFormData(payload as Record<string, unknown>) : payload
  const res = await api.patch(`/products/brands/${id}/`, body, hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  return res.data as AdminBrand
}

export async function deleteAdminBrand(id: number): Promise<void> {
  await api.delete(`/products/brands/${id}/`)
}

export type AdminCarModel = {
  id: number
  brand: number
  brand_detail?: AdminBrand
  name: string
  slug?: string | null
  year_start: number
  year_end?: number | null
  body_type?: string
  image?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export async function fetchAdminCarModels(params: { brand?: number; is_active?: string; search?: string } = {}): Promise<AdminCarModel[]> {
  const res = await api.get('/products/car-models/', { params })
  return unwrapResults<AdminCarModel>(res.data)
}

export async function createAdminCarModel(payload: {
  brand: number
  name: string
  year_start: number
  year_end?: number | null
  body_type?: string
  is_active?: boolean
  image?: File | null
}): Promise<AdminCarModel> {
  const res = await api.post('/products/car-models/', toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data as AdminCarModel
}

export async function updateAdminCarModel(id: number, payload: Partial<{
  brand: number
  name: string
  year_start: number
  year_end: number | null
  body_type: string
  is_active: boolean
  image: File | null
}>): Promise<AdminCarModel> {
  const hasFile = payload.image instanceof File
  const body = hasFile ? toFormData(payload as Record<string, unknown>) : payload
  const res = await api.patch(`/products/car-models/${id}/`, body, hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  return res.data as AdminCarModel
}

export async function deleteAdminCarModel(id: number): Promise<void> {
  await api.delete(`/products/car-models/${id}/`)
}

export type AdminProductImage = {
  id: number
  product: number
  image: string
  alt_text?: string | null
  is_primary?: boolean
  display_order?: number
  created_at?: string
}

export async function fetchAdminProductImages(params: { product_id?: number } = {}): Promise<AdminProductImage[]> {
  const res = await api.get('/products/images/', { params })
  return unwrapResults<AdminProductImage>(res.data)
}

export async function createAdminProductImage(payload: {
  product: number
  image: File
  alt_text?: string
  is_primary?: boolean
  display_order?: number
}): Promise<AdminProductImage> {
  const res = await api.post('/products/images/', toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data as AdminProductImage
}

export async function updateAdminProductImage(id: number, payload: Partial<{
  alt_text: string
  is_primary: boolean
  display_order: number
}>): Promise<AdminProductImage> {
  const res = await api.patch(`/products/images/${id}/`, payload)
  return res.data as AdminProductImage
}

export async function deleteAdminProductImage(id: number): Promise<void> {
  await api.delete(`/products/images/${id}/`)
}

export type AdminProductVariant = {
  id: number
  product: number
  name: string
  sku: string
  attribute_name: string
  attribute_value: string
  price_modifier: string
  final_price?: string
  stock_quantity: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export async function fetchAdminProductVariants(params: { product_id?: number; search?: string; is_active?: string } = {}): Promise<AdminProductVariant[]> {
  const res = await api.get('/products/variants/', { params })
  return unwrapResults<AdminProductVariant>(res.data)
}

export async function createAdminProductVariant(payload: {
  product: number
  name: string
  sku: string
  attribute_name: string
  attribute_value: string
  price_modifier?: string
  stock_quantity: number
  is_active?: boolean
}): Promise<AdminProductVariant> {
  const res = await api.post('/products/variants/', payload)
  return res.data as AdminProductVariant
}

export async function updateAdminProductVariant(id: number, payload: Partial<{
  name: string
  sku: string
  attribute_name: string
  attribute_value: string
  price_modifier: string
  stock_quantity: number
  is_active: boolean
}>): Promise<AdminProductVariant> {
  const res = await api.patch(`/products/variants/${id}/`, payload)
  return res.data as AdminProductVariant
}

export async function deleteAdminProductVariant(id: number): Promise<void> {
  await api.delete(`/products/variants/${id}/`)
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

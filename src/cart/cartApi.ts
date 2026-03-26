import { api } from '../lib/api'

export type ApiCartItem = {
  id: number
  product_id: number
  product_name: string
  product_primary_image?: string | null
  product_primary_image_alt_text?: string | null
  product_stock_quantity?: number
  product_is_in_stock?: boolean
  quantity: number
  unit_price: string
  total_price: string
}

export type ApiCart = {
  id: number
  items: ApiCartItem[]
  subtotal: string
  total: string
}

export async function fetchCart(): Promise<ApiCart> {
  const res = await api.get('/cart/')
  return res.data as ApiCart
}

export async function addCartItem(params: { productId: number; quantity: number }): Promise<ApiCartItem> {
  const res = await api.post('/cart/items/', {
    product_id: params.productId,
    quantity: params.quantity,
  })
  return res.data as ApiCartItem
}

export async function updateCartItem(params: { itemId: number; quantity: number }): Promise<ApiCartItem> {
  const res = await api.patch(`/cart/items/${params.itemId}/`, { quantity: params.quantity })
  return res.data as ApiCartItem
}

export async function deleteCartItem(itemId: number): Promise<void> {
  await api.delete(`/cart/items/${itemId}/`)
}

export type PromoValidation = {
  valid: boolean
  code?: string
  detail?: string
  discount_percent?: string
  discount_amount?: string
  subtotal?: string
  total_after_discount?: string
}

export async function validatePromo(code: string): Promise<PromoValidation> {
  const res = await api.post('/cart/promo/validate/', { code })
  return res.data as PromoValidation
}


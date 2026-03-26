import { api } from '../lib/api'

export type Address = {
  id: number
  full_name: string
  phone_number: string
  address_line: string
  city: string
  region: string
  country: string
  postal_code: string
  is_default: boolean
}

export async function fetchAddresses(): Promise<Address[]> {
  const res = await api.get('/profile/addresses/')
  return Array.isArray(res.data) ? (res.data as Address[]) : (res.data?.results as Address[]) ?? []
}

export async function createAddress(payload: Omit<Address, 'id'>): Promise<Address> {
  const res = await api.post('/profile/addresses/', payload)
  return res.data as Address
}

export async function updateAddress(id: number, payload: Partial<Omit<Address, 'id'>>): Promise<Address> {
  const res = await api.patch(`/profile/addresses/${id}/`, payload)
  return res.data as Address
}

export type Order = {
  id: number
  status: string
  subtotal: string
  tax: string
  shipping_cost: string
  total: string
  created_at: string
  items: Array<{
    id: number
    product_id: number
    product_name: string
    quantity: number
    unit_price: string
    total_price: string
  }>
}

export async function createOrderFromCart(params: {
  addressId: number
  shippingCost: string
  taxRate?: string
}): Promise<Order> {
  const res = await api.post('/cart/checkout/', {
    address_id: params.addressId,
    shipping_cost: params.shippingCost,
    tax_rate: params.taxRate ?? '0.0000',
  })
  return res.data as Order
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const res = await api.get(`/profile/orders/${orderId}/`)
  return res.data as Order
}

export type StripeSession = {
  checkout_url: string
  session_id: string
  transaction_id: number
}

export async function createStripeCheckoutSession(params: {
  orderId: number
  successUrl: string
  cancelUrl: string
}): Promise<StripeSession> {
  const res = await api.post('/payments/create-session/', {
    order_id: params.orderId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })
  return res.data as StripeSession
}

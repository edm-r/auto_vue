import { api } from '../lib/api'
import { unwrapPage, unwrapResults } from '../lib/pagination'

export type MeUser = {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  date_joined?: string
}

export async function fetchMeUser(): Promise<MeUser> {
  const res = await api.get('/auth/users/me/')
  return res.data as MeUser
}

export async function updateMeUser(payload: Partial<Pick<MeUser, 'email' | 'first_name' | 'last_name'>>): Promise<MeUser> {
  const res = await api.put('/auth/users/me/', payload)
  const data = res.data as { user?: MeUser }
  return (data.user ?? (await fetchMeUser())) as MeUser
}

export async function changePassword(payload: {
  old_password: string
  new_password: string
  new_password2: string
}): Promise<void> {
  await api.post('/auth/users/change_password/', payload)
}

export type UserProfile = {
  phone_number: string
  avatar?: string | null
  created_at?: string
  updated_at?: string
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await api.get('/profile/me/')
  return res.data as UserProfile
}

export async function updateUserProfile(payload: Partial<Pick<UserProfile, 'phone_number'>>): Promise<UserProfile> {
  const res = await api.put('/profile/me/', payload)
  return res.data as UserProfile
}

export type OrderItem = {
  id: number
  product: number
  product_name?: string
  quantity: number
  unit_price: string
  total_price: string
}

export type Order = {
  id: number
  status: string
  subtotal: string
  tax: string
  shipping_cost: string
  shipping_address_id?: number | null
  total: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export async function fetchOrdersPage(params: { page?: number } = {}) {
  const res = await api.get('/profile/orders/', { params })
  return unwrapPage<Order>(res.data)
}

export async function fetchOrder(orderId: string | number): Promise<Order> {
  const res = await api.get(`/profile/orders/${orderId}/`)
  return res.data as Order
}

export type WishList = {
  product_ids: number[]
  created_at: string
}

export async function fetchWishlist(): Promise<WishList> {
  const res = await api.get('/profile/wishlist/')
  return res.data as WishList
}

export async function addToWishlist(productId: number): Promise<WishList> {
  const res = await api.post('/profile/wishlist/add/', { product_id: productId })
  return res.data as WishList
}

export async function removeFromWishlist(productId: number): Promise<WishList> {
  const res = await api.post('/profile/wishlist/remove/', { product_id: productId })
  return res.data as WishList
}

export type VehiclePreference = {
  id: number
  brand: string
  model: string
  year: number | null
  engine_type: string
  created_at: string
}

export async function fetchVehicles(): Promise<VehiclePreference[]> {
  const res = await api.get('/profile/vehicles/')
  return unwrapResults<VehiclePreference>(res.data)
}

export async function createVehicle(payload: Omit<VehiclePreference, 'id' | 'created_at'>): Promise<VehiclePreference> {
  const res = await api.post('/profile/vehicles/', payload)
  return res.data as VehiclePreference
}

export async function updateVehicle(id: number, payload: Partial<Omit<VehiclePreference, 'id' | 'created_at'>>): Promise<VehiclePreference> {
  const res = await api.patch(`/profile/vehicles/${id}/`, payload)
  return res.data as VehiclePreference
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`/profile/vehicles/${id}/`)
}

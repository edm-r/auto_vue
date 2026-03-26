export type CartItem = {
  productId: number
  name: string
  price: string
  quantity: number
}

const STORAGE_KEY = 'auto_vue_cart_v1'

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1) {
  const cart = getCart()
  const existing = cart.find((c) => c.productId === item.productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ ...item, quantity })
  }
  setCart(cart)
}


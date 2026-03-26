import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useAuth } from '../auth/AuthContext'
import type { ProductListItem } from '../lib/catalogApi'
import {
  addToCart as mirrorAdd,
  getCart as getMirror,
  removeFromCart as mirrorRemove,
  setCart as setMirror,
  setQuantity as mirrorSetQuantity,
} from './cartStorage'
import type { CartItem as MirrorItem } from './cartStorage'
import {
  addCartItem,
  deleteCartItem,
  fetchCart,
  updateCartItem,
  validatePromo,
} from './cartApi'
import type { ApiCart, ApiCartItem, PromoValidation } from './cartApi'

type CartContextValue = {
  cart: ApiCart | null
  isLoading: boolean
  error: string | null
  promo: PromoValidation | null
  refresh: () => Promise<void>
  addProduct: (product: Pick<ProductListItem, 'id' | 'name' | 'price'>, quantity?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearPromo: () => void
  applyPromo: (code: string) => Promise<PromoValidation>
}

const CartContext = createContext<CartContextValue | null>(null)

function mirrorFromApi(items: ApiCartItem[]): MirrorItem[] {
  return items.map((i) => ({
    productId: i.product_id,
    name: i.product_name,
    price: i.unit_price,
    quantity: i.quantity,
  }))
}

function mergeMirrorIntoApiCart(apiCart: ApiCart, mirror: MirrorItem[]) {
  if (!mirror.length) {
    return { hadMirrorToPush: false, itemsToPush: [] as MirrorItem[] }
  }

  const apiByProduct = new Map(apiCart.items.map((i) => [i.product_id, i]))
  const itemsToPush: MirrorItem[] = []

  for (const m of mirror) {
    const apiItem = apiByProduct.get(m.productId)
    if (!apiItem) {
      itemsToPush.push(m)
      continue
    }
    if (m.quantity > apiItem.quantity) {
      itemsToPush.push({ ...m, quantity: m.quantity - apiItem.quantity })
    }
  }

  return { hadMirrorToPush: itemsToPush.length > 0, itemsToPush }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  const [cart, setCart] = useState<ApiCart | null>(null)
  const [promo, setPromo] = useState<PromoValidation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      setError(null)
      const apiCart = await fetchCart()
      setCart(apiCart)
      setMirror(mirrorFromApi(apiCart.items))
    } catch {
      // Offline fallback: show mirrored cart without totals.
      setError('Impossible de charger le panier.')
      const mirror = getMirror()
      const subtotal = mirror.reduce((acc, i) => acc + Number(i.price || 0) * i.quantity, 0)
      setCart({
        id: 0,
        items: mirror.map((m, idx) => ({
          id: -idx - 1,
          product_id: m.productId,
          product_name: m.name,
          quantity: m.quantity,
          unit_price: m.price,
          total_price: String(Number(m.price) * m.quantity),
        })),
        subtotal: String(subtotal),
        total: String(subtotal),
      })
    }
  }

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const apiCart = await fetchCart()

        const mirror = getMirror()
        const merge = mergeMirrorIntoApiCart(apiCart, mirror)

        if (merge.hadMirrorToPush) {
          for (const item of merge.itemsToPush) {
            await addCartItem({ productId: item.productId, quantity: item.quantity })
          }
          const next = await fetchCart()
          if (!isMounted) return
          setCart(next)
          setMirror(mirrorFromApi(next.items))
        } else {
          if (!isMounted) return
          setCart(apiCart)
          setMirror(mirrorFromApi(apiCart.items))
        }
      } catch {
        if (!isMounted) return
        setError('Impossible de charger le panier.')
      } finally {
        if (!isMounted) return
        setIsLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    // When auth changes, backend merges carts; refresh to reflect it.
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  async function addProduct(product: Pick<ProductListItem, 'id' | 'name' | 'price'>, quantity = 1) {
    // Mirror for instant persistence (even if network fails).
    mirrorAdd({ productId: product.id, name: product.name, price: product.price }, quantity)
    try {
      await addCartItem({ productId: product.id, quantity })
      await refresh()
    } catch {
      setError('Impossible d’ajouter au panier.')
    }
  }

  async function updateItem(itemId: number, quantity: number) {
    const nextQty = Math.max(1, quantity)
    const item = cart?.items.find((i) => i.id === itemId)
    if (item) {
      mirrorSetQuantity(item.product_id, nextQty)
    }
    try {
      await updateCartItem({ itemId, quantity: nextQty })
      await refresh()
    } catch {
      setError('Impossible de mettre à jour la quantité.')
    }
  }

  async function removeItem(itemId: number) {
    const item = cart?.items.find((i) => i.id === itemId)
    if (item) {
      mirrorRemove(item.product_id)
    }
    try {
      await deleteCartItem(itemId)
      await refresh()
    } catch {
      setError('Impossible de supprimer cet article.')
    }
  }

  async function applyPromo(code: string) {
    const res = await validatePromo(code)
    setPromo(res)
    return res
  }

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      error,
      promo,
      refresh,
      addProduct,
      updateItem,
      removeItem,
      clearPromo: () => setPromo(null),
      applyPromo,
    }),
    [cart, isLoading, error, promo],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

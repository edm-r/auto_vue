export type CheckoutDraft = {
  step: 1 | 2 | 3
  addressId?: number
  shippingMethod?: 'standard' | 'express'
  shippingCost?: number
  orderId?: number
}

const KEY = 'auto_vue_checkout_v1'

export function loadCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as CheckoutDraft
  } catch {
    return null
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  localStorage.setItem(KEY, JSON.stringify(draft))
}

export function clearCheckoutDraft() {
  localStorage.removeItem(KEY)
}


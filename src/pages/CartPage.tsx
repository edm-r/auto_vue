import { Link, useNavigate } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import { CartItemRow } from '../components/cart/CartItemRow'
import { CartSummary } from '../components/cart/CartSummary'
import { PromoCodeInput } from '../components/cart/PromoCodeInput'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'

export function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cart, isLoading, error } = useCart()

  const items = cart?.items ?? []
  const shippingCost = items.length ? 3000 : 0

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Panier</h1>
          <div className="page-subtitle">Vérifie tes articles avant la commande.</div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/products">
            Continuer les achats
          </Link>
        </div>
      </div>

      {error ? <AlertMessage type="error" message={error} /> : null}

      {isLoading ? (
        <div className="skeleton-detail" />
      ) : !items.length ? (
        <div className="empty">
          Ton panier est vide. <Link to="/products">Voir les produits</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((i) => (
              <CartItemRow key={i.id} item={i} />
            ))}
          </div>

          <div className="cart-side">
            <PromoCodeInput />
            <CartSummary
              shippingCost={shippingCost}
              isCheckoutDisabled={!items.length}
              onCheckout={() => {
                if (!isAuthenticated) {
                  navigate('/login', {
                    state: {
                      message: 'Connecte-toi pour passer la commande.',
                      from: '/checkout',
                    },
                  })
                  return
                }
                navigate('/checkout')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}


import { Link } from 'react-router-dom'

export function CheckoutPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Checkout</h1>
          <div className="page-subtitle">Étape suivante: adresse + paiement.</div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/cart">
            Retour panier
          </Link>
        </div>
      </div>

      <div className="empty">Checkout à implémenter (adresse, livraison, paiement).</div>
    </div>
  )
}


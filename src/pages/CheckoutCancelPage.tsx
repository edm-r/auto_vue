import { Link, useSearchParams } from 'react-router-dom'

export function CheckoutCancelPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Paiement annulé</h1>
          <div className="page-subtitle">Tu peux réessayer quand tu veux.</div>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/cart">
            Retour panier
          </Link>
          <Link className="btn btn-primary" to="/checkout">
            Réessayer
          </Link>
        </div>
      </div>

      <div className="empty">
        {orderId ? (
          <div style={{ marginBottom: 10 }}>Commande associée: #{orderId}</div>
        ) : null}
        <div>Si ta carte a été débitée, contacte le support.</div>
      </div>
    </div>
  )
}


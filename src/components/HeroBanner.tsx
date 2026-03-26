import { Link } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { useAuth } from '../auth/AuthContext'

export function HeroBanner({
  onSearch,
}: {
  onSearch: (params: { search?: string; brand?: number; carModel?: number }) => void
}) {
  const { user, isAuthenticated } = useAuth()
  const isAdmin = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser))
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-badge">Pièces auto • Livraison rapide</div>
        <h1 className="hero-title">Trouve la bonne pièce, du premier coup</h1>
        <p className="hero-subtitle">
          Recherche par référence produit ou par véhicule. Commande en quelques clics.
        </p>
        <SearchBar onSearch={onSearch} />
        <div className="actions">
          <Link className="btn btn-primary" to="/products">
            Catalogue
          </Link>
          <Link className="btn" to="/cart">
            Panier
          </Link>
          <Link className="btn" to="/account">
            Mon compte
          </Link>
          {isAdmin ? (
            <Link className="btn" to="/admin/dashboard">
              Admin
            </Link>
          ) : null}
        </div>
        <div className="hero-trust">
          <div className="trust-item">Paiement sécurisé</div>
          <div className="trust-item">Support réactif</div>
          <div className="trust-item">Retour facile</div>
        </div>
      </div>
    </section>
  )
}

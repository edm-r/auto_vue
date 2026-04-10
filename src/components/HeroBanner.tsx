import { Link } from 'react-router-dom'

import { SearchBar } from './SearchBar'

export function HeroBanner({
  onSearch,
}: {
  onSearch: (params: { search?: string; brand?: number; carModel?: number }) => void
}) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-badge">Pièces automobiles — Livraison rapide</div>
          <h1 className="hero-title">Trouvez la bonne pièce,<br />du premier coup.</h1>
          <p className="hero-subtitle">
            Recherche par référence produit ou par véhicule. Des milliers de pièces disponibles, livrées directement chez vous.
          </p>

          <div className="hero-search">
            <SearchBar onSearch={onSearch} />
          </div>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/products">
              Parcourir le catalogue
            </Link>
          </div>

          <div className="hero-trust">
            <span className="trust-item">Paiement sécurisé</span>
            <span className="trust-item">Support 7j/7</span>
            <span className="trust-item">Retour sous 30 jours</span>
          </div>
        </div>
      </div>
    </section>
  )
}



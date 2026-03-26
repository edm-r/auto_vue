import { SearchBar } from './SearchBar'

export function HeroBanner({
  onSearch,
}: {
  onSearch: (params: { search?: string; brand?: number; carModel?: number }) => void
}) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-badge">Pièces auto • Livraison rapide</div>
        <h1 className="hero-title">Trouve la bonne pièce, du premier coup</h1>
        <p className="hero-subtitle">
          Recherche par référence produit ou par véhicule. Commande en quelques clics.
        </p>
        <SearchBar onSearch={onSearch} />
        <div className="hero-trust">
          <div className="trust-item">Paiement sécurisé</div>
          <div className="trust-item">Support réactif</div>
          <div className="trust-item">Retour facile</div>
        </div>
      </div>
    </section>
  )
}


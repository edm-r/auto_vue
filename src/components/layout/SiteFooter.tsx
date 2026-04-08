import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <div className="site-footer__title">AutoVue</div>
            <div className="site-footer__muted">
              Pièces auto — recherche rapide, paiement sécurisé, livraison fiable.
            </div>
          </div>

          <div>
            <div className="site-footer__heading">Boutique</div>
            <Link className="site-footer__link" to="/products">
              Produits
            </Link>
            <Link className="site-footer__link" to="/cart">
              Panier
            </Link>
            <Link className="site-footer__link" to="/checkout">
              Commander
            </Link>
          </div>

          <div>
            <div className="site-footer__heading">Compte</div>
            <Link className="site-footer__link" to="/account/profile">
              Profil
            </Link>
            <Link className="site-footer__link" to="/account/orders">
              Commandes
            </Link>
            <Link className="site-footer__link" to="/account/addresses">
              Adresses
            </Link>
          </div>

          <div>
            <div className="site-footer__heading">Support</div>
            <a className="site-footer__link" href="mailto:support@autovue.local">
              support@autovue.local
            </a>
            <div className="site-footer__muted">Lun–Sam • 8h–18h</div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div className="site-footer__muted">© {new Date().getFullYear()} AutoVue</div>
          <div className="site-footer__muted">Paiement sécurisé • Retours faciles</div>
        </div>
      </div>
    </footer>
  )
}


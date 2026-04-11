import { Link } from 'react-router-dom'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {/* Main grid */}
        <div className="site-footer__grid">
          {/* Column 1: About */}
          <div className="site-footer__column">
            <div className="site-footer__logo">
              <span className="site-footer__logoMark">AV</span>
              <span className="site-footer__logoText">AutoVue</span>
            </div>
            <p className="site-footer__about">
              Votre partenaire de confiance pour les pièces automobiles de qualité. Livraison rapide, 
              service client réactif, et satisfation garantie.
            </p>
            <div className="site-footer__contact">
              <div className="site-footer__contactItem">
                <span className="site-footer__label">Téléphone</span>
                <a href="tel:+33123456789">+33 (0)1 23 45 67 89</a>
              </div>
              <div className="site-footer__contactItem">
                <span className="site-footer__label">Email</span>
                <a href="mailto:support@autovue.fr">support@autovue.fr</a>
              </div>
              <div className="site-footer__contactItem">
                <span className="site-footer__label">Horaires</span>
                <span>Lun-Sam • 8h00-18h00</span>
              </div>
            </div>
          </div>

          {/* Column 2: Catalog */}
          <div className="site-footer__column">
            <div className="site-footer__heading">Catalogue</div>
            <ul className="site-footer__list">
              <li>
                <Link to="/products" className="site-footer__link">Tous les produits</Link>
              </li>
              <li>
                <Link to="/category/pieces-moteur" className="site-footer__link">Pièces moteur</Link>
              </li>
              <li>
                <Link to="/category/freinage" className="site-footer__link">Freinage</Link>
              </li>
              <li>
                <Link to="/category/suspension" className="site-footer__link">Suspension</Link>
              </li>
              <li>
                <Link to="/category/visibilite" className="site-footer__link">Visibilité</Link>
              </li>
              <li>
                <Link to="/category/echappement" className="site-footer__link">Échappement</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Shopping */}
          <div className="site-footer__column">
            <div className="site-footer__heading">Shopping</div>
            <ul className="site-footer__list">
              <li>
                <Link to="/products" className="site-footer__link">Parcourir les produits</Link>
              </li>
              <li>
                <Link to="/cart" className="site-footer__link">Panier</Link>
              </li>
              <li>
                <Link to="/checkout" className="site-footer__link">Passer une commande</Link>
              </li>
              <li>
                <a href="#" className="site-footer__link">Codes promo</a>
              </li>
              <li>
                <a href="#" className="site-footer__link">Nouveautés</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Account */}
          <div className="site-footer__column">
            <div className="site-footer__heading">Mon compte</div>
            <ul className="site-footer__list">
              <li>
                <Link to="/login" className="site-footer__link">Connexion</Link>
              </li>
              <li>
                <Link to="/register" className="site-footer__link">Créer un compte</Link>
              </li>
              <li>
                <Link to="/account/profile" className="site-footer__link">Profil</Link>
              </li>
              <li>
                <Link to="/account/orders" className="site-footer__link">Mes commandes</Link>
              </li>
              <li>
                <Link to="/account/wishlist" className="site-footer__link">Wishlist</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Support */}
          <div className="site-footer__column">
            <div className="site-footer__heading">Support & Légal</div>
            <ul className="site-footer__list">
              <li>
                <a href="#" className="site-footer__link">Nous contacter</a>
              </li>
              <li>
                <a href="#" className="site-footer__link">FAQ</a>
              </li>
              <li>
                <a href="#" className="site-footer__link">Retours & Remboursements</a>
              </li>
              <li>
                <a href="#" className="site-footer__link">Conditions générales</a>
              </li>
              <li>
                <a href="#" className="site-footer__link">Politique de confidentialité</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Badges & Features */}
        <div className="site-footer__features">
          <div className="site-footer__feature">
            <svg className="site-footer__featureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <div className="site-footer__featureText">
              <div className="site-footer__featureTitle">Livraison rapide</div>
              <div className="site-footer__featureDesc">En 24-48h en France</div>
            </div>
          </div>
          <div className="site-footer__feature">
            <svg className="site-footer__featureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div className="site-footer__featureText">
              <div className="site-footer__featureTitle">Paiement sécurisé</div>
              <div className="site-footer__featureDesc">SSL 256-bit chiffré</div>
            </div>
          </div>
          <div className="site-footer__feature">
            <svg className="site-footer__featureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
            </svg>
            <div className="site-footer__featureText">
              <div className="site-footer__featureTitle">Retours faciles</div>
              <div className="site-footer__featureDesc">30 jours garantis</div>
            </div>
          </div>
          <div className="site-footer__feature">
            <svg className="site-footer__featureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div className="site-footer__featureText">
              <div className="site-footer__featureTitle">Support 24/7</div>
              <div className="site-footer__featureDesc">Équipe réactive</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="site-footer__bottom">
          <div className="site-footer__copyright">
            © {currentYear} AutoVue. Tous droits réservés.
            <span className="site-footer__separator">•</span>
            <a href="#" className="site-footer__legal">Mentions légales</a>
          </div>
          <div className="site-footer__social">
            <span className="site-footer__label">Suivez-nous</span>
          <div className="site-footer__socialLinks">
              <a href="#" className="site-footer__socialLink" aria-label="Facebook" title="Facebook">f</a>
              <a href="#" className="site-footer__socialLink" aria-label="Instagram" title="Instagram">⌂</a>
              <a href="#" className="site-footer__socialLink" aria-label="Twitter" title="Twitter">X</a>
              <a href="#" className="site-footer__socialLink" aria-label="LinkedIn" title="LinkedIn">in</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


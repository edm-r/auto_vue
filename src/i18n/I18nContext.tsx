import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'fr' | 'en'

const STORAGE_KEY = 'auto_vue_lang'

type Dict = Record<string, { fr: string; en: string }>

const dict: Dict = {
  // Navigation
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.products': { fr: 'Produits', en: 'Products' },
  'nav.cart': { fr: 'Panier', en: 'Cart' },
  'nav.account': { fr: 'Mon compte', en: 'Account' },
  'nav.admin': { fr: 'Admin', en: 'Admin' },
  'nav.login': { fr: 'Connexion', en: 'Login' },
  'nav.register': { fr: 'Inscription', en: 'Sign up' },
  'nav.logout': { fr: 'Déconnexion', en: 'Logout' },
  'nav.searchPlaceholder': { fr: 'Référence, nom, pièce...', en: 'Part #, name, component...' },
  'nav.findParts': { fr: 'Trouver des pièces', en: 'Find parts' },

  // Search & Vehicle Selector
  'search.byReference': { fr: 'Par référence', en: 'By reference' },
  'search.byVehicle': { fr: 'Par véhicule', en: 'By vehicle' },
  'search.placeholder': { fr: 'Ex: 9812345, filtre à huile...', en: 'Ex: 9812345, oil filter...' },
  'search.brand': { fr: 'Marque', en: 'Make' },
  'search.model': { fr: 'Modèle', en: 'Model' },
  'search.year': { fr: 'Année', en: 'Year' },
  'search.search': { fr: 'Rechercher', en: 'Search' },
  'search.selectVehicle': { fr: 'Choisir mon véhicule', en: 'Select my vehicle' },

  // Homepage
  'home.heroBadge': { fr: 'Qualité Professionnelle', en: 'Professional Quality' },
  'home.heroTitle': { fr: 'La bonne pièce. Au meilleur prix.', en: 'The right part. At the best price.' },
  'home.heroSubtitle': { fr: 'Plus de 500,000 références en stock pour tous les véhicules.', en: 'Over 500,000 parts in stock for all vehicles.' },
  'home.trust1': { fr: 'Paiement Sécurisé', en: 'Secure Payment' },
  'home.trust2': { fr: 'Livraison Express', en: 'Fast Delivery' },
  'home.trust3': { fr: 'Garantie Expert', en: 'Expert Warranty' },
  'home.trust4': { fr: 'Support 24/7', en: '24/7 Support' },
  'home.categoriesTitle': { fr: 'Catégories Populaires', en: 'Popular Categories' },
  'home.featuredTitle': { fr: 'Meilleures Ventes', en: 'Best Sellers' },
  'home.brandsTitle': { fr: 'Nos Marques Partenaires', en: 'Our Partner Brands' },

  // Product List
  'products.filters': { fr: 'Filtres', en: 'Filters' },
  'products.sortBy': { fr: 'Trier par', en: 'Sort by' },
  'products.relevance': { fr: 'Pertinence', en: 'Relevance' },
  'products.priceAsc': { fr: 'Prix croissant', en: 'Price (Low to High)' },
  'products.priceDesc': { fr: 'Prix décroissant', en: 'Price (High to Low)' },
  'products.newest': { fr: 'Nouveautés', en: 'Newest' },
  'products.inStock': { fr: 'En stock uniquement', en: 'In stock only' },
  'products.clearFilters': { fr: 'Effacer', en: 'Clear' },
  'products.noResults': { fr: 'Aucun produit trouvé.', en: 'No products found.' },

  // Product Detail
  'product.oemRef': { fr: 'Référence OEM', en: 'OEM Reference' },
  'product.compatibility': { fr: 'Compatibilité Véhicule', en: 'Vehicle Compatibility' },
  'product.inStock': { fr: 'En stock', en: 'In stock' },
  'product.lowStock': { fr: 'Stock faible', en: 'Low stock' },
  'product.outOfStock': { fr: 'Rupture de stock', en: 'Out of stock' },
  'product.addToCart': { fr: 'Ajouter au panier', en: 'Add to cart' },
  'product.addWishlist': { fr: 'Liste de souhaits', en: 'Add to wishlist' },
  'product.description': { fr: 'Description', en: 'Description' },
  'product.specs': { fr: 'Spécifications', en: 'Specifications' },
  'product.reviews': { fr: 'Avis clients', en: 'Reviews' },

  // Cart & Checkout
  'cart.title': { fr: 'Votre Panier', en: 'Your Cart' },
  'cart.empty': { fr: 'Votre panier est vide', en: 'Your cart is empty' },
  'cart.summary': { fr: 'Résumé de la commande', en: 'Order summary' },
  'cart.subtotal': { fr: 'Sous-total', en: 'Subtotal' },
  'cart.shipping': { fr: 'Livraison', en: 'Shipping' },
  'cart.total': { fr: 'Total', en: 'Total' },
  'cart.checkout': { fr: 'Passer à la caisse', en: 'Proceed to checkout' },
  'cart.coupon': { fr: 'Code promo', en: 'Promo code' },
  'cart.apply': { fr: 'Appliquer', en: 'Apply' },
  
  // Checkout Steps
  'checkout.step1': { fr: 'Adresse', en: 'Address' },
  'checkout.step2': { fr: 'Livraison', en: 'Shipping' },
  'checkout.step3': { fr: 'Paiement', en: 'Payment' },
  'checkout.step4': { fr: 'Confirmation', en: 'Confirm' },

  // Account
  'account.profile': { fr: 'Profil', en: 'Profile' },
  'account.orders': { fr: 'Commandes', en: 'Orders' },
  'account.addresses': { fr: 'Adresses', en: 'Addresses' },
  'account.wishlist': { fr: 'Wishlist', en: 'Wishlist' },
  'account.vehicles': { fr: 'Mes Véhicules', en: 'My Vehicles' },
  'account.save': { fr: 'Enregistrer', en: 'Save Changes' },

  // Common
  'common.back': { fr: 'Retour', en: 'Back' },
  'common.close': { fr: 'Fermer', en: 'Close' },
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.error': { fr: 'Une erreur est survenue.', en: 'An error occurred.' },
}

type I18nContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? null
    const next: Lang = stored === 'en' ? 'en' : 'fr'
    setLangState(next)
    document.documentElement.lang = next
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next)
        localStorage.setItem(STORAGE_KEY, next)
        document.documentElement.lang = next
      },
      t: (key) => dict[key]?.[lang] ?? key,
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

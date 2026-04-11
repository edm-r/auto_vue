import { useMemo, useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { useCart } from '../../cart/CartContext'
import { useTheme } from '../../theme/ThemeContext'
import { SearchBar } from '../SearchBar'
import { fetchCategories, type Category } from '../../lib/catalogApi'

function Icon({
  path,
  title,
}: {
  path: string
  title: string
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="icon"
    >
      <title>{title}</title>
      <path d={path} fill="currentColor" />
    </svg>
  )
}

const ICONS = {
  menu: 'M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z',
  search:
    'M10 2a8 8 0 1 1 5.293 14.293l4.707 4.707-1.414 1.414-4.707-4.707A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z',
  cart:
    'M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.2 6l.6 3h12.8l1.1-5H6.1L5.7 2H2v2h2l2 11.2A2 2 0 0 0 8 17h10v-2H8.2l-.2-1h11.7a2 2 0 0 0 2-1.6L23 6H6.2Z',
  user:
    'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z',
  location:
    'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z',
  sun:
    'M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-14a1 1 0 0 1 1-1h0a1 1 0 0 1 0 2h0a1 1 0 0 1-1-1Zm0 18a1 1 0 0 1 1-1h0a1 1 0 0 1 0 2h0a1 1 0 0 1-1-1ZM4 13a1 1 0 0 1-1-1h0a1 1 0 0 1 2 0h0a1 1 0 0 1-1 1Zm18 0a1 1 0 0 1-1-1h0a1 1 0 1 1 2 0h0a1 1 0 0 1-1 1ZM5.64 5.64a1 1 0 0 1 1.41 0h0a1 1 0 0 1-1.41 1.41h0a1 1 0 0 1 0-1.41Zm11.31 11.31a1 1 0 0 1 1.41 0h0a1 1 0 1 1-1.41 1.41h0a1 1 0 0 1 0-1.41ZM18.36 5.64a1 1 0 0 1 0 1.41h0a1 1 0 1 1-1.41-1.41h0a1 1 0 0 1 1.41 0ZM7.05 16.95a1 1 0 0 1 0 1.41h0a1 1 0 1 1-1.41-1.41h0a1 1 0 0 1 1.41 0Z',
  moon:
    'M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z',
}

export function SiteHeader() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { cart } = useCart()
  const { theme, toggleTheme } = useTheme()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories', err))
  }, [])

  const itemCount = useMemo(
    () => (cart?.items ?? []).reduce((acc, it) => acc + (it.quantity ?? 0), 0),
    [cart],
  )

  const isAdmin = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser))

  return (
    <header className="site-header">
      <div className="site-header__top">
        <div className="site-header__inner">
          <button
            type="button"
            className="site-header__iconbtn site-header__menu"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Icon path={ICONS.menu} title="Menu" />
          </button>

          <Link to="/" className="site-header__logo" aria-label="AutoVue - Accueil">
            <span className="site-header__logoMark">AV</span>
            <span className="site-header__logoText">AutoVue</span>
          </Link>

          <div className="site-header__search">
            <SearchBar
              onSearch={({ search, brand, carModel }) => {
                const params = new URLSearchParams()
                if (search) params.set('search', search)
                if (brand) params.set('brand', String(brand))
                if (carModel) params.set('compatible_car_models', String(carModel))
                navigate(`/products?${params.toString()}`)
              }}
            />
          </div>

          <div className="site-header__actions">
            <button
              type="button"
              className="site-header__themeBtn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'}
              title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
            >
              <Icon path={theme === 'dark' ? ICONS.sun : ICONS.moon} title="Theme" />
            </button>

            <NavLink className="site-header__navlink" to="/account/profile">
              <div className="site-header__muted">{isAuthenticated ? `Bonjour, ${user?.username ?? ''}` : 'Bonjour'}</div>
              <div className="site-header__strong">Mon compte</div>
            </NavLink>

            <Link className="site-header__cart" to="/cart" aria-label="Panier">
              <div className="site-header__cartIcon" aria-hidden="true">
                <Icon path={ICONS.cart} title="Panier" />
              </div>
              <div className="site-header__cartText">
                <div className="site-header__cartCount" aria-label={`${itemCount} article(s)`}>
                  {itemCount}
                </div>
                <div className="site-header__strong">Panier</div>
              </div>
            </Link>
          </div>
        </div>
      </div>


      <div className="site-header__bottom">
        <div className="site-header__inner site-header__bottomInner">
          <NavLink className="site-header__pill" to="/products">
            Catalogue
          </NavLink>
          {categories.slice(0, 5).map((cat) => (
            <NavLink
              key={cat.id}
              className="site-header__pill"
              to={cat.slug ? `/category/${cat.slug}` : `/products?category=${cat.id}`}
            >
              {cat.name}
            </NavLink>
          ))}


          <div className="site-header__spacer" />

          {isAdmin ? (
            <NavLink className="site-header__pill site-header__pill--accent" to="/admin/dashboard">
              Admin
            </NavLink>
          ) : null}

          {isAuthenticated ? (
            <button type="button" className="site-header__pill" onClick={() => logout()}>
              Déconnexion
            </button>
          ) : (
            <NavLink className="site-header__pill site-header__pill--accent" to="/login">
              Connexion
            </NavLink>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="site-header__mobile">
          <div className="site-header__mobileInner">
            <button
              type="button"
              className="site-header__mobileLink site-header__mobileButton"
              onClick={() => toggleTheme()}
            >
              {theme === 'dark' ? 'Passer en clair' : 'Passer en sombre'}
            </button>
            <NavLink className="site-header__mobileLink" to="/" onClick={() => setMobileOpen(false)}>
              Accueil
            </NavLink>
            <NavLink className="site-header__mobileLink" to="/products" onClick={() => setMobileOpen(false)}>
              Produits
            </NavLink>
            <NavLink className="site-header__mobileLink" to="/account/profile" onClick={() => setMobileOpen(false)}>
              Mon compte
            </NavLink>
            {isAdmin ? (
              <NavLink className="site-header__mobileLink" to="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                Admin
              </NavLink>
            ) : null}
            <div className="site-header__mobileDivider" />
            {isAuthenticated ? (
              <button
                type="button"
                className="site-header__mobileLink site-header__mobileButton"
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
              >
                Déconnexion
              </button>
            ) : (
              <NavLink className="site-header__mobileLink" to="/login" onClick={() => setMobileOpen(false)}>
                Connexion
              </NavLink>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

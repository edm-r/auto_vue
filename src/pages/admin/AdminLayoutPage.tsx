import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

function navClass({ isActive }: { isActive: boolean }) {
  return `admin-link ${isActive ? 'is-active' : ''}`
}

export function AdminLayoutPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isSuperuser = Boolean(user?.is_superuser)

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brandMark">AV</div>
          <div>
            <div className="admin-brandTitle">AutoVue</div>
            <div className="admin-brandSubtitle">Administration</div>
          </div>
        </div>

        <div className="admin-group">
          <div className="admin-groupTitle">Commerce</div>
          <NavLink to="dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="orders" className={navClass}>
            Commandes
          </NavLink>
          <NavLink to="products" className={navClass}>
            Produits
          </NavLink>
          <NavLink to="inventory" className={navClass}>
            Stock
          </NavLink>
        </div>

        {isSuperuser ? (
          <div className="admin-group">
            <div className="admin-groupTitle">Catalogue</div>
            <NavLink to="categories" className={navClass}>
              Categories
            </NavLink>
            <NavLink to="brands" className={navClass}>
              Brands
            </NavLink>
            <NavLink to="car-models" className={navClass}>
              Car Models
            </NavLink>
            <NavLink to="product-images" className={navClass}>
              Product Images
            </NavLink>
            <NavLink to="product-variants" className={navClass}>
              Product Variants
            </NavLink>
          </div>
        ) : null}

        <div className="admin-group">
          <div className="admin-groupTitle">Clients</div>
          <NavLink to="customers" className={navClass}>
            Utilisateurs
          </NavLink>
        </div>

        <div className="admin-group">
          <div className="admin-groupTitle">Marketing</div>
          <NavLink to="promotions" className={navClass}>
            Promotions
          </NavLink>
        </div>

        <div className="admin-sidebarFoot">
          <div className="admin-user">
            <div className="admin-userLabel">Connecté</div>
            <div className="admin-userValue">{user?.username ?? 'Admin'}</div>
          </div>

          <div className="admin-footActions">
            <button className="btn" type="button" onClick={() => navigate('/')}>
              Accueil
            </button>
            <button className="btn" type="button" onClick={() => navigate('/account')}>
              Mon compte
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}


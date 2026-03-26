import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

function navClass({ isActive }: { isActive: boolean }) {
  return `admin-link ${isActive ? 'is-active' : ''}`
}

export function AdminLayoutPage() {
  const { user, logout } = useAuth()

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Admin</h1>
          <div className="page-subtitle">
            Accès réservé • <strong>{user?.username ?? 'Admin'}</strong>
          </div>
        </div>
        <div className="page-actions">
          <a className="btn" href="/">
            Accueil
          </a>
          <a className="btn" href="/account">
            Mon compte
          </a>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              logout()
              window.location.assign('/login')
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="admin-nav">
          <NavLink to="dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="products" className={navClass}>
            Produits
          </NavLink>
          <NavLink to="orders" className={navClass}>
            Commandes
          </NavLink>
          <NavLink to="inventory" className={navClass}>
            Stock
          </NavLink>
          <NavLink to="customers" className={navClass}>
            Clients
          </NavLink>
          <NavLink to="promotions" className={navClass}>
            Promotions
          </NavLink>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

function navClass({ isActive }: { isActive: boolean }) {
  return `account-link ${isActive ? 'is-active' : ''}`
}

export function AccountLayoutPage() {
  const { user, logout } = useAuth()
  const isAdmin = Boolean(user?.is_staff || user?.is_superuser)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Espace client</h1>
          <div className="page-subtitle">
            Connecté en tant que <strong>{user?.username ?? 'Utilisateur'}</strong>
          </div>
        </div>
        <div className="page-actions">
          <a className="btn" href="/">
            Accueil
          </a>
          {isAdmin ? (
            <a className="btn" href="/admin/dashboard">
              Admin
            </a>
          ) : null}
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

      <div className="account-layout">
        <aside className="account-nav">
          <NavLink to="profile" className={navClass}>
            Profil
          </NavLink>
          <NavLink to="addresses" className={navClass}>
            Adresses
          </NavLink>
          <NavLink to="orders" className={navClass}>
            Commandes
          </NavLink>
          <NavLink to="wishlist" className={navClass}>
            Wishlist
          </NavLink>
          <NavLink to="vehicles" className={navClass}>
            Véhicules
          </NavLink>
        </aside>

        <main className="account-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

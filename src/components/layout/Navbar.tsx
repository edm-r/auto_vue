import { Link, useNavigate } from 'react-router-dom'
import { Menu, Moon, ShoppingCart, Sun, User } from 'lucide-react'

import { useAuth } from '../../auth/AuthContext'
import { useCart } from '../../cart/CartContext'
import { useI18n } from '../../i18n/I18nContext'
import { useTheme } from '../../theme/ThemeContext'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { SearchBar } from '../SearchBar'


export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { cart } = useCart()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t } = useI18n()

  const itemCount = (cart?.items ?? []).reduce((acc, it) => acc + (it.quantity ?? 0), 0)
  const isAdmin = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser))

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl transition-all duration-300">
      <div className="container-p flex h-20 items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105 active:scale-95">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white shadow-premium overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <span className="relative font-black tracking-tighter text-lg">AV</span>
          </div>
          <span className="hidden text-xl font-bold tracking-tight text-foreground sm:block">
            Auto<span className="text-accent">Vue</span>
          </span>
        </Link>

        {/* Search Bar (Centered & Large) */}
        <div className="hidden flex-1 max-w-2xl lg:block">
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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Lang Switcher */}
          <div className="hidden items-center overflow-hidden rounded-2xl border border-border bg-surface md:flex">
            <button
              className={cn(
                "px-3 py-1.5 text-xs font-bold transition-all duration-200",
                lang === 'fr' ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-surface-2"
              )}
              onClick={() => setLang('fr')}
            >
              FR
            </button>
            <div className="h-4 w-[1px] bg-border" />
            <button
              className={cn(
                "px-3 py-1.5 text-xs font-bold transition-all duration-200",
                lang === 'en' ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-surface-2"
              )}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="h-10 w-10 rounded-2xl border border-border bg-surface hover:bg-surface-2 transition-transform duration-300 active:rotate-45"
          >
            {theme === 'dark' ? <Moon className="h-5 w-5 text-accent" /> : <Sun className="h-5 w-5 text-accent" />}
          </Button>

          {/* Cart */}
          <Button asChild variant="ghost" size="icon" className="group relative h-10 w-10 rounded-2xl border border-border bg-surface hover:bg-surface-2">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:-rotate-12" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-black text-white shadow-soft animate-in zoom-in duration-300">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Auth */}
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <Button asChild variant="secondary" className="h-10 rounded-2xl bg-surface border-border hover:bg-surface-2 font-bold transition-all px-4">
                <Link to="/account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{t('nav.account')}</span>
                </Link>
              </Button>
            ) : (
              <Button asChild className="h-10 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold shadow-soft px-5">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border border-border lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background border-l border-border backdrop-blur-2xl">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="text-2xl font-black tracking-tighter">AutoVue</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                <MobileNavItem to="/" label={t('nav.home')} />
                <MobileNavItem to="/products" label={t('nav.products')} />
                <MobileNavItem to="/account" label={t('nav.account')} />
                {isAdmin && <MobileNavItem to="/admin/dashboard" label={t('nav.admin')} />}
                <div className="my-4 h-[1px] bg-border" />
                {!isAuthenticated ? (
                  <Button asChild className="rounded-xl font-bold bg-accent">
                    <Link to="/login">{t('nav.login')}</Link>
                  </Button>
                ) : (
                   <Button variant="ghost" className="rounded-xl font-bold border border-border" onClick={() => logout()}>
                    {t('nav.logout')}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar (Sticky below Logo/Actions) */}
      <div className="container-p pb-4 lg:hidden animate-in fade-in slide-in-from-top-1 duration-300">
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
    </header>
  )
}

function MobileNavItem({ to, label }: { to: string; label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center h-12 px-4 rounded-xl text-lg font-semibold text-muted hover:text-foreground hover:bg-surface transition-all"
    >
      {label}
    </Link>
  )
}



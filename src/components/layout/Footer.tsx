import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Phone, Share2 } from 'lucide-react'

import { useI18n } from '../../i18n/I18nContext'

export function Footer() {
  const { t } = useI18n()

  return (

    <footer className="mt-20 border-t border-border bg-[#050505] text-white">
      <div className="container-p py-16">
        <div className="grid gap-12 md:grid-cols-4 lg:gap-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white shadow-premium">
                <span className="font-black tracking-tighter text-sm">AV</span>
              </div>
              <span className="text-xl font-bold tracking-tight">AutoVue</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50 max-w-[240px]">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex items-center gap-4">
              <SocialIcon icon={<Share2 className="h-4 w-4" />} />
              <SocialIcon icon={<MessageCircle className="h-4 w-4" />} />
            </div>
          </div>

          {/* Links Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Navigation</h4>
            <ul className="space-y-4">
              <FooterLink to="/products" label={t('nav.products')} />
              <FooterLink to="/cart" label={t('nav.cart')} />
              <FooterLink to="/account" label={t('nav.account')} />
            </ul>
          </div>

          {/* Categories Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Catégories</h4>
            <ul className="space-y-4">
              <FooterStaticLink label="Moteur" />
              <FooterStaticLink label="Freins" />
              <FooterStaticLink label="Électricité" />
              <FooterStaticLink label="Carrosserie" />
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Contact</h4>
            <div className="space-y-4">
              <ContactItem icon={<Phone className="h-4 w-4" />} text="+237 6XX XXX XXX" />
              <ContactItem icon={<Mail className="h-4 w-4" />} text="support@autovue.local" />
              <div className="pt-4">
                <p className="text-xs text-white/30">
                  © {new Date().getFullYear()} AutoVue. Built for performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link to={to} className="text-sm font-medium text-white/60 transition-colors hover:text-accent">
        {label}
      </Link>
    </li>
  )
}

function FooterStaticLink({ label }: { label: string }) {
  return (
    <li>
      <span className="text-sm font-medium text-white/60 transition-colors hover:text-accent cursor-pointer">
        {label}
      </span>
    </li>
  )
}

function ContactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/60 group">
      <div className="text-accent group-hover:scale-110 transition-transform">{icon}</div>
      <span>{text}</span>
    </div>
  )
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a 
      href="#" 
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-accent hover:border-accent hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  )
}


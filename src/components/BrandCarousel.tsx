import type { Brand } from '../lib/catalogApi'
import { resolveAssetUrl } from '../lib/assetUrl'

export function BrandCarousel({ brands }: { brands: Brand[] }) {
  return (
    <div className="brand-strip" aria-label="Marques partenaires">
      {brands.map((b) => {
        const logoUrl = resolveAssetUrl(b.logo)
        return (
        <div className="brand-item" key={b.id} title={b.name}>
          {logoUrl ? (
            <img src={logoUrl} alt={b.name} loading="lazy" />
          ) : (
            <div className="brand-fallback">{b.name.slice(0, 2).toUpperCase()}</div>
          )}
          <div className="brand-name">{b.name}</div>
        </div>
        )
      })}
    </div>
  )
}

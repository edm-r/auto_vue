import { Link } from 'react-router-dom'
import { resolveAssetUrl } from '../lib/assetUrl'

export function CategoryCard({
  category,
}: {
  category: { id: number; name: string; slug?: string | null; description?: string | null; image?: string | null }
}) {
  const imageUrl = resolveAssetUrl(category.image)

  return (
    <Link
      className="category-card"
      to={category.slug ? `/category/${category.slug}` : `/products?category=${category.id}`}
    >
      {imageUrl && (
        <div className="category-image">
          <img src={imageUrl} alt={category.name} loading="lazy" />
        </div>
      )}
      <div className="category-title">{category.name}</div>
      <div className="category-desc">
        {category.description?.trim()
          ? category.description
          : 'Découvrir les pièces disponibles'}
      </div>
      <div className="category-cta">Voir la catégorie →</div>
    </Link>
  )
}

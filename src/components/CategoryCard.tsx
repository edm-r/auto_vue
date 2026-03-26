import { Link } from 'react-router-dom'

export function CategoryCard({
  category,
}: {
  category: { id: number; name: string; description?: string | null }
}) {
  return (
    <Link className="category-card" to={`/products?category=${category.id}`}>
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


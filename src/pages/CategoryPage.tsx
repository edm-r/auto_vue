import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AlertMessage } from '../components/AlertMessage'
import type { Category } from '../lib/catalogApi'
import { fetchCategories } from '../lib/catalogApi'

export function CategoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const categories = await fetchCategories()
        if (!isMounted) return
        const match = (categories as Category[]).find((c) => c.slug === slug)
        if (!match?.id) {
          setError('Catégorie introuvable.')
          return
        }
        navigate(`/products?category=${match.id}`, { replace: true })
      } catch {
        if (!isMounted) return
        setError('Impossible de charger la catégorie.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [slug, navigate])

  return (
    <div className="page">
      {loading ? <div className="skeleton-detail" /> : null}
      {error ? <AlertMessage type="error" message={error} /> : null}
    </div>
  )
}


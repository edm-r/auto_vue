export function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: unknown }).results
    if (Array.isArray(results)) return results as T[]
  }
  return []
}

export type Page<T> = {
  items: T[]
  count: number | null
  next: string | null
  previous: string | null
}

export function unwrapPage<T>(data: unknown): Page<T> {
  if (Array.isArray(data)) {
    return { items: data as T[], count: null, next: null, previous: null }
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const obj = data as {
      results?: unknown
      count?: unknown
      next?: unknown
      previous?: unknown
    }
    const items = Array.isArray(obj.results) ? (obj.results as T[]) : []
    const count = typeof obj.count === 'number' ? obj.count : null
    const next = typeof obj.next === 'string' ? obj.next : null
    const previous = typeof obj.previous === 'string' ? obj.previous : null
    return { items, count, next, previous }
  }
  return { items: [], count: null, next: null, previous: null }
}

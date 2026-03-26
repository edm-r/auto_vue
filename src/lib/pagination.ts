export function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: unknown }).results
    if (Array.isArray(results)) return results as T[]
  }
  return []
}


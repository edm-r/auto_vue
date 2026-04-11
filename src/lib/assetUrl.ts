import { getApiBaseUrl } from '../config/apiBaseUrl'

export function resolveAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value

  const apiBase = getApiBaseUrl()
  if (!apiBase) return value

  const root = apiBase.replace(/\/api\/?$/, '')
  const path = value.startsWith('/') ? value : `/${value}`
  try {
    return new URL(path, root).toString()
  } catch {
    return value
  }
}


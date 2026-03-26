type JwtPayload = {
  exp?: number
}

function base64UrlDecode(input: string) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64
  return atob(padded)
}

export function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const json = base64UrlDecode(parts[1])
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function isJwtExpired(token: string, skewSeconds = 30) {
  const payload = parseJwtPayload(token)
  if (!payload?.exp) return false
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + skewSeconds
}


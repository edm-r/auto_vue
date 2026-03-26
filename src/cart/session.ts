const STORAGE_KEY = 'auto_vue_session_id_v1'

function uuidLike() {
  // Avoid extra deps; good enough for a session identifier.
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`
}

export function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const next = uuidLike()
  localStorage.setItem(STORAGE_KEY, next)
  return next
}


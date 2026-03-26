type RuntimeConfig = {
  API_BASE_URL?: string
}

function readRuntimeConfig(): RuntimeConfig | undefined {
  return (window as unknown as { __AUTO_VUE_CONFIG__?: RuntimeConfig })
    .__AUTO_VUE_CONFIG__
}

export function getApiBaseUrl(): string | null {
  const runtime = readRuntimeConfig()?.API_BASE_URL
  const env = import.meta.env.VITE_API_BASE_URL as string | undefined
  const value = (runtime ?? env)?.trim()
  return value ? value : null
}


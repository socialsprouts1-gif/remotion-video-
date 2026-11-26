import { site } from '../site'

// JSON POST/GET against the backend. Throws on network errors and non-2xx.
export async function api(path, body) {
  const res = await fetch(site.api + path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(35_000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

let healthPromise
export const getHealth = () => (healthPromise ??= api('/api/health').catch(() => null))

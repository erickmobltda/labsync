import { auth } from '@/lib/firebase'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8010'

/** fetch() against erickmob-api with the signed-in user's Firebase ID token. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('Not authenticated')
  const headers = new Headers(init.headers)
  headers.set('authorization', `Bearer ${token}`)
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* not JSON */
    }
    throw new Error(message)
  }
  return res
}

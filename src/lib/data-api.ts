/**
 * Unified data-access layer.
 *
 * VITE_BACKEND_MODE=local  → calls the local Express/SQLite backend at /api/*
 * VITE_BACKEND_MODE=supabase (default) → delegates to the Supabase client
 *
 * Every function returns { data, error } so callers look the same regardless
 * of which backend is active.
 */

export const IS_LOCAL = import.meta.env.VITE_BACKEND_MODE === 'local'

// ---------------------------------------------------------------------------
// Local session helpers (JWT stored in localStorage)
// ---------------------------------------------------------------------------

export interface LocalUser {
  id: string
  email: string
  created_at: string
}

export function getLocalToken(): string | null {
  return localStorage.getItem('labsync-token')
}

export function getLocalUser(): LocalUser | null {
  try {
    return JSON.parse(localStorage.getItem('labsync-user') || 'null')
  } catch {
    return null
  }
}

export function setLocalSession(token: string, user: LocalUser): void {
  localStorage.setItem('labsync-token', token)
  localStorage.setItem('labsync-user', JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('labsync-auth-change', { detail: { user } }))
}

export function clearLocalSession(): void {
  localStorage.removeItem('labsync-token')
  localStorage.removeItem('labsync-user')
  window.dispatchEvent(new CustomEvent('labsync-auth-change', { detail: { user: null } }))
}

// ---------------------------------------------------------------------------
// Generic fetch helper — wraps all /api/* calls
// ---------------------------------------------------------------------------

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    const token = getLocalToken()
    const isFormData = opts.body instanceof FormData

    const res = await fetch(path, {
      ...opts,
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }))
      return { data: null, error: { message: body.error || 'Request failed' } }
    }

    const data: T = await res.json()
    return { data, error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Network error'
    return { data: null, error: { message } }
  }
}

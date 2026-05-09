import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import {
  IS_LOCAL,
  LocalUser,
  getLocalUser,
  setLocalSession,
  clearLocalSession,
  apiFetch,
} from '@/lib/data-api'

type AppUser = User | (LocalUser & Record<string, unknown>)

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_LOCAL) {
      setUser(getLocalUser() as AppUser | null)
      setLoading(false)

      const handler = (e: Event) => {
        setUser((e as CustomEvent<{ user: LocalUser | null }>).detail.user as AppUser | null)
      }
      window.addEventListener('labsync-auth-change', handler)
      return () => window.removeEventListener('labsync-auth-change', handler)
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signInWithMagicLink(email: string) {
    if (IS_LOCAL) {
      throw new Error('Magic link is not available in local mode. Please use email + password.')
    }
    const redirectTo = `${window.location.origin}/labsync/`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) throw error
  }

  async function signInWithPassword(email: string, password: string) {
    if (IS_LOCAL) {
      const { data, error } = await apiFetch<{ token: string; user: LocalUser }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      )
      if (error) throw new Error(error.message)
      setLocalSession(data!.token, data!.user)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUpWithPassword(email: string, password: string) {
    if (IS_LOCAL) {
      const { data, error } = await apiFetch<{ token: string; user: LocalUser }>(
        '/api/auth/register',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      )
      if (error) throw new Error(error.message)
      setLocalSession(data!.token, data!.user)
      return { needsConfirmation: false }
    }
    const redirectTo = `${window.location.origin}/labsync/`
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) throw error
    return { needsConfirmation: !data.session }
  }

  async function signOut() {
    if (IS_LOCAL) {
      clearLocalSession()
      return
    }
    await supabase.auth.signOut()
  }

  return {
    session: user ? { user } : null,
    user,
    loading,
    signInWithMagicLink,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  }
}

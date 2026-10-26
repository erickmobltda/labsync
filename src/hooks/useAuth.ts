import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  async function signInWithPassword(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signInAsDemo() {
    await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  return {
    user,
    loading,
    signInWithPassword,
    signInAsDemo,
    signOut,
  }
}

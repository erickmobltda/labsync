import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { collection, doc, getFirestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
})

export const auth = getAuth(app)
export const db = getFirestore(app)

export function currentUid(): string {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not authenticated')
  return uid
}

type UserCollection = 'reports' | 'biomarkers' | 'medicines' | 'appointments'

// All LabSync data lives under apps/labsync/users/{uid}.
export const userCollection = (name: UserCollection) =>
  collection(db, 'apps', 'labsync', 'users', currentUid(), name)

export const userDoc = (name: UserCollection, id: string) =>
  doc(db, 'apps', 'labsync', 'users', currentUid(), name, id)

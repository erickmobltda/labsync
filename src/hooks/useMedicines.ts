import { useState, useEffect } from 'react'
import { addDoc, deleteDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { currentUid, userCollection, userDoc } from '@/lib/firebase'
import type { Medicine } from '@/types'

export type MedicineInput = Omit<Medicine, 'id' | 'user_id' | 'created_at'>

export function useMedicines(userId?: string) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchMedicines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function fetchMedicines() {
    setLoading(true)
    try {
      const snap = await getDocs(userCollection('medicines'))
      setMedicines(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }) as Medicine)
          .sort((a, b) => b.start_date.localeCompare(a.start_date)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines')
    }
    setLoading(false)
  }

  async function saveMedicine(input: MedicineInput): Promise<Medicine> {
    const row = { ...input, user_id: currentUid(), created_at: new Date().toISOString() }
    const ref = await addDoc(userCollection('medicines'), row)
    await fetchMedicines()
    return { id: ref.id, ...row }
  }

  async function updateMedicine(id: string, input: MedicineInput): Promise<Medicine> {
    await updateDoc(userDoc('medicines', id), { ...input })
    await fetchMedicines()
    return (await getMedicine(id))!
  }

  async function deleteMedicine(id: string) {
    await deleteDoc(userDoc('medicines', id))
    setMedicines(prev => prev.filter(m => m.id !== id))
  }

  async function getMedicine(id: string): Promise<Medicine | null> {
    const snap = await getDoc(userDoc('medicines', id))
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Medicine) : null
  }

  return {
    medicines,
    loading,
    error,
    saveMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicine,
    refetch: fetchMedicines,
  }
}

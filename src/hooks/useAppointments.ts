import { useState, useEffect } from 'react'
import { addDoc, deleteDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { currentUid, userCollection, userDoc } from '@/lib/firebase'
import type { Appointment } from '@/types'

export type AppointmentInput = Omit<Appointment, 'id' | 'user_id' | 'created_at'>

// Newest date first; within a day, latest time first and untimed last.
function byDateThenTimeDesc(a: Appointment, b: Appointment) {
  if (a.date !== b.date) return b.date.localeCompare(a.date)
  if (a.time === b.time) return 0
  if (a.time === null) return 1
  if (b.time === null) return -1
  return b.time.localeCompare(a.time)
}

export function useAppointments(userId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function fetchAppointments() {
    setLoading(true)
    try {
      const snap = await getDocs(userCollection('appointments'))
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Appointment).sort(byDateThenTimeDesc))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    }
    setLoading(false)
  }

  async function saveAppointment(input: AppointmentInput): Promise<Appointment> {
    const row = { ...input, user_id: currentUid(), created_at: new Date().toISOString() }
    const ref = await addDoc(userCollection('appointments'), row)
    await fetchAppointments()
    return { id: ref.id, ...row }
  }

  async function updateAppointment(id: string, input: AppointmentInput): Promise<Appointment> {
    await updateDoc(userDoc('appointments', id), { ...input })
    await fetchAppointments()
    return (await getAppointment(id))!
  }

  async function deleteAppointment(id: string) {
    await deleteDoc(userDoc('appointments', id))
    setAppointments(prev => prev.filter(a => a.id !== id))
  }

  async function getAppointment(id: string): Promise<Appointment | null> {
    const snap = await getDoc(userDoc('appointments', id))
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Appointment) : null
  }

  return {
    appointments,
    loading,
    error,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    refetch: fetchAppointments,
  }
}

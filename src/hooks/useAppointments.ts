import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Appointment } from '@/types'

export type AppointmentInput = Omit<Appointment, 'id' | 'user_id' | 'created_at'>

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
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false, nullsFirst: false })
    if (error) setError(error.message)
    else setAppointments(data ?? [])
    setLoading(false)
  }

  async function saveAppointment(input: AppointmentInput): Promise<Appointment> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('appointments')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    await fetchAppointments()
    return data
  }

  async function updateAppointment(id: string, input: AppointmentInput): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await fetchAppointments()
    return data
  }

  async function deleteAppointment(id: string) {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) throw error
    setAppointments(prev => prev.filter(a => a.id !== id))
  }

  async function getAppointment(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
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

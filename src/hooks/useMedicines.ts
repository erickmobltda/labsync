import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { IS_LOCAL, apiFetch } from '@/lib/data-api'
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
    if (IS_LOCAL) {
      const { data, error } = await apiFetch<Medicine[]>('/api/medicines')
      if (error) setError(error.message)
      else setMedicines(data ?? [])
    } else {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('start_date', { ascending: false })
      if (error) setError(error.message)
      else setMedicines(data ?? [])
    }
    setLoading(false)
  }

  async function saveMedicine(input: MedicineInput): Promise<Medicine> {
    if (IS_LOCAL) {
      const { data, error } = await apiFetch<Medicine>('/api/medicines', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      if (error) throw new Error(error.message)
      await fetchMedicines()
      return data!
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('medicines')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    await fetchMedicines()
    return data
  }

  async function updateMedicine(id: string, input: MedicineInput): Promise<Medicine> {
    if (IS_LOCAL) {
      const { data, error } = await apiFetch<Medicine>(`/api/medicines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
      if (error) throw new Error(error.message)
      await fetchMedicines()
      return data!
    }
    const { data, error } = await supabase
      .from('medicines')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await fetchMedicines()
    return data
  }

  async function deleteMedicine(id: string) {
    if (IS_LOCAL) {
      const { error } = await apiFetch(`/api/medicines/${id}`, { method: 'DELETE' })
      if (error) throw new Error(error.message)
      setMedicines(prev => prev.filter(m => m.id !== id))
      return
    }
    const { error } = await supabase.from('medicines').delete().eq('id', id)
    if (error) throw error
    setMedicines(prev => prev.filter(m => m.id !== id))
  }

  async function getMedicine(id: string): Promise<Medicine | null> {
    if (IS_LOCAL) {
      const { data, error } = await apiFetch<Medicine>(`/api/medicines/${id}`)
      if (error) throw new Error(error.message)
      return data
    }
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
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

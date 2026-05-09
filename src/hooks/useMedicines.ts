import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('start_date', { ascending: false })
    if (error) setError(error.message)
    else setMedicines(data ?? [])
    setLoading(false)
  }

  async function saveMedicine(input: MedicineInput): Promise<Medicine> {
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
    const { error } = await supabase.from('medicines').delete().eq('id', id)
    if (error) throw error
    setMedicines(prev => prev.filter(m => m.id !== id))
  }

  async function getMedicine(id: string): Promise<Medicine | null> {
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

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import type { BiomarkerWithDate } from '@/types'

interface BiomarkerFilters {
  startDate?: string
  endDate?: string
  category?: string
  search?: string
}

export function useBiomarkers(userId?: string, filters: BiomarkerFilters = {}) {
  const { tBiomarker } = useT()
  const [allBiomarkers, setAllBiomarkers] = useState<BiomarkerWithDate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchBiomarkers()
  }, [userId, filters.startDate, filters.endDate, filters.category])

  async function fetchBiomarkers() {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('biomarkers')
      .select('*, lab_reports!inner(report_date)')
      .order('created_at', { ascending: true })

    if (filters.startDate) {
      query = query.gte('lab_reports.report_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('lab_reports.report_date', filters.endDate)
    }
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      const enriched = (data ?? []).map(b => ({
        ...b,
        report_date: (b.lab_reports as { report_date: string }).report_date,
      })) as BiomarkerWithDate[]
      setAllBiomarkers(enriched)
    }
    setLoading(false)
  }

  // Search client-side so it matches both the stored canonical name and its translation
  const biomarkers = filters.search
    ? allBiomarkers.filter(b => {
        const q = filters.search!.toLowerCase()
        return (
          b.name.toLowerCase().includes(q) ||
          tBiomarker(b.name).toLowerCase().includes(q)
        )
      })
    : allBiomarkers

  // Group biomarkers by name for charting
  const grouped = biomarkers.reduce<Record<string, BiomarkerWithDate[]>>((acc, b) => {
    if (!acc[b.name]) acc[b.name] = []
    acc[b.name].push(b)
    return acc
  }, {})

  // Get unique categories from current data
  const categories = Array.from(new Set(biomarkers.map(b => b.category ?? 'Other')))

  return { biomarkers, grouped, categories, loading, error, refetch: fetchBiomarkers }
}

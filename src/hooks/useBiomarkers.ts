import { useState, useEffect } from 'react'
import { getDocs } from 'firebase/firestore'
import { userCollection } from '@/lib/firebase'
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

  // A user has a few hundred biomarkers at most, so they are loaded in one
  // read and filtered here (each one carries its report's report_date).
  async function fetchBiomarkers() {
    setLoading(true)
    setError(null)
    try {
      const snap = await getDocs(userCollection('biomarkers'))
      const rows = snap.docs
        .map(d => ({ id: d.id, ...d.data() }) as BiomarkerWithDate)
        .filter(b => !filters.startDate || b.report_date >= filters.startDate)
        .filter(b => !filters.endDate || b.report_date <= filters.endDate)
        .filter(b => !filters.category || filters.category === 'All' || b.category === filters.category)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
      setAllBiomarkers(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load biomarkers')
    }
    setLoading(false)
  }

  const biomarkers = filters.search
    ? allBiomarkers.filter(b => {
        const q = filters.search!.toLowerCase()
        return (
          b.name.toLowerCase().includes(q) ||
          tBiomarker(b.name).toLowerCase().includes(q)
        )
      })
    : allBiomarkers

  const grouped = biomarkers.reduce<Record<string, BiomarkerWithDate[]>>((acc, b) => {
    if (!acc[b.name]) acc[b.name] = []
    acc[b.name].push(b)
    return acc
  }, {})

  const categories = Array.from(new Set(biomarkers.map(b => b.category ?? 'Other')))

  return { biomarkers, grouped, categories, loading, error, refetch: fetchBiomarkers }
}

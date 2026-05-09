import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { LabReport, ExtractedReport, Biomarker } from '@/types'
import { resolveCategory } from '@/lib/categories'
import { computeStatus } from '@/lib/utils'
import { uploadReportPdf, deleteReportPdf } from '@/lib/storage'

export function useReports(userId?: string) {
  const [reports, setReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchReports()
  }, [userId])

  async function fetchReports() {
    setLoading(true)
    const { data, error } = await supabase
      .from('lab_reports')
      .select('*')
      .order('report_date', { ascending: false })
    if (error) setError(error.message)
    else setReports(data ?? [])
    setLoading(false)
  }

  async function saveReport(
    extracted: ExtractedReport,
    filename: string | null,
    rawText: string,
    file: File | null = null
  ): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let storagePath: string | null = null
    if (file) {
      storagePath = await uploadReportPdf(file, user.id)
    }

    const { data: report, error: reportError } = await supabase
      .from('lab_reports')
      .insert({
        user_id: user.id,
        report_date: extracted.report_date,
        source_filename: filename,
        raw_text: rawText,
        storage_path: storagePath,
      })
      .select()
      .single()

    if (reportError) {
      if (storagePath) {
        await deleteReportPdf(storagePath).catch(() => {})
      }
      throw reportError
    }

    const biomarkers = extracted.biomarkers.map(b => ({
      report_id: report.id,
      user_id: user.id,
      name: b.name,
      value: b.value ?? null,
      value_text: b.value_text ?? null,
      unit: b.unit || null,
      reference_min: b.reference_min ?? null,
      reference_max: b.reference_max ?? null,
      reference_text: b.reference_text || null,
      status: computeStatus(b.value, b.reference_min, b.reference_max),
      category: resolveCategory(b.name),
    }))

    const { error: bioError } = await supabase.from('biomarkers').insert(biomarkers)
    if (bioError) {
      await supabase.from('lab_reports').delete().eq('id', report.id)
      if (storagePath) {
        await deleteReportPdf(storagePath).catch(() => {})
      }
      throw bioError
    }

    await fetchReports()
    return report.id
  }

  async function deleteReport(id: string) {
    const target = reports.find(r => r.id === id)
    const { error } = await supabase.from('lab_reports').delete().eq('id', id)
    if (error) throw error
    if (target?.storage_path) {
      await deleteReportPdf(target.storage_path).catch(() => {})
    }
    setReports(prev => prev.filter(r => r.id !== id))
  }

  async function fetchReportBiomarkers(reportId: string): Promise<Biomarker[]> {
    const { data, error } = await supabase
      .from('biomarkers')
      .select('*')
      .eq('report_id', reportId)
      .order('name')
    if (error) throw error
    return data ?? []
  }

  return { reports, loading, error, saveReport, deleteReport, fetchReportBiomarkers, refetch: fetchReports }
}

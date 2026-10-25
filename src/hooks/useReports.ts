import { useState, useEffect } from 'react'
import { addDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore'
import { currentUid, db, userCollection, userDoc } from '@/lib/firebase'
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
    try {
      const snap = await getDocs(userCollection('reports'))
      setReports(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }) as LabReport)
          .sort((a, b) => b.report_date.localeCompare(a.report_date)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    }
    setLoading(false)
  }

  async function saveReport(
    extracted: ExtractedReport,
    filename: string | null,
    rawText: string,
    file: File | null = null
  ): Promise<string> {
    const uid = currentUid()

    let storagePath: string | null = null
    if (file) {
      storagePath = await uploadReportPdf(file)
    }

    const createdAt = new Date().toISOString()
    let reportId: string
    try {
      const report = await addDoc(userCollection('reports'), {
        user_id: uid,
        report_date: extracted.report_date,
        source_filename: filename,
        raw_text: rawText,
        storage_path: storagePath,
        created_at: createdAt,
      })
      reportId = report.id

      // report_date is copied onto each biomarker so the dashboard can filter
      // by date without a join.
      const batch = writeBatch(db)
      for (const b of extracted.biomarkers) {
        batch.set(doc(userCollection('biomarkers')), {
          report_id: reportId,
          report_date: extracted.report_date,
          user_id: uid,
          name: b.name,
          value: b.value ?? null,
          value_text: b.value_text ?? null,
          unit: b.unit || null,
          reference_min: b.reference_min ?? null,
          reference_max: b.reference_max ?? null,
          reference_text: b.reference_text || null,
          status: computeStatus(b.value, b.reference_min, b.reference_max),
          category: resolveCategory(b.name),
          created_at: createdAt,
        })
      }
      await batch.commit()
    } catch (err) {
      if (storagePath) {
        await deleteReportPdf(storagePath).catch(() => {})
      }
      throw err
    }

    await fetchReports()
    return reportId
  }

  // Firestore has no cascading deletes: remove the report's biomarkers with it.
  async function deleteReport(id: string) {
    const target = reports.find(r => r.id === id)
    const biomarkers = await getDocs(query(userCollection('biomarkers'), where('report_id', '==', id)))
    const batch = writeBatch(db)
    biomarkers.docs.forEach(d => batch.delete(d.ref))
    batch.delete(userDoc('reports', id))
    await batch.commit()
    if (target?.storage_path) {
      await deleteReportPdf(target.storage_path).catch(() => {})
    }
    setReports(prev => prev.filter(r => r.id !== id))
  }

  async function fetchReportBiomarkers(reportId: string): Promise<Biomarker[]> {
    const snap = await getDocs(query(userCollection('biomarkers'), where('report_id', '==', reportId)))
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }) as Biomarker)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  return { reports, loading, error, saveReport, deleteReport, fetchReportBiomarkers, refetch: fetchReports }
}

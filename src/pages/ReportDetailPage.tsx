import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import type { LabReport, Biomarker } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { statusBg } from '@/lib/utils'
import { getReportPdfUrl } from '@/lib/storage'
import { useT } from '@/lib/i18n'

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { reports, fetchReportBiomarkers } = useReports(user?.id)
  const navigate = useNavigate()
  const { t, formatDate } = useT()

  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState<'view' | 'download' | null>(null)

  const report: LabReport | undefined = reports.find(r => r.id === id)

  async function openPdf(mode: 'view' | 'download') {
    if (!report?.storage_path) return
    setPdfLoading(mode)
    try {
      const url = await getReportPdfUrl(report.storage_path)
      if (mode === 'view') {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = report.source_filename ?? 'report.pdf'
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('detail.loadPdfFailed'))
    } finally {
      setPdfLoading(null)
    }
  }

  useEffect(() => {
    if (!id || !user) return
    setLoading(true)
    fetchReportBiomarkers(id)
      .then(setBiomarkers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, user])

  const byCategory = biomarkers.reduce<Record<string, Biomarker[]>>((acc, b) => {
    const cat = b.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(b)
    return acc
  }, {})

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 shrink-0">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {report?.source_filename ?? t('detail.title')}
            </h1>
            {report && (
              <p className="text-xs text-gray-500">{t('detail.reportDate', { date: formatDate(report.report_date) })}</p>
            )}
          </div>
        </div>
        {report?.storage_path && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openPdf('view')}
              disabled={pdfLoading !== null}
            >
              {pdfLoading === 'view' ? <Spinner size="sm" /> : <ExternalLink className="h-4 w-4" />}
              <span className="ml-1.5 hidden sm:inline">{t('detail.viewPdf')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openPdf('download')}
              disabled={pdfLoading !== null}
            >
              {pdfLoading === 'download' ? <Spinner size="sm" /> : <Download className="h-4 w-4" />}
              <span className="ml-1.5 hidden sm:inline">{t('detail.download')}</span>
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-sm text-red-700">{error}</div>
      ) : (
        <div className="space-y-5">
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{t('detail.biomarkersCount', { count: biomarkers.length })}</Badge>
            <Badge variant="normal">{biomarkers.filter(b => b.status === 'normal').length} {t('common.normal')}</Badge>
            <Badge variant="high">{biomarkers.filter(b => b.status === 'high').length} {t('common.high')}</Badge>
            <Badge variant="low">{biomarkers.filter(b => b.status === 'low').length} {t('common.low')}</Badge>
          </div>

          {/* Biomarkers by category */}
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5">
                <h2 className="text-sm font-semibold text-gray-700">{t(`category.${category}`)}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('common.biomarker')}</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('common.value')}</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('common.unit')}</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">{t('common.reference')}</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{b.name}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-900">{b.value ?? b.value_text ?? '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500">{b.unit ?? '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">{b.reference_text ?? '—'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBg(b.status as 'normal' | 'high' | 'low' | 'unknown')}`}>
                            {t(`status.${b.status}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

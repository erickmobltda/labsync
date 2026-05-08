import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, Upload, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useT } from '@/lib/i18n'

export function ReportsPage() {
  const { user } = useAuth()
  const { reports, loading, error, deleteReport } = useReports(user?.id)
  const navigate = useNavigate()
  const { t, formatDate } = useT()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(t('reports.deleteConfirm'))) return
    setDeleting(id)
    try {
      await deleteReport(id)
    } finally {
      setDeleting(null)
    }
  }

  const countLabel =
    reports.length === 0
      ? t('reports.none')
      : reports.length === 1
        ? t('reports.countOne', { count: reports.length })
        : t('reports.countMany', { count: reports.length })

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{countLabel}</p>
        </div>
        <Button size="sm" onClick={() => navigate('/upload')}>
          <Upload className="h-4 w-4" />
          {t('common.uploadNew')}
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-center text-sm text-red-700">{error}</div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <FileText className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-700">{t('reports.emptyTitle')}</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
            {t('reports.emptySub')}
          </p>
          <Button className="mt-5" onClick={() => navigate('/upload')}>
            <Upload className="h-4 w-4" />
            {t('common.uploadReport')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map(report => (
            <div
              key={report.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer transition-all group"
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {report.source_filename ?? t('reports.pastedText')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('reports.reportDate', { date: formatDate(report.report_date) })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 hidden sm:block">
                  {t('reports.added', { date: formatDate(report.created_at) })}
                </span>
                <button
                  onClick={e => handleDelete(report.id, e)}
                  disabled={deleting === report.id}
                  className="rounded-md p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {deleting === report.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

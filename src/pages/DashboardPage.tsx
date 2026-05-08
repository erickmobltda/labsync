import { useState } from 'react'
import type { BiomarkerWithDate } from '@/types'
import { useNavigate } from 'react-router-dom'
import { Upload, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBiomarkers } from '@/hooks/useBiomarkers'
import { useAppointments } from '@/hooks/useAppointments'
import { useMedicines } from '@/hooks/useMedicines'
import { BiomarkerCard } from '@/components/dashboard/BiomarkerCard'
import { BiomarkerChart } from '@/components/dashboard/BiomarkerChart'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { HealthSummaryPanel } from '@/components/dashboard/HealthSummaryPanel'
import { CategoryGroupCard } from '@/components/dashboard/CategoryGroupCard'
import { CategoryTabs } from '@/components/dashboard/CategoryTabs'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { SearchFilter } from '@/components/dashboard/SearchFilter'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { ALL_CATEGORIES } from '@/lib/categories'
import { useT } from '@/lib/i18n'

type ViewMode = 'cards' | 'charts' | 'grouped'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useT()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grouped')

  const { biomarkers, grouped, loading, error } = useBiomarkers(user?.id, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    category: activeCategory !== 'All' ? activeCategory : undefined,
    search: search || undefined,
  })
  const { appointments } = useAppointments(user?.id)
  const { medicines } = useMedicines(user?.id)

  const availableCategories = Array.from(
    new Set(biomarkers.map(b => b.category ?? 'Other'))
  ).sort((a, b) => ALL_CATEGORIES.indexOf(a) - ALL_CATEGORIES.indexOf(b))

  const biomarkerNames = Object.keys(grouped)

  // Group biomarkers by category for the grouped view
  const byCategory = Object.entries(grouped).reduce((acc, [name, entries]) => {
    const cat = entries[0]?.category ?? 'Other'
    if (!acc[cat]) acc[cat] = {}
    acc[cat][name] = entries
    return acc
  }, {} as Record<string, Record<string, BiomarkerWithDate[]>>)

  const sortedCategories = Object.keys(byCategory).sort(
    (a, b) => ALL_CATEGORIES.indexOf(a) - ALL_CATEGORIES.indexOf(b)
  )

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('dash.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {biomarkerNames.length > 0
              ? t('dash.tracked', { count: biomarkerNames.length })
              : t('dash.empty')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(['cards', 'grouped', 'charts'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t(`dash.view.${mode}`)}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => navigate('/upload')}>
            <Upload className="h-4 w-4" />
            {t('common.upload')}
          </Button>
        </div>
      </div>

      {/* Health summary */}
      <HealthSummaryPanel appointments={appointments} medicines={medicines} />

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onClear={() => { setStartDate(''); setEndDate('') }}
          />
          <div className="w-full sm:w-56 sm:ml-auto">
            <SearchFilter value={search} onChange={setSearch} />
          </div>
        </div>
        <CategoryTabs
          categories={availableCategories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* Insights */}
      {!loading && !error && biomarkerNames.length > 0 && (
        <InsightsPanel
          grouped={grouped}
          onSelectBiomarker={() => setViewMode('charts')}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-center text-sm text-red-700">{error}</div>
      ) : biomarkerNames.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <BarChart3 className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-700">{t('dash.noData')}</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
            {search || activeCategory !== 'All' || startDate || endDate
              ? t('dash.adjustFilters')
              : t('dash.uploadFirst')}
          </p>
          {!search && activeCategory === 'All' && !startDate && !endDate && (
            <Button className="mt-5" onClick={() => navigate('/upload')}>
              <Upload className="h-4 w-4" />
              {t('common.uploadFirstReport')}
            </Button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {biomarkerNames.map(name => (
            <BiomarkerCard
              key={name}
              name={name}
              entries={grouped[name]}
              onClick={() => setViewMode('charts')}
            />
          ))}
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {sortedCategories.map(cat => (
            <CategoryGroupCard key={cat} category={cat} grouped={byCategory[cat]} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {biomarkerNames.map(name => (
            <BiomarkerChart key={name} name={name} entries={grouped[name]} />
          ))}
        </div>
      )}
    </div>
  )
}

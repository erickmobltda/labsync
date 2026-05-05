import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBiomarkers } from '@/hooks/useBiomarkers'
import { BiomarkerCard } from '@/components/dashboard/BiomarkerCard'
import { BiomarkerChart } from '@/components/dashboard/BiomarkerChart'
import { CategoryTabs } from '@/components/dashboard/CategoryTabs'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { SearchFilter } from '@/components/dashboard/SearchFilter'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { ALL_CATEGORIES } from '@/lib/categories'

type ViewMode = 'cards' | 'charts'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const { biomarkers, grouped, loading, error } = useBiomarkers(user?.id, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    category: activeCategory !== 'All' ? activeCategory : undefined,
    search: search || undefined,
  })

  const availableCategories = Array.from(
    new Set(biomarkers.map(b => b.category ?? 'Other'))
  ).sort((a, b) => ALL_CATEGORIES.indexOf(a) - ALL_CATEGORIES.indexOf(b))

  const biomarkerNames = Object.keys(grouped)

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {biomarkerNames.length > 0
              ? `${biomarkerNames.length} biomarkers tracked`
              : 'No data yet — upload your first report'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === 'charts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Charts
            </button>
          </div>
          <Button size="sm" onClick={() => navigate('/upload')}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

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
          <h3 className="font-semibold text-gray-700">No data to display</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
            {search || activeCategory !== 'All' || startDate || endDate
              ? 'Try adjusting your filters or date range.'
              : 'Upload your first blood test report to start tracking your health trends.'}
          </p>
          {!search && activeCategory === 'All' && !startDate && !endDate && (
            <Button className="mt-5" onClick={() => navigate('/upload')}>
              <Upload className="h-4 w-4" />
              Upload First Report
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

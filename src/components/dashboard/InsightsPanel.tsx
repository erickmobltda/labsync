import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import type { BiomarkerWithDate } from '@/types'
import { useT } from '@/lib/i18n'

interface InsightsPanelProps {
  grouped: Record<string, BiomarkerWithDate[]>
  onSelectBiomarker?: (name: string) => void
}

function getLatest(entries: BiomarkerWithDate[]) {
  return [...entries].sort((a, b) => a.report_date.localeCompare(b.report_date)).at(-1)!
}

function getTrend(entries: BiomarkerWithDate[]) {
  const sorted = [...entries].sort((a, b) => a.report_date.localeCompare(b.report_date))
  const latest = sorted.at(-1)!
  const previous = sorted.at(-2)
  if (!previous || latest.value == null || previous.value == null || latest.value === previous.value) return 'flat'
  return latest.value > previous.value ? 'up' : 'down'
}

function trendIsImproving(status: string, trend: string) {
  if (trend === 'flat') return null
  if (status === 'high') return trend === 'down'
  if (status === 'low') return trend === 'up'
  return null // normal — no direction is inherently good/bad
}

export function InsightsPanel({ grouped, onSelectBiomarker }: InsightsPanelProps) {
  const { t } = useT()
  const entries = Object.entries(grouped).map(([name, data]) => ({
    name,
    latest: getLatest(data),
    trend: getTrend(data),
  }))

  const normal = entries.filter(e => e.latest.status === 'normal')
  const high = entries.filter(e => e.latest.status === 'high')
  const low = entries.filter(e => e.latest.status === 'low')
  const unknown = entries.filter(e => e.latest.status === 'unknown')
  const needsAttention = [...high, ...low]
  const total = entries.length

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 space-y-4">
      {/* Summary row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          <div>
            <span className="text-2xl font-bold text-green-600">{normal.length}</span>
            <span className="text-sm text-gray-500 ml-1">{t('common.normal')}</span>
          </div>
        </div>

        {high.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <span className="text-2xl font-bold text-red-600">{high.length}</span>
              <span className="text-sm text-gray-500 ml-1">{t('common.high')}</span>
            </div>
          </div>
        )}

        {low.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-2xl font-bold text-amber-600">{low.length}</span>
              <span className="text-sm text-gray-500 ml-1">{t('common.low')}</span>
            </div>
          </div>
        )}

        {unknown.length > 0 && (
          <div className="ml-auto text-sm text-gray-400">{t('insights.withoutRef', { count: unknown.length })}</div>
        )}

        {/* Progress bar */}
        {total > 0 && (
          <div className="hidden sm:flex flex-1 min-w-32 items-center gap-2 ml-auto">
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden flex">
              <div className="h-full bg-green-400" style={{ width: `${(normal.length / total) * 100}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${(high.length / total) * 100}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${(low.length / total) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{t('insights.total', { count: total })}</span>
          </div>
        )}
      </div>

      {/* Needs attention */}
      {needsAttention.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {t('insights.needsAttention')}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {needsAttention.map(({ name, latest, trend }) => {
              const improving = trendIsImproving(latest.status, trend)
              const isHigh = latest.status === 'high'

              return (
                <button
                  key={name}
                  onClick={() => onSelectBiomarker?.(name)}
                  className={`flex-shrink-0 rounded-lg border px-3 py-2 text-left transition-colors hover:shadow-sm ${
                    isHigh
                      ? 'border-red-100 bg-red-50 hover:border-red-200'
                      : 'border-amber-100 bg-amber-50 hover:border-amber-200'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-700 max-w-32 truncate">{name}</p>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className={`text-lg font-bold ${isHigh ? 'text-red-600' : 'text-amber-600'}`}>
                      {latest.value}
                    </span>
                    {latest.unit && <span className="text-xs text-gray-400">{latest.unit}</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-xs font-medium ${isHigh ? 'text-red-500' : 'text-amber-500'}`}>
                      {t(`status.${latest.status}`)}
                    </span>
                    {trend === 'up' && (
                      <TrendingUp className={`h-3 w-3 ${improving === true ? 'text-green-500' : improving === false ? 'text-red-500' : 'text-gray-400'}`} />
                    )}
                    {trend === 'down' && (
                      <TrendingDown className={`h-3 w-3 ${improving === true ? 'text-green-500' : improving === false ? 'text-red-500' : 'text-gray-400'}`} />
                    )}
                    {trend === 'flat' && <Minus className="h-3 w-3 text-gray-300" />}
                    {improving === true && <span className="text-xs text-green-600">{t('common.improving')}</span>}
                    {improving === false && <span className="text-xs text-red-600">{t('common.worsening')}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {needsAttention.length === 0 && total > 0 && (
        <p className="text-sm text-green-600 font-medium">
          {t('insights.allNormal')}
        </p>
      )}
    </div>
  )
}

import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Badge } from '@/components/ui/badge'
import type { BiomarkerWithDate } from '@/types'
import { useT } from '@/lib/i18n'

interface CategoryGroupCardProps {
  category: string
  grouped: Record<string, BiomarkerWithDate[]>
}

function Sparkline({ entries }: { entries: BiomarkerWithDate[] }) {
  const sorted = [...entries].sort((a, b) => a.report_date.localeCompare(b.report_date))
  if (sorted.length < 2) {
    return <div className="w-16 h-8 flex items-center justify-center text-xs text-gray-300">—</div>
  }
  const data = sorted.map(e => ({ value: e.value }))
  const latest = sorted.at(-1)!
  const refMin = latest.reference_min
  const refMax = latest.reference_max

  return (
    <ResponsiveContainer width={64} height={32}>
      <LineChart data={data} margin={{ top: 3, right: 3, left: 3, bottom: 3 }}>
        {refMin != null && <ReferenceLine y={refMin} stroke="#FCD34D" strokeWidth={1} />}
        {refMax != null && <ReferenceLine y={refMax} stroke="#FCA5A5" strokeWidth={1} />}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563EB"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function CategoryGroupCard({ category, grouped }: CategoryGroupCardProps) {
  const { t } = useT()
  const items = Object.entries(grouped)
    .map(([name, entries]) => {
      const sorted = [...entries].sort((a, b) => a.report_date.localeCompare(b.report_date))
      return { name, latest: sorted.at(-1)!, entries }
    })
    .sort((a, b) => {
      // Out-of-range first
      const aAbnormal = a.latest.status === 'high' || a.latest.status === 'low'
      const bAbnormal = b.latest.status === 'high' || b.latest.status === 'low'
      if (aAbnormal !== bAbnormal) return aAbnormal ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  const abnormalCount = items.filter(
    i => i.latest.status === 'high' || i.latest.status === 'low'
  ).length

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-sm text-gray-800">{t(`category.${category}`)}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t('group.biomarkersCount', { count: items.length })}</p>
        </div>
        {abnormalCount > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
            {t('group.outOfRange', { count: abnormalCount })}
          </span>
        )}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {items.map(({ name, latest, entries }) => {
          const status = (latest.status ?? 'unknown') as 'normal' | 'high' | 'low' | 'unknown'
          return (
            <div key={name} className="flex items-center gap-3 px-4 py-2.5">
              {/* Name + value */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{name}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    {latest.value}
                  </span>
                  {latest.unit && (
                    <span className="text-xs text-gray-400">{latest.unit}</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <Badge variant={status} className="text-xs flex-shrink-0">
                {t(`status.${status}`)}
              </Badge>

              {/* Reference range */}
              {latest.reference_text && (
                <span className="hidden sm:block text-xs text-gray-400 flex-shrink-0 w-20 text-right truncate">
                  {t('common.ref')}: {latest.reference_text}
                </span>
              )}

              {/* Sparkline */}
              <div className="flex-shrink-0">
                <Sparkline entries={entries} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

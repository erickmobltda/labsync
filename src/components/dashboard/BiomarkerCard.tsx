import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { BiomarkerWithDate } from '@/types'
import { useT } from '@/lib/i18n'

interface BiomarkerCardProps {
  name: string
  entries: BiomarkerWithDate[]
  onClick?: () => void
}

export function BiomarkerCard({ name, entries, onClick }: BiomarkerCardProps) {
  const { t, formatDate } = useT()
  const sorted = [...entries].sort((a, b) => a.report_date.localeCompare(b.report_date))
  const latest = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]

  const trend =
    previous && latest.value != null && previous.value != null && latest.value !== previous.value
      ? latest.value > previous.value
        ? 'up'
        : 'down'
      : 'flat'

  const statusVariant = (latest.status ?? 'unknown') as 'normal' | 'high' | 'low' | 'unknown'
  const displayValue = latest.value ?? latest.value_text ?? '—'

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${onClick ? 'hover:border-primary-200' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 truncate">{name}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                {displayValue}
              </span>
              {latest.unit && (
                <span className="text-xs text-gray-400">{latest.unit}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Badge variant={statusVariant}>
              {t(`status.${statusVariant}`)}
            </Badge>
            {trend === 'up' && (
              <TrendingUp className={`h-4 w-4 ${
                statusVariant === 'high' ? 'text-red-400' :
                statusVariant === 'low' ? 'text-green-400' : 'text-gray-300'
              }`} />
            )}
            {trend === 'down' && (
              <TrendingDown className={`h-4 w-4 ${
                statusVariant === 'low' ? 'text-red-400' :
                statusVariant === 'high' ? 'text-green-400' : 'text-gray-300'
              }`} />
            )}
            {trend === 'flat' && <Minus className="h-4 w-4 text-gray-300" />}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{formatDate(latest.report_date)}</span>
          {latest.reference_text && (
            <span>{t('common.ref')}: {latest.reference_text}</span>
          )}
        </div>

        {entries.length > 1 && (
          <div className="mt-2 text-xs text-primary-600">{entries.length} {t('common.measurements')}</div>
        )}
      </CardContent>
    </Card>
  )
}

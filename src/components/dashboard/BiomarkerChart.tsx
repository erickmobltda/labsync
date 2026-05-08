import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Dot,
} from 'recharts'
import type { BiomarkerWithDate } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n'

interface BiomarkerChartProps {
  name: string
  entries: BiomarkerWithDate[]
}

const STATUS_COLOR: Record<string, string> = {
  normal: '#16A34A',
  high: '#DC2626',
  low: '#D97706',
  unknown: '#6B7280',
}

export function BiomarkerChart({ name, entries }: BiomarkerChartProps) {
  const { t, tBiomarker, formatDateShort } = useT()
  const displayName = tBiomarker(name)
  const sorted = [...entries].sort((a, b) => a.report_date.localeCompare(b.report_date))
  const latest = sorted[sorted.length - 1]
  const unit = latest?.unit ?? ''
  const refMin = latest?.reference_min
  const refMax = latest?.reference_max

  const data = sorted
    .filter(e => e.value != null)
    .map(e => ({
      date: formatDateShort(e.report_date),
      value: e.value,
      status: e.status,
    }))

  const statusVariant = (latest?.status ?? 'unknown') as 'normal' | 'high' | 'low' | 'unknown'

  const CustomDot = (props: { cx?: number; cy?: number; payload?: { status: string } }) => {
    const { cx, cy, payload } = props
    if (!cx || !cy || !payload) return null
    const color = STATUS_COLOR[payload.status] ?? '#6B7280'
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={2} />
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{displayName}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{unit}</span>
            <Badge variant={statusVariant} className="text-xs">
              {latest?.value ?? latest?.value_text ?? '—'} {statusVariant !== 'unknown' ? `(${t(`status.${statusVariant}`)})` : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {data.length < 2 ? (
          <div className="flex h-24 items-center justify-center text-xs text-gray-400">
            {t('chart.onlyOne')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0', padding: '6px 10px' }}
                formatter={(value: number) => [`${value} ${unit}`, displayName]}
                labelStyle={{ color: '#64748B', marginBottom: 2 }}
              />
              {refMin != null && (
                <ReferenceLine y={refMin} stroke="#FCD34D" strokeDasharray="4 4" label={{ value: t('common.min'), fontSize: 9, fill: '#D97706' }} />
              )}
              {refMax != null && (
                <ReferenceLine y={refMax} stroke="#FCA5A5" strokeDasharray="4 4" label={{ value: t('common.max'), fontSize: 9, fill: '#DC2626' }} />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

import { CheckCircle, Edit3 } from 'lucide-react'
import type { ExtractedReport } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { statusBg } from '@/lib/utils'

interface ExtractionPreviewProps {
  extracted: ExtractedReport
  onDateChange: (date: string) => void
  onConfirm: () => void
  onReset: () => void
  saving: boolean
}

export function ExtractionPreview({ extracted, onDateChange, onConfirm, onReset, saving }: ExtractionPreviewProps) {
  const normalCount = extracted.biomarkers.filter(b => b.status === 'normal').length
  const highCount = extracted.biomarkers.filter(b => b.status === 'high').length
  const lowCount = extracted.biomarkers.filter(b => b.status === 'low').length

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Extracted {extracted.biomarkers.length} biomarkers
        </div>
        <div className="flex gap-2">
          {normalCount > 0 && <Badge variant="normal">{normalCount} Normal</Badge>}
          {highCount > 0 && <Badge variant="high">{highCount} High</Badge>}
          {lowCount > 0 && <Badge variant="low">{lowCount} Low</Badge>}
        </div>
      </div>

      {/* Date field */}
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <Label htmlFor="report-date" className="flex items-center gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            Report date
          </Label>
          <Input
            id="report-date"
            type="date"
            value={extracted.report_date}
            onChange={e => onDateChange(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Biomarker</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Value</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Unit</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Reference</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {extracted.biomarkers.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{b.name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-900">{b.value}</td>
                  <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">{b.unit}</td>
                  <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{b.reference_text || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBg(b.status as 'normal' | 'high' | 'low' | 'unknown')}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs hidden lg:table-cell">{b.category || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onConfirm} disabled={saving} className="flex-1 sm:flex-none">
          {saving ? 'Saving…' : 'Save to Dashboard'}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={saving}>
          Upload different report
        </Button>
      </div>
    </div>
  )
}

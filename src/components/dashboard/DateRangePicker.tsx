import { CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  onClear: () => void
}

export function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, onClear }: DateRangePickerProps) {
  const hasFilter = startDate || endDate

  return (
    <div className="flex flex-wrap items-end gap-3">
      <CalendarDays className="h-4 w-4 text-gray-400 self-end mb-2 hidden sm:block" />
      <div className="space-y-1">
        <Label htmlFor="start-date" className="text-xs">From</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={e => onStartChange(e.target.value)}
          className="h-8 text-sm w-36"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="end-date" className="text-xs">To</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={e => onEndChange(e.target.value)}
          className="h-8 text-sm w-36"
        />
      </div>
      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-gray-500">
          Clear dates
        </Button>
      )}
    </div>
  )
}

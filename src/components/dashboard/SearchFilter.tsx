import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n'

interface SearchFilterProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchFilter({ value, onChange, placeholder }: SearchFilterProps) {
  const { t } = useT()
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? t('search.placeholder')}
        className="pl-9 pr-8 h-9 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

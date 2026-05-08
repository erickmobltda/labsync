import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

interface CategoryTabsProps {
  categories: string[]
  activeCategory: string
  onChange: (cat: string) => void
}

export function CategoryTabs({ categories, activeCategory, onChange }: CategoryTabsProps) {
  const { t } = useT()
  const all = ['All', ...categories]

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
      {all.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
            activeCategory === cat
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {t(`category.${cat}`)}
        </button>
      ))}
    </div>
  )
}

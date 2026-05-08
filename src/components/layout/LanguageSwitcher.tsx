import { Globe } from 'lucide-react'
import { useT, type Language } from '@/lib/i18n'

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact'
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { lang, setLang } = useT()

  return (
    <label className="relative inline-flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
      <Globe className="h-4 w-4" />
      <select
        value={lang}
        onChange={e => setLang(e.target.value as Language)}
        className={
          variant === 'compact'
            ? 'appearance-none bg-transparent pr-1 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer'
            : 'appearance-none bg-transparent pr-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer'
        }
      >
        <option value="pt-BR">PT-BR</option>
        <option value="en">EN</option>
      </select>
    </label>
  )
}

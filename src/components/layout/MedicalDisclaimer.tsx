import { AlertTriangle } from 'lucide-react'
import { useT } from '@/lib/i18n'

export function MedicalDisclaimer() {
  const { t } = useT()
  return (
    <div className="border-t border-amber-100 bg-amber-50 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-start gap-2 text-xs text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <p>
          <span className="font-semibold">{t('disclaimer.label')}</span>{' '}
          {t('disclaimer.body')}
        </p>
      </div>
    </div>
  )
}

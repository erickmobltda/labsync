import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pill, Plus } from 'lucide-react'
import type { Medicine } from '@/types'
import { Button } from '@/components/ui/button'
import { statusForMedicine } from '@/lib/medicines'
import { todayISO } from '@/lib/utils'
import { useT } from '@/lib/i18n'

interface TodayMedicinesPanelProps {
  medicines: Medicine[]
}

export function TodayMedicinesPanel({ medicines }: TodayMedicinesPanelProps) {
  const navigate = useNavigate()
  const { t } = useT()
  const today = todayISO()

  const activeMeds = useMemo(
    () => medicines.filter(m => statusForMedicine(m, today) === 'active'),
    [medicines, today]
  )

  if (activeMeds.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Pill className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('today.title')}
            </p>
            <p className="text-xs text-gray-400">
              {t('today.subtitle', { count: activeMeds.length })}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/medicines/new')}>
          <Plus className="h-4 w-4" />
          {t('med.add')}
        </Button>
      </div>

      <ul className="divide-y divide-gray-100">
        {activeMeds.map(m => {
          const doseLabel = t(m.pills_per_dose === 1 ? 'today.pill' : 'today.pills', {
            count: m.pills_per_dose,
          })
          const freqLabel = m.times_per_day > 1
            ? t('today.timesPerDay', { count: m.times_per_day })
            : null
          return (
            <li key={m.id}>
              <button
                onClick={() => navigate(`/medicines/${m.id}`)}
                className="flex w-full items-baseline gap-3 py-2.5 text-left hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors"
              >
                <span className="font-medium text-gray-900 text-sm truncate">{m.name}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {doseLabel}
                  {freqLabel && ` · ${freqLabel}`}
                </span>
                <span className="text-xs text-gray-700 truncate ml-auto text-right">
                  {m.schedule
                    ? m.schedule
                    : <span className="text-gray-400 italic">{t('today.noSchedule')}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

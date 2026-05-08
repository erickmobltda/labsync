import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Pill, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMedicines } from '@/hooks/useMedicines'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { cn, formatDate, todayISO } from '@/lib/utils'
import { lastsUntil, statusBadgeClasses, statusForMedicine } from '@/lib/medicines'
import { useT } from '@/lib/i18n'
import type { Medicine, MedicineStatus } from '@/types'

export function MedicinesPage() {
  const { user } = useAuth()
  const { medicines, loading, error, deleteMedicine } = useMedicines(user?.id)
  const navigate = useNavigate()
  const { toasts, toast, close } = useToast()
  const { t } = useT()
  const [tab, setTab] = useState<MedicineStatus>('active')
  const [deleting, setDeleting] = useState<string | null>(null)

  const today = todayISO()

  const buckets = useMemo(() => {
    const result: Record<MedicineStatus, Medicine[]> = { active: [], upcoming: [], past: [] }
    for (const m of medicines) {
      result[statusForMedicine(m, today)].push(m)
    }
    return result
  }, [medicines, today])

  const visible = buckets[tab]

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(t('med.deleteConfirm'))) return
    setDeleting(id)
    try {
      await deleteMedicine(id)
      toast(t('med.deleted'), 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : t('med.deleteFailed'), 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('med.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('med.summary', {
              active: buckets.active.length,
              upcoming: buckets.upcoming.length,
              past: buckets.past.length,
            })}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/medicines/new')}>
          <Plus className="h-4 w-4" />
          {t('med.add')}
        </Button>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {(['active', 'upcoming', 'past'] as MedicineStatus[]).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === tabKey ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t('med.tab', { label: t(`med.status.${tabKey}`), count: buckets[tabKey].length })}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-center text-sm text-red-700">{error}</div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Pill className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-700">{t(`med.empty.${tab}`)}</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs">{t(`med.emptySub.${tab}`)}</p>
          {tab === 'active' && (
            <Button className="mt-5" onClick={() => navigate('/medicines/new')}>
              <Plus className="h-4 w-4" />
              {t('med.add')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(m => {
            const status = statusForMedicine(m, today)
            const ends = lastsUntil(m.bought_on, m.pills_bought, m.pills_per_dose, m.times_per_day)
            return (
              <div
                key={m.id}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer transition-all group"
                onClick={() => navigate(`/medicines/${m.id}`)}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <Pill className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', statusBadgeClasses(status))}>
                      {t(`med.statusLabel.${status}`)}
                    </span>
                    {m.prescription_required && (
                      <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                        {t('med.rx')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('med.dosing', { perDose: m.pills_per_dose, timesPerDay: m.times_per_day })} · {formatDate(m.start_date)}
                    {m.end_date ? ` → ${formatDate(m.end_date)}` : ` → ${t('med.ongoing')}`}
                  </p>
                  {ends && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('med.supplyUntil')} <span className="font-medium text-gray-700">{formatDate(ends)}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={e => handleDelete(m.id, e)}
                    disabled={deleting === m.id}
                    className="rounded-md p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {deleting === m.id ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}

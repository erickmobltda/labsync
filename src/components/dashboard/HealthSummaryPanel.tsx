import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Pill, ShoppingCart, ChevronRight } from 'lucide-react'
import type { Appointment, Medicine } from '@/types'
import { cn, formatDate, todayISO } from '@/lib/utils'
import { TYPE_LABEL, formatTime, typeBadgeClasses } from '@/lib/appointments'
import { lastsUntil, pillsPerDay, statusForMedicine } from '@/lib/medicines'

interface HealthSummaryPanelProps {
  appointments: Appointment[]
  medicines: Medicine[]
}

const REFILL_WARNING_DAYS = 7

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00').getTime()
  const b = new Date(toISO + 'T00:00:00').getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

function pillsRemaining(m: Medicine, today: string): number | null {
  if (!m.bought_on || m.pills_bought == null) return null
  const perDay = pillsPerDay(m.pills_per_dose, m.times_per_day)
  if (perDay <= 0) return m.pills_bought
  const daysSince = Math.max(0, daysBetween(m.bought_on, today))
  return Math.max(0, m.pills_bought - daysSince * perDay)
}

export function HealthSummaryPanel({ appointments, medicines }: HealthSummaryPanelProps) {
  const navigate = useNavigate()
  const today = todayISO()

  const nextAppointment = useMemo(() => {
    return [...appointments]
      .filter(a => a.date >= today)
      .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))[0]
  }, [appointments, today])

  const { activeMeds, refillSoon } = useMemo(() => {
    const active = medicines.filter(m => statusForMedicine(m, today) === 'active')
    const refills = active
      .map(m => {
        const ends = lastsUntil(m.bought_on, m.pills_bought, m.pills_per_dose, m.times_per_day)
        const remaining = pillsRemaining(m, today)
        return { medicine: m, ends, remaining }
      })
      .filter(r => r.ends !== null)
      .filter(r => daysBetween(today, r.ends!) <= REFILL_WARNING_DAYS)
      .sort((a, b) => a.ends!.localeCompare(b.ends!))
    return { activeMeds: active, refillSoon: refills }
  }, [medicines, today])

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Next appointment */}
      <button
        onClick={() => nextAppointment ? navigate(`/appointments/${nextAppointment.id}`) : navigate('/appointments')}
        className="group flex flex-col items-start rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-primary-200 hover:shadow-md transition-all text-left"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
            <Calendar className="h-4 w-4 text-primary-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Next Appointment
          </p>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 ml-auto" />
        </div>
        {nextAppointment ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 text-sm">{nextAppointment.specialty}</p>
              <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', typeBadgeClasses(nextAppointment.type))}>
                {TYPE_LABEL[nextAppointment.type]}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(nextAppointment.date)}
              {nextAppointment.time && ` · ${formatTime(nextAppointment.time)}`}
              {nextAppointment.date === today
                ? ' · Today'
                : ` · in ${daysBetween(today, nextAppointment.date)}d`}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">No upcoming appointments</p>
        )}
      </button>

      {/* Active medicines */}
      <button
        onClick={() => navigate('/medicines')}
        className="group flex flex-col items-start rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-primary-200 hover:shadow-md transition-all text-left"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Pill className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Active Medicines
          </p>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 ml-auto" />
        </div>
        {activeMeds.length > 0 ? (
          <>
            <p className="text-2xl font-bold text-gray-900 leading-none">{activeMeds.length}</p>
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
              {activeMeds.slice(0, 3).map(m => m.name).join(', ')}
              {activeMeds.length > 3 && ` +${activeMeds.length - 3} more`}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">No active medicines</p>
        )}
      </button>

      {/* Refill soon */}
      <button
        onClick={() => navigate('/medicines')}
        className={cn(
          'group flex flex-col items-start rounded-xl border p-4 shadow-sm hover:shadow-md transition-all text-left',
          refillSoon.length > 0
            ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
            : 'border-gray-100 bg-white hover:border-primary-200'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            refillSoon.length > 0 ? 'bg-amber-100' : 'bg-gray-50'
          )}>
            <ShoppingCart className={cn(
              'h-4 w-4',
              refillSoon.length > 0 ? 'text-amber-600' : 'text-gray-400'
            )} />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Refill Soon
          </p>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 ml-auto" />
        </div>
        {refillSoon.length > 0 ? (
          <div className="space-y-1 w-full">
            {refillSoon.slice(0, 2).map(({ medicine, ends, remaining }) => {
              const daysLeft = daysBetween(today, ends!)
              return (
                <div key={medicine.id} className="text-xs">
                  <p className="font-medium text-gray-900 truncate">{medicine.name}</p>
                  <p className="text-amber-700">
                    {remaining != null && `${remaining} pills left · `}
                    {daysLeft <= 0
                      ? 'Out of supply'
                      : daysLeft === 1
                      ? 'Buy by tomorrow'
                      : `Buy by ${formatDate(ends!)}`}
                  </p>
                </div>
              )
            })}
            {refillSoon.length > 2 && (
              <p className="text-xs text-amber-600 font-medium">
                +{refillSoon.length - 2} more need refill
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">All medicines stocked</p>
        )}
      </button>
    </div>
  )
}

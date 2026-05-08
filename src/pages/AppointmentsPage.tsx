import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAppointments } from '@/hooks/useAppointments'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { cn, formatDate, todayISO } from '@/lib/utils'
import { TYPE_LABEL, formatTime, typeBadgeClasses } from '@/lib/appointments'
import type { Appointment } from '@/types'

type Tab = 'upcoming' | 'past'

export function AppointmentsPage() {
  const { user } = useAuth()
  const { appointments, loading, error, deleteAppointment } = useAppointments(user?.id)
  const navigate = useNavigate()
  const { toasts, toast, close } = useToast()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [deleting, setDeleting] = useState<string | null>(null)

  const today = todayISO()

  const { upcoming, past } = useMemo(() => {
    const u: Appointment[] = []
    const p: Appointment[] = []
    for (const a of appointments) {
      if (a.date >= today) u.push(a)
      else p.push(a)
    }
    u.sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
    p.sort((a, b) => (b.date + (b.time ?? '')).localeCompare(a.date + (a.time ?? '')))
    return { upcoming: u, past: p }
  }, [appointments, today])

  const visible = tab === 'upcoming' ? upcoming : past

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this appointment?')) return
    setDeleting(id)
    try {
      await deleteAppointment(id)
      toast('Appointment deleted', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/appointments/new')}>
          <Plus className="h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {(['upcoming', 'past'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
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
            <Calendar className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-700">
            {tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
            {tab === 'upcoming'
              ? 'Schedule a doctor visit, exam, or therapy session to track it here.'
              : 'Past appointments will appear here once their date passes.'}
          </p>
          {tab === 'upcoming' && (
            <Button className="mt-5" onClick={() => navigate('/appointments/new')}>
              <Plus className="h-4 w-4" />
              Add Appointment
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer transition-all group"
              onClick={() => navigate(`/appointments/${a.id}`)}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900 text-sm">{a.specialty}</p>
                  <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', typeBadgeClasses(a.type))}>
                    {TYPE_LABEL[a.type]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(a.date)}
                  {a.time && ` · ${formatTime(a.time)}`}
                </p>
                {a.notes && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{a.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={e => handleDelete(a.id, e)}
                  disabled={deleting === a.id}
                  className="rounded-md p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {deleting === a.id ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                </button>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}

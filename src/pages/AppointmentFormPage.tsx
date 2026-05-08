import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAppointments, type AppointmentInput } from '@/hooks/useAppointments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { cn, todayISO } from '@/lib/utils'
import { APPOINTMENT_TYPES, SPECIALTIES_BY_TYPE } from '@/lib/appointments'
import { useT } from '@/lib/i18n'
import type { AppointmentType } from '@/types'

const selectClasses =
  'flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50'

export function AppointmentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id) && id !== 'new'
  const { user } = useAuth()
  const navigate = useNavigate()
  const { saveAppointment, updateAppointment, getAppointment } = useAppointments(user?.id)
  const { toasts, toast, close } = useToast()
  const { t } = useT()

  const [type, setType] = useState<AppointmentType>('doctor')
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES_BY_TYPE.doctor[0])
  const [date, setDate] = useState<string>(todayISO())
  const [time, setTime] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loadingExisting, setLoadingExisting] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    ;(async () => {
      try {
        const existing = await getAppointment(id)
        if (cancelled || !existing) return
        setType(existing.type)
        setSpecialty(existing.specialty)
        setDate(existing.date)
        setTime(existing.time ? existing.time.slice(0, 5) : '')
        setNotes(existing.notes ?? '')
      } catch (err) {
        toast(err instanceof Error ? err.message : t('appt.loadFailed'), 'error')
      } finally {
        if (!cancelled) setLoadingExisting(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  function handleTypeChange(next: AppointmentType) {
    setType(next)
    if (!SPECIALTIES_BY_TYPE[next].includes(specialty)) {
      setSpecialty(SPECIALTIES_BY_TYPE[next][0])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const payload: AppointmentInput = {
      type,
      specialty,
      date,
      time: time ? time : null,
      notes: notes.trim() ? notes.trim() : null,
    }
    try {
      if (isEdit && id) {
        await updateAppointment(id, payload)
        toast(t('apptForm.updated'), 'success')
      } else {
        await saveAppointment(payload)
        toast(t('apptForm.added'), 'success')
      }
      navigate('/appointments')
    } catch (err) {
      toast(err instanceof Error ? err.message : t('appt.saveFailed'), 'error')
      setSubmitting(false)
    }
  }

  if (loadingExisting) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/appointments')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('apptForm.back')}
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? t('apptForm.editTitle') : t('apptForm.newTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="type">{t('apptForm.type')}</Label>
          <select
            id="type"
            className={selectClasses}
            value={type}
            onChange={e => handleTypeChange(e.target.value as AppointmentType)}
          >
            {APPOINTMENT_TYPES.map(opt => (
              <option key={opt} value={opt}>{t(`apptType.${opt}`)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="specialty">{t('apptForm.specialty')}</Label>
          <select
            id="specialty"
            className={selectClasses}
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
          >
            {SPECIALTIES_BY_TYPE[type].map(s => (
              <option key={s} value={s}>{t(`specialty.${s}`)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="date">{t('apptForm.date')}</Label>
            <Input id="date" type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time">{t('apptForm.time')}</Label>
            <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">{t('apptForm.notes')}</Label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('apptForm.notesPlaceholder')}
            className={cn(selectClasses, 'h-auto py-2 resize-y')}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/appointments')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : isEdit ? t('apptForm.saveChanges') : t('apptForm.add')}
          </Button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}

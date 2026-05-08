import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMedicines, type MedicineInput } from '@/hooks/useMedicines'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { cn, formatDate, todayISO } from '@/lib/utils'
import { lastsUntil, pillsPerDay } from '@/lib/medicines'

const textareaClasses =
  'flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50 resize-y'

export function MedicineFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id) && id !== 'new'
  const { user } = useAuth()
  const navigate = useNavigate()
  const { saveMedicine, updateMedicine, getMedicine } = useMedicines(user?.id)
  const { toasts, toast, close } = useToast()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState('')
  const [pillsPerDose, setPillsPerDose] = useState('1')
  const [timesPerDay, setTimesPerDay] = useState('1')
  const [prescriptionRequired, setPrescriptionRequired] = useState(false)
  const [boughtOn, setBoughtOn] = useState('')
  const [pillsBought, setPillsBought] = useState('')
  const [notes, setNotes] = useState('')
  const [loadingExisting, setLoadingExisting] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    ;(async () => {
      try {
        const existing = await getMedicine(id)
        if (cancelled || !existing) return
        setName(existing.name)
        setStartDate(existing.start_date)
        setEndDate(existing.end_date ?? '')
        setPillsPerDose(String(existing.pills_per_dose))
        setTimesPerDay(String(existing.times_per_day))
        setPrescriptionRequired(existing.prescription_required)
        setBoughtOn(existing.bought_on ?? '')
        setPillsBought(existing.pills_bought == null ? '' : String(existing.pills_bought))
        setNotes(existing.notes ?? '')
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Failed to load', 'error')
      } finally {
        if (!cancelled) setLoadingExisting(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  const perDoseNum = Number(pillsPerDose)
  const timesNum = Number(timesPerDay)
  const boughtNum = pillsBought === '' ? null : Number(pillsBought)
  const dailyTotal = Number.isFinite(perDoseNum) && Number.isFinite(timesNum)
    ? pillsPerDay(perDoseNum, timesNum)
    : 0
  const previewLastsUntil = lastsUntil(
    boughtOn || null,
    boughtNum,
    perDoseNum,
    timesNum
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!name.trim()) {
      toast('Name is required', 'error')
      return
    }
    if (!Number.isFinite(perDoseNum) || perDoseNum <= 0) {
      toast('Pills per dose must be greater than 0', 'error')
      return
    }
    if (!Number.isInteger(timesNum) || timesNum <= 0) {
      toast('Times per day must be a positive integer', 'error')
      return
    }
    setSubmitting(true)
    const payload: MedicineInput = {
      name: name.trim(),
      start_date: startDate,
      end_date: endDate ? endDate : null,
      pills_per_dose: perDoseNum,
      times_per_day: timesNum,
      prescription_required: prescriptionRequired,
      bought_on: boughtOn ? boughtOn : null,
      pills_bought: boughtNum,
      notes: notes.trim() ? notes.trim() : null,
    }
    try {
      if (isEdit && id) {
        await updateMedicine(id, payload)
        toast('Medicine updated', 'success')
      } else {
        await saveMedicine(payload)
        toast('Medicine added', 'success')
      }
      navigate('/medicines')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error')
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
        onClick={() => navigate('/medicines')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to medicines
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit medicine' : 'New medicine'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="name">Medicine name</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Atorvastatin 20mg" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="start_date">Start date</Label>
            <Input id="start_date" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end_date">End date <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input id="end_date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pills_per_dose">Pills per dose</Label>
            <Input
              id="pills_per_dose"
              type="number"
              step="0.5"
              min="0"
              required
              value={pillsPerDose}
              onChange={e => setPillsPerDose(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="times_per_day">Times per day</Label>
            <Input
              id="times_per_day"
              type="number"
              step="1"
              min="1"
              required
              value={timesPerDay}
              onChange={e => setTimesPerDay(e.target.value)}
            />
          </div>
        </div>

        {dailyTotal > 0 && (
          <p className="text-xs text-gray-500 -mt-2">
            That's <span className="font-medium text-gray-700">{dailyTotal} pill{dailyTotal === 1 ? '' : 's'} per day</span>.
          </p>
        )}

        <div className="flex items-center gap-2">
          <input
            id="prescription_required"
            type="checkbox"
            checked={prescriptionRequired}
            onChange={e => setPrescriptionRequired(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          />
          <Label htmlFor="prescription_required" className="cursor-pointer">Prescription required</Label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="bought_on">Bought on <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input id="bought_on" type="date" value={boughtOn} onChange={e => setBoughtOn(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pills_bought">Pills bought <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input
              id="pills_bought"
              type="number"
              step="1"
              min="0"
              value={pillsBought}
              onChange={e => setPillsBought(e.target.value)}
            />
          </div>
        </div>

        {previewLastsUntil && (
          <div className="rounded-md border border-primary-100 bg-primary-50/50 px-3 py-2 text-xs text-primary-800">
            Supply will last until <span className="font-semibold">{formatDate(previewLastsUntil)}</span>
            {boughtNum != null && dailyTotal > 0 && (
              <> ({Math.ceil(boughtNum / dailyTotal)} day{Math.ceil(boughtNum / dailyTotal) === 1 ? '' : 's'} from purchase)</>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Side effects, instructions, prescriber, etc."
            className={cn(textareaClasses)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/medicines')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : isEdit ? 'Save changes' : 'Add medicine'}
          </Button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}

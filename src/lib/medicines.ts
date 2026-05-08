import type { Medicine, MedicineStatus } from '@/types'

export function pillsPerDay(perDose: number, timesPerDay: number): number {
  return perDose * timesPerDay
}

export function lastsUntil(
  boughtOn: string | null,
  pillsBought: number | null,
  perDose: number,
  timesPerDay: number
): string | null {
  if (!boughtOn || pillsBought == null) return null
  const perDay = pillsPerDay(perDose, timesPerDay)
  if (perDay <= 0) return null
  const days = Math.ceil(pillsBought / perDay)
  const d = new Date(boughtOn + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function medicineStatus(
  start: string,
  end: string | null,
  today: string
): MedicineStatus {
  if (start > today) return 'upcoming'
  if (end && end < today) return 'past'
  return 'active'
}

export function statusForMedicine(m: Medicine, today: string): MedicineStatus {
  return medicineStatus(m.start_date, m.end_date, today)
}

export function statusBadgeClasses(status: MedicineStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'upcoming':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'past':
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

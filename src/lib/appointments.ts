import type { AppointmentType } from '@/types'

export const APPOINTMENT_TYPES: AppointmentType[] = ['doctor', 'exam', 'therapy']

export const TYPE_LABEL: Record<AppointmentType, string> = {
  doctor: 'Doctor',
  exam: 'Exam',
  therapy: 'Therapy',
}

export const SPECIALTIES_BY_TYPE: Record<AppointmentType, string[]> = {
  doctor: [
    'Cardiologist',
    'Psychiatrist',
    'Dermatologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Neurologist',
    'Ophthalmologist',
    'Orthopedist',
    'Gynecologist',
    'Urologist',
    'Pediatrician',
    'ENT',
    'Pulmonologist',
    'General Practitioner',
    'Other',
  ],
  exam: [
    'Blood Test',
    'Urine Test',
    'MRI',
    'CT Scan',
    'X-Ray',
    'Ultrasound',
    'ECG',
    'Endoscopy',
    'Mammogram',
    'Biopsy',
    'Other',
  ],
  therapy: [
    'Psychology',
    'Physical Therapy',
    'Occupational Therapy',
    'Speech Therapy',
    'Nutrition',
    'Acupuncture',
    'Massage',
    'Other',
  ],
}

export function typeBadgeClasses(type: AppointmentType): string {
  switch (type) {
    case 'doctor':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'exam':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'therapy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
}

export function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  return `${h}:${m}`
}

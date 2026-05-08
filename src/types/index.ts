export interface Profile {
  id: string
  email: string | null
  created_at: string
}

export interface LabReport {
  id: string
  user_id: string
  report_date: string
  source_filename: string | null
  raw_text: string | null
  storage_path: string | null
  created_at: string
}

export interface Biomarker {
  id: string
  report_id: string
  user_id: string
  name: string
  value: number | null
  value_text: string | null
  unit: string | null
  reference_min: number | null
  reference_max: number | null
  reference_text: string | null
  status: 'normal' | 'high' | 'low' | 'unknown'
  category: string | null
  created_at: string
}

export interface ExtractedBiomarker {
  name: string
  value: number | null
  value_text?: string | null
  unit: string
  reference_text: string
  reference_min: number | null
  reference_max: number | null
  status?: 'normal' | 'high' | 'low' | 'unknown'
  category?: string
}

export interface ExtractedReport {
  report_date: string
  biomarkers: ExtractedBiomarker[]
}

export interface BiomarkerWithDate extends Biomarker {
  report_date: string
}

export type BiomarkerStatus = 'normal' | 'high' | 'low' | 'unknown'

export type AppointmentType = 'doctor' | 'exam' | 'therapy'

export interface Appointment {
  id: string
  user_id: string
  type: AppointmentType
  specialty: string
  date: string
  time: string | null
  notes: string | null
  created_at: string
}

export interface Medicine {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string | null
  pills_per_dose: number
  times_per_day: number
  prescription_required: boolean
  bought_on: string | null
  pills_bought: number | null
  notes: string | null
  created_at: string
}

export type MedicineStatus = 'active' | 'upcoming' | 'past'

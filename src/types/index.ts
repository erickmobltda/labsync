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
  created_at: string
}

export interface Biomarker {
  id: string
  report_id: string
  user_id: string
  name: string
  value: number
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
  value: number
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

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { BiomarkerStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function activeLocale(): string {
  if (typeof window === 'undefined') return 'pt-BR'
  const stored = window.localStorage.getItem('labsync.lang')
  return stored === 'en' ? 'en-US' : 'pt-BR'
}

function toDate(dateStr: string): Date {
  return new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
}

export function formatDate(dateStr: string): string {
  return toDate(dateStr).toLocaleDateString(activeLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return toDate(dateStr).toLocaleDateString(activeLocale(), {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

export function computeStatus(
  value: number,
  min?: number | null,
  max?: number | null
): BiomarkerStatus {
  if (min == null && max == null) return 'unknown'
  if (max != null && value > max) return 'high'
  if (min != null && value < min) return 'low'
  return 'normal'
}

export function statusColor(status: BiomarkerStatus): string {
  switch (status) {
    case 'normal': return 'text-green-600'
    case 'high': return 'text-red-600'
    case 'low': return 'text-yellow-600'
    default: return 'text-gray-500'
  }
}

export function statusBg(status: BiomarkerStatus): string {
  switch (status) {
    case 'normal': return 'bg-green-50 text-green-700 border-green-200'
    case 'high': return 'bg-red-50 text-red-700 border-red-200'
    case 'low': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

export function statusDot(status: BiomarkerStatus): string {
  switch (status) {
    case 'normal': return 'bg-green-500'
    case 'high': return 'bg-red-500'
    case 'low': return 'bg-yellow-500'
    default: return 'bg-gray-400'
  }
}

export function parseReferenceRange(text: string): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null }
  // < 100 or <= 100
  const ltMatch = text.match(/^[<≤]\s*([\d.]+)/)
  if (ltMatch) return { min: null, max: parseFloat(ltMatch[1]) }
  // > 100 or >= 100
  const gtMatch = text.match(/^[>≥]\s*([\d.]+)/)
  if (gtMatch) return { min: parseFloat(gtMatch[1]), max: null }
  // 70 - 100 or 70–100
  const rangeMatch = text.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (rangeMatch) return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) }
  return { min: null, max: null }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

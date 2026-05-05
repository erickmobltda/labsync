import { AlertTriangle } from 'lucide-react'

export function MedicalDisclaimer() {
  return (
    <div className="border-t border-amber-100 bg-amber-50 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-start gap-2 text-xs text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <p>
          <span className="font-semibold">Medical Disclaimer:</span>{' '}
          LabSync is a data consolidation tool for personal reference only. The visualizations and data displayed do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional regarding any medical concerns.
        </p>
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  onTextPaste: (text: string) => void
  disabled?: boolean
}

export function UploadZone({ onFileSelect, onTextPaste, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [mode, setMode] = useState<'drop' | 'paste'>('drop')
  const [pastedText, setPastedText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') onFileSelect(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  function handleTextSubmit() {
    if (pastedText.trim()) {
      onTextPaste(pastedText.trim())
    }
  }

  if (mode === 'paste') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Paste your lab report text</label>
          <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => { setMode('drop'); setPastedText('') }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
          rows={10}
          placeholder="Paste your blood test results here…&#10;&#10;Example:&#10;Glucose: 95 mg/dL (70-100)&#10;HbA1c: 5.4% (<5.7)&#10;Total Cholesterol: 185 mg/dL (<200)"
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
          disabled={disabled}
        />
        <Button onClick={handleTextSubmit} disabled={!pastedText.trim() || disabled} className="w-full">
          Extract Biomarkers
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer',
          dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/30',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 mb-4">
          <Upload className="h-7 w-7 text-primary-600" />
        </div>
        <p className="text-sm font-medium text-gray-700">Drop your PDF here or click to browse</p>
        <p className="mt-1 text-xs text-gray-400">PDF files only · Max 10 MB</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Button variant="outline" className="w-full" onClick={() => setMode('paste')} disabled={disabled}>
        <FileText className="h-4 w-4" />
        Paste report text manually
      </Button>
    </div>
  )
}

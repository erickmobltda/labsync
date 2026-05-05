import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pdfToText } from '@/lib/pdf-parser'
import { extractBiomarkers } from '@/lib/anthropic'
import { useReports } from '@/hooks/useReports'
import { useAuth } from '@/hooks/useAuth'
import { UploadZone } from '@/components/upload/UploadZone'
import { ExtractionPreview } from '@/components/upload/ExtractionPreview'
import { Spinner } from '@/components/ui/spinner'
import { ToastContainer, useToast } from '@/components/ui/toast'
import type { ExtractedReport } from '@/types'

type Step = 'upload' | 'extracting' | 'preview' | 'saving'

export function UploadPage() {
  const { user } = useAuth()
  const { saveReport } = useReports(user?.id)
  const navigate = useNavigate()
  const { toasts, toast, close } = useToast()

  const [step, setStep] = useState<Step>('upload')
  const [extracted, setExtracted] = useState<ExtractedReport | null>(null)
  const [sourceFilename, setSourceFilename] = useState<string | null>(null)
  const [rawText, setRawText] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setStep('extracting')
    setSourceFilename(file.name)
    try {
      const text = await pdfToText(file)
      setRawText(text)
      const result = await extractBiomarkers(text)
      setExtracted(result)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
      setStep('upload')
    }
  }

  async function handleText(text: string) {
    setError(null)
    setStep('extracting')
    setRawText(text)
    setSourceFilename(null)
    try {
      const result = await extractBiomarkers(text)
      setExtracted(result)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
      setStep('upload')
    }
  }

  async function handleConfirm() {
    if (!extracted) return
    setStep('saving')
    try {
      await saveReport(extracted, sourceFilename, rawText)
      toast('Report saved successfully!', 'success')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      toast('Failed to save report', 'error')
      setStep('preview')
    }
  }

  function handleReset() {
    setStep('upload')
    setExtracted(null)
    setSourceFilename(null)
    setRawText('')
    setError(null)
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Upload Lab Report</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a PDF or paste text — we'll extract and structure your biomarkers automatically.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        {step === 'upload' && (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <UploadZone onFileSelect={handleFile} onTextPaste={handleText} />
          </>
        )}

        {step === 'extracting' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Spinner size="lg" />
            <div className="text-center">
              <p className="font-medium text-gray-700">Analyzing your report…</p>
              <p className="mt-1 text-sm text-gray-400">Claude is extracting your biomarkers</p>
            </div>
          </div>
        )}

        {(step === 'preview' || step === 'saving') && extracted && (
          <ExtractionPreview
            extracted={extracted}
            onDateChange={date => setExtracted(prev => prev ? { ...prev, report_date: date } : prev)}
            onConfirm={handleConfirm}
            onReset={handleReset}
            saving={step === 'saving'}
          />
        )}
      </div>

      {/* Tips */}
      {step === 'upload' && (
        <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Tips for best results</h3>
          <ul className="space-y-1 text-xs text-blue-700">
            <li>• Use the original PDF from your laboratory, not a scanned photo</li>
            <li>• Reports with clear table formatting extract most accurately</li>
            <li>• You can review and confirm the extracted data before saving</li>
            <li>• Supported: complete blood count, lipid panel, metabolic panel, thyroid, vitamins, and more</li>
          </ul>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}

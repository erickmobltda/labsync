import { apiFetch } from './api'

// PDFs are stored by erickmob-api in a private Oracle Object Storage bucket.
// `path` is "{uid}/{uuid}.pdf"; the API only serves paths under the caller's uid.

export async function uploadReportPdf(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await apiFetch('/labsync/pdfs', { method: 'POST', body: form })
  const { path } = (await res.json()) as { path: string }
  return path
}

/** Downloads the PDF with the user's token and returns a local blob: URL. */
export async function getReportPdfUrl(path: string): Promise<string> {
  const res = await apiFetch(`/labsync/pdfs/${path}`)
  return URL.createObjectURL(await res.blob())
}

export async function deleteReportPdf(path: string): Promise<void> {
  await apiFetch(`/labsync/pdfs/${path}`, { method: 'DELETE' })
}

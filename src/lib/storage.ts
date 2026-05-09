import { supabase } from './supabase'
import { IS_LOCAL, getLocalToken } from './data-api'

const BUCKET = 'lab-reports'
const SIGNED_URL_TTL_SECONDS = 60 * 5

export async function uploadReportPdf(file: File, userId: string): Promise<string> {
  if (IS_LOCAL) {
    const formData = new FormData()
    formData.append('file', file)
    const token = getLocalToken()
    const res = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(err.error || 'Upload failed')
    }
    const { path } = await res.json()
    return path
  }

  const path = `${userId}/${crypto.randomUUID()}.pdf`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: 'application/pdf', upsert: false })
  if (error) throw error
  return path
}

export async function getReportPdfUrl(path: string): Promise<string> {
  if (IS_LOCAL) {
    // Return a direct API URL; the browser will hit it with the token in headers
    // via a signed fetch — but for <iframe> / window.open we pass a temp token in QS.
    const token = getLocalToken()
    return `/api/storage/file/${path}?token=${token ?? ''}`
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error) throw error
  return data.signedUrl
}

export async function deleteReportPdf(path: string): Promise<void> {
  if (IS_LOCAL) {
    const token = getLocalToken()
    await fetch(`/api/storage/file/${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    return
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

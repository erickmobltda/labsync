import { supabase } from './supabase'

const BUCKET = 'lab-reports'
const SIGNED_URL_TTL_SECONDS = 60 * 5

export async function uploadReportPdf(file: File, userId: string): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.pdf`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    })
  if (error) throw error
  return path
}

export async function getReportPdfUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error) throw error
  return data.signedUrl
}

export async function deleteReportPdf(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

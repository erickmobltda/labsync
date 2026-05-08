import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Activity, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { t } = useT()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleCallback() {
      // Supabase sets the session from the URL hash automatically
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setErrorMsg(error.message)
        setStatus('error')
        return
      }

      if (data.session) {
        setStatus('success')
        setTimeout(() => navigate('/dashboard'), 1200)
      } else {
        // Try to exchange token from hash
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (setError) {
            setErrorMsg(setError.message)
            setStatus('error')
          } else {
            setStatus('success')
            setTimeout(() => navigate('/dashboard'), 1200)
          }
        } else {
          setErrorMsg(t('authcb.noSession'))
          setStatus('error')
        }
      }
    }

    handleCallback()
  }, [navigate, t])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
          <Activity className="h-8 w-8 text-white" />
        </div>

        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
            <p className="text-gray-600">{t('authcb.signing')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <h2 className="font-semibold text-gray-900">{t('authcb.success')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('authcb.successSub')}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <h2 className="font-semibold text-gray-900">{t('authcb.failed')}</h2>
            <p className="mt-1 text-sm text-gray-500">{errorMsg}</p>
            <Button className="mt-4" onClick={() => navigate('/login')}>
              {t('authcb.backToLogin')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

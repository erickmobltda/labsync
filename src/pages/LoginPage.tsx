import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Shield, TrendingUp, FileText } from 'lucide-react'
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm'
import { MagicLinkForm } from '@/components/auth/MagicLinkForm'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { t } = useT()
  const [useMagicLink, setUseMagicLink] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')
  }, [user, loading, navigate])

  const features = [
    { icon: FileText, text: t('login.feat.upload') },
    { icon: TrendingUp, text: t('login.feat.trends') },
    { icon: Shield, text: t('login.feat.private') },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="compact" />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('login.welcome')}</h1>
          <p className="mt-1.5 text-gray-500 text-sm">{t('login.subtitle')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-xl p-8">
          {useMagicLink ? (
            <>
              <h2 className="mb-1 text-lg font-semibold text-gray-900">{t('login.magicTitle')}</h2>
              <p className="mb-6 text-sm text-gray-500">{t('login.magicSubtitle')}</p>
              <MagicLinkForm />
            </>
          ) : (
            <>
              <h2 className="mb-1 text-lg font-semibold text-gray-900">{t('login.passwordTitle')}</h2>
              <p className="mb-6 text-sm text-gray-500">{t('login.passwordSubtitle')}</p>
              <EmailPasswordForm />
            </>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">{t('zone.or')}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => setUseMagicLink(v => !v)}
            className="mt-4 w-full text-sm text-primary-600 hover:underline"
          >
            {useMagicLink ? t('login.usePasswordInstead') : t('login.useMagicInstead')}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-2.5">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm">
                <Icon className="h-3.5 w-3.5 text-primary-600" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

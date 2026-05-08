import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Upload, TrendingUp, Shield, FileText, BarChart3, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { t } = useT()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')
  }, [user, loading, navigate])

  const features = [
    {
      icon: Upload,
      title: t('landing.feat.smartUpload.title'),
      desc: t('landing.feat.smartUpload.desc'),
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: TrendingUp,
      title: t('landing.feat.trend.title'),
      desc: t('landing.feat.trend.desc'),
      color: 'bg-teal-50 text-teal-600',
    },
    {
      icon: Shield,
      title: t('landing.feat.private.title'),
      desc: t('landing.feat.private.desc'),
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: FileText,
      title: t('landing.feat.anyLab.title'),
      desc: t('landing.feat.anyLab.desc'),
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: BarChart3,
      title: t('landing.feat.categorical.title'),
      desc: t('landing.feat.categorical.desc'),
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Zap,
      title: t('landing.feat.insights.title'),
      desc: t('landing.feat.insights.desc'),
      color: 'bg-yellow-50 text-yellow-600',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex h-14 items-center border-b border-gray-100 bg-white/95 backdrop-blur px-4 lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          LabSync
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher variant="compact" />
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>{t('landing.signInBtn')}</Button>
          <Button size="sm" onClick={() => navigate('/login')}>{t('landing.getStartedFree')}</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 px-4 py-20 text-center lg:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            <Activity className="h-3.5 w-3.5" />
            {t('brand.tagline')}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl text-balance">
            {t('landing.heroTitleA')}<br />
            <span className="text-primary-600">{t('landing.heroTitleB')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600 text-balance">
            {t('landing.heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              {t('landing.startForFree')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              {t('landing.seeDemo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            {t('landing.featuresTitle')}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold">{t('landing.ctaTitle')}</h2>
          <p className="mt-3 text-primary-200">
            {t('landing.ctaSubtitle')}
          </p>
          <Button
            size="lg"
            className="mt-6 bg-white text-primary-700 hover:bg-primary-50"
            onClick={() => navigate('/login')}
          >
            {t('landing.ctaButton')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400">
        <p>{t('landing.footerLine1')}</p>
        <p className="mt-1">© {new Date().getFullYear()} LabSync</p>
      </footer>
    </div>
  )
}

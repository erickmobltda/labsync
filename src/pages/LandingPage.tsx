import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Upload, TrendingUp, Shield, FileText, BarChart3, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const features = [
  {
    icon: Upload,
    title: 'Smart Upload',
    desc: 'Drop a PDF or paste text. Our AI extracts every biomarker automatically.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Trend Tracking',
    desc: 'Interactive charts show how your values change over time, by category.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your data is encrypted and row-level isolated — only you can see it.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: FileText,
    title: 'Any Lab Format',
    desc: 'Works with reports from any laboratory, worldwide.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Categorical Views',
    desc: 'Lipid Panel, Blood Count, Thyroid, Vitamins — grouped intelligently.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    desc: 'Status indicators highlight high, low, and normal values at a glance.',
    color: 'bg-yellow-50 text-yellow-600',
  },
]

export function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')
  }, [user, loading, navigate])

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
        <div className="ml-auto flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
          <Button size="sm" onClick={() => navigate('/login')}>Get started free</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 px-4 py-20 text-center lg:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            <Activity className="h-3.5 w-3.5" />
            Blood test intelligence
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl text-balance">
            Your health data,<br />
            <span className="text-primary-600">beautifully organized</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600 text-balance">
            Upload any blood test PDF and instantly see your biomarker trends over time — with status indicators, category grouping, and interactive charts.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              Start for free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              See a demo →
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            Everything you need to understand your health
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
          <h2 className="text-2xl font-bold">Take control of your health data</h2>
          <p className="mt-3 text-primary-200">
            Free to use. No credit card required. Your data stays yours.
          </p>
          <Button
            size="lg"
            className="mt-6 bg-white text-primary-700 hover:bg-primary-50"
            onClick={() => navigate('/login')}
          >
            Get started — it's free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400">
        <p>LabSync is a data consolidation tool only. Not medical advice or diagnosis.</p>
        <p className="mt-1">© {new Date().getFullYear()} LabSync</p>
      </footer>
    </div>
  )
}

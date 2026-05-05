import { useEffect, useRef } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UploadPage } from '@/pages/UploadPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ReportDetailPage } from '@/pages/ReportDetailPage'
import { Spinner } from '@/components/ui/spinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// Handles the case where Supabase redirects to the base URL with #access_token=...
// (hash routing + magic link conflict). Waits for the Supabase client to process
// the token from the hash, then navigates to the dashboard.
function CatchAll() {
  const navigate = useNavigate()
  const hasAuthToken = window.location.hash.includes('access_token=')
  const handled = useRef(false)

  useEffect(() => {
    if (!hasAuthToken) {
      navigate('/', { replace: true })
      return
    }

    const timeout = setTimeout(() => {
      if (!handled.current) navigate('/login', { replace: true })
    }, 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !handled.current) {
        handled.current = true
        clearTimeout(timeout)
        navigate('/dashboard', { replace: true })
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !handled.current) {
        handled.current = true
        clearTimeout(timeout)
        navigate('/dashboard', { replace: true })
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [hasAuthToken, navigate])

  if (!hasAuthToken) return null

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
        </Route>
        <Route path="*" element={<CatchAll />} />
      </Routes>
    </HashRouter>
  )
}

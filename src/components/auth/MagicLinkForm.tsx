import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/lib/i18n'

export function MagicLinkForm() {
  const { signInWithMagicLink } = useAuth()
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      await signInWithMagicLink(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('magic.failed'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{t('magic.sentTitle')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('magic.sentBody', { email })}
          </p>
        </div>
        <button
          className="text-sm text-primary-600 hover:underline"
          onClick={() => { setSent(false); setEmail('') }}
        >
          {t('magic.useDifferent')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t('magic.emailLabel')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder={t('magic.placeholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="pl-9"
            autoComplete="email"
            required
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading || !email} className="w-full">
        {loading ? (
          t('magic.sending')
        ) : (
          <>
            {t('magic.send')}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}

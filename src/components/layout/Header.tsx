import { Activity, LogOut, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-gray-100 bg-white/95 backdrop-blur px-4 lg:px-6">
      <button
        className="mr-3 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 font-semibold text-gray-900">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <span>LabSync</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span className="truncate max-w-[160px]">{user.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-500">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, FileText, Activity, Calendar, Pill } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload Report' },
  { to: '/reports', icon: FileText, label: 'My Reports' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/medicines', icon: Pill, label: 'Medicines' },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-100 bg-white transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo (mobile) */}
        <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-5 font-semibold text-gray-900 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          LabSync
        </div>

        <nav className="flex-1 space-y-1 p-3 pt-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <p className="text-xs text-gray-400">LabSync v0.1.0</p>
        </div>
      </aside>
    </>
  )
}

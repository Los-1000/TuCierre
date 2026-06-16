'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Calculator, Gift, ArrowLeftRight, LogOut } from 'lucide-react'
import { cn, generateInitials } from '@/lib/utils'
import { api } from '@/lib/api'
import type { ApiBroker } from '@/types/api'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tramites', label: 'Mis Trámites', icon: FileText },
  { href: '/cotizar', label: 'Cotizar', icon: Calculator },
  { href: '/recompensas', label: 'Recompensas', icon: Gift },
  { href: '/price-match', label: 'Price Match', icon: ArrowLeftRight },
]

interface SidebarProps { broker: ApiBroker | null }

export default function Sidebar({ broker }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await api.auth.logout().catch(() => {})
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-0 h-full bg-white border-r border-navy-100 z-20">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-navy-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: '#0f1d3d', color: '#2c4dfb' }}>
            T
          </div>
          <span className="font-bold text-navy-900 tracking-tight">TuCierre</span>
        </div>
      </div>

      {/* Broker chip */}
      {broker && (
        <Link
          href="/perfil"
          className="mx-3 mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-navy-50 transition-colors group"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 text-white"
            style={{ background: '#2c4dfb' }}
          >
            {generateInitials(broker.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-navy-900 truncate leading-none">
              {broker.fullName.split(' ')[0]}
            </div>
            <div className="text-xs mt-1 text-navy-400">
              Ver mi perfil
            </div>
          </div>
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'text-navy-900 font-semibold'
                  : 'text-navy-500 hover:bg-navy-50 hover:text-navy-900'
              )}
              style={active ? { background: '#eff2ff', color: '#2c4dfb' } : {}}
            >
              <Icon size={16} style={active ? { color: '#2c4dfb' } : {}} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-400 hover:bg-navy-50 hover:text-navy-700 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

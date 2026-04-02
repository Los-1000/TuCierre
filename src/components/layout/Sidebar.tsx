'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Calculator, Gift, ArrowLeftRight,
  Settings, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateInitials } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { Broker } from '@/types/database'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tramites', label: 'Mis Trámites', icon: FileText },
  { href: '/cotizar', label: 'Cotizar', icon: Calculator },
  { href: '/recompensas', label: 'Recompensas', icon: Gift },
  { href: '/price-match', label: 'Price Match', icon: ArrowLeftRight },
]

interface SidebarProps {
  broker: Broker | null
}

export default function Sidebar({ broker }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tier = broker?.tier ?? 'bronce'
  const tierConfig = TIER_CONFIG[tier]

  return (
    <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-0 h-full bg-white border-r border-[#18181B]/8 z-20">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-[#18181B]/8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="font-semibold text-[18px] text-[#18181B] tracking-tight">TuCierre</span>
        </Link>
      </div>

      {/* Broker info */}
      {broker && (
        <Link
          href="/perfil"
          className="mx-3 mt-4 flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#18181B]/4 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-[#18181B] flex items-center justify-center text-white font-semibold text-xs shrink-0">
            {generateInitials(broker.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#18181B] truncate leading-none">
              {broker.full_name.split(' ')[0]}
            </div>
            <div className={cn('text-xs font-medium mt-0.5 leading-none', tierConfig.color)}>
              {tierConfig.icon} {tierConfig.label}
              {tierConfig.discount > 0 && ` · ${tierConfig.discount}%`}
            </div>
          </div>
        </Link>
      )}

      {/* Divider */}
      <div className="mx-5 my-3 h-px bg-[#18181B]/8" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#D47151]/8 border-l-[3px] border-[#D47151] text-[#D47151] font-semibold rounded-r-xl'
                  : 'text-[#18181B]/60 hover:text-[#18181B] hover:bg-[#18181B]/4 rounded-xl'
              )}
            >
              <item.icon size={16} className={isActive ? 'text-[#D47151]' : ''} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mx-3 mb-3 space-y-0.5 border-t border-[#18181B]/8 pt-3">
        <Link
          href="/perfil"
          className={cn(
            'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all',
            pathname === '/perfil'
              ? 'bg-[#D47151]/8 border-l-[3px] border-[#D47151] text-[#D47151] font-semibold rounded-r-xl'
              : 'text-[#18181B]/60 hover:text-[#18181B] hover:bg-[#18181B]/4 rounded-xl'
          )}
        >
          <Settings size={16} />
          Configuración
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-[#18181B]/60 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

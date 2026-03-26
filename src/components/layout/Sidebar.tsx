'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Calculator, Gift, ArrowLeftRight,
  Settings, LogOut, Shield
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
    <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-0 h-full bg-white border-r border-border z-20">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-navy rounded-lg flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <span className="font-display font-semibold text-base text-ink">TuCierre</span>
        </Link>
      </div>

      {/* Broker info */}
      {broker && (
        <Link
          href="/perfil"
          className="mx-3 mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-parchment font-semibold text-xs shrink-0">
            {generateInitials(broker.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink truncate leading-none">{broker.full_name.split(' ')[0]}</div>
            <div className={cn('text-xs font-medium mt-0.5 leading-none', tierConfig.color)}>
              {tierConfig.icon} {tierConfig.label}
              {tierConfig.discount > 0 && ` · ${tierConfig.discount}%`}
            </div>
          </div>
        </Link>
      )}

      {/* Divider */}
      <div className="mx-5 my-3 h-px bg-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-navy text-parchment shadow-sm'
                  : 'text-muted-foreground hover:text-ink hover:bg-muted'
              )}
            >
              <item.icon size={16} className={isActive ? 'text-parchment' : ''} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-gold" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mx-3 mb-3 space-y-0.5 border-t border-border pt-3">
        <Link
          href="/perfil"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            pathname === '/perfil'
              ? 'bg-brand-navy text-parchment'
              : 'text-muted-foreground hover:text-ink hover:bg-muted'
          )}
        >
          <Settings size={16} />
          Configuración
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

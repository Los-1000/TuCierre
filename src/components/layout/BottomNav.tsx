'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Calculator, ArrowLeftRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/tramites', label: 'Trámites', icon: FileText },
  { href: '/cotizar', label: 'Cotizar', icon: Calculator, primary: true },
  { href: '/price-match', label: 'P. Match', icon: ArrowLeftRight },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-navy-100 pb-safe">
      <div className="flex items-stretch h-16">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex-1 flex flex-col items-center justify-center group"
              >
                <div
                  className="w-12 h-12 -mt-5 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform"
                  style={{ background: '#2c4dfb', boxShadow: '0 4px 14px rgba(44,77,251,0.4)' }}
                >
                  <item.icon size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-medium text-navy-400 mt-1">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 relative flex flex-col items-center justify-center gap-1 pt-1 transition-colors',
                isActive ? 'text-navy-900' : 'text-navy-400 hover:text-navy-600'
              )}
            >
              <item.icon size={18} style={isActive ? { color: '#2c4dfb' } : {}} />
              <span className="text-[10px] font-medium" style={isActive ? { color: '#2c4dfb' } : {}}>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#2c4dfb' }} />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

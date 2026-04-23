'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Calculator, Gift, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/tramites', label: 'Trámites', icon: FileText },
  { href: '/cotizar', label: 'Cotizar', icon: Calculator, primary: true },
  { href: '/recompensas', label: 'Puntos', icon: Gift },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-[#18181B]/8 pb-safe">
      <div className="flex items-stretch h-16">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 -mt-4 rounded-2xl bg-[#2855E0] shadow-[0_4px_16px_rgba(40,85,224,0.35)] flex items-center justify-center group-active:scale-95 transition-transform">
                  <item.icon size={20} className="text-white" />
                </div>
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 relative flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-[#18181B]' : 'text-[#18181B]/40'
              )}
            >
              <item.icon size={19} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2855E0]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

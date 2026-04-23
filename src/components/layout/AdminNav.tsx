'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Gift } from 'lucide-react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tramites', label: 'Todos los Trámites', icon: FileText },
  { href: '/admin/brokers', label: 'Brokers', icon: Users },
  { href: '/admin/referidos', label: 'Referidos', icon: Gift },
]

export function AdminNav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-0.5 px-2">
      {adminNavItems.map(item => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-tight transition-all rounded-lg ${
              isActive
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

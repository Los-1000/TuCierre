'use client'

import Link from 'next/link'
import { Menu, Shield } from 'lucide-react'
import { generateInitials, cn } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import type { Broker } from '@/types/database'

interface TopBarProps {
  broker: Broker | null
  onMenuClick: () => void
}

export default function TopBar({ broker, onMenuClick }: TopBarProps) {
  const tier = broker?.tier ?? 'bronce'
  const tierConfig = TIER_CONFIG[tier]

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-border lg:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={19} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-navy rounded-md flex items-center justify-center">
              <Shield size={11} className="text-white" />
            </div>
            <span className="font-display font-semibold text-base text-ink">TuCierre</span>
          </Link>
        </div>

        <Link href="/perfil" className="flex items-center gap-2">
          {broker && (
            <span className={cn('text-xs font-medium hidden sm:block', tierConfig.color)}>
              {tierConfig.icon} {tierConfig.label}
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-parchment font-semibold text-[11px]">
            {broker ? generateInitials(broker.full_name) : '?'}
          </div>
        </Link>
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { generateInitials } from '@/lib/utils'
import type { ApiBroker } from '@/types/api'

const TIER_COLORS: Record<string, string> = {
  bronce: '#E07A3C',
  plata: '#8EA2C4',
  oro: '#F0AA20',
}

interface TopBarProps {
  broker: ApiBroker | null
  onMenuClick: () => void
}

export default function TopBar({ broker, onMenuClick }: TopBarProps) {
  const tierColor = TIER_COLORS[broker?.tierName?.toLowerCase() ?? 'bronce'] ?? TIER_COLORS.bronce

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-navy-100 lg:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-navy-500 hover:bg-navy-50 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs" style={{ background: '#0f1d3d', color: '#2c4dfb' }}>T</div>
            <span className="font-bold text-navy-900 tracking-tight text-sm">TuCierre</span>
          </div>
        </div>

        <Link href="/perfil" className="flex items-center gap-2">
          {broker && (
            <span className="text-xs font-semibold hidden sm:block capitalize" style={{ color: tierColor }}>
              {broker.tierName}
            </span>
          )}
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[11px] text-white" style={{ background: '#2c4dfb' }}>
            {broker ? generateInitials(broker.fullName) : '?'}
          </div>
        </Link>
      </div>
    </header>
  )
}

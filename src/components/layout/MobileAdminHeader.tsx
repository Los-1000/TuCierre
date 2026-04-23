'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { AdminNav } from './AdminNav'

export function MobileAdminHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#18181B] z-30 flex items-center justify-between px-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <Logo variant="light" size="md" href="/admin" />
          <span className="px-2 py-0.5 border border-red-500/40 bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
            ADMIN
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de navegación"
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Off-canvas drawer */}
      <aside
        aria-label="Menú de navegación admin"
        className={`lg:hidden fixed left-0 top-0 h-full w-[240px] bg-[#18181B] z-50 flex flex-col transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-white/8">
          <div>
            <Logo variant="light" size="md" href="/admin" />
            <span className="inline-block mt-1 px-2 py-0.5 border border-red-500/40 bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
              ADMIN
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="mt-1 p-1.5 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
      </aside>
    </>
  )
}

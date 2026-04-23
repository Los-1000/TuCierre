'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Logo } from '@/components/ui/Logo'

const NAV_LINKS = [
  ['Cómo funciona', '#como-funciona'],
  ['Características', '#features'],
  ['Precios', '#precios'],
] as const

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a')
      firstLink?.focus()
    }
  }, [open])

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-brand-navy"
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-3 flex items-center justify-between">

        <div className="flex items-center gap-8">
          {/* Image blends into navy navbar — only white letters visible */}
          <Logo size="sm" href="/" />

          <div className="hidden md:flex gap-7 items-center">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium transition-colors text-white/65 hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:block px-4 py-3 text-sm font-semibold transition-colors text-white/65 hover:text-white"
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="hidden md:block px-5 py-3 text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-110 transition-all active:scale-95 bg-brand-blue"
          >
            Empezar gratis
          </Link>

          <button
            className="md:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors text-white/80 hover:text-white"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="md:hidden border-t border-white/8 px-6 py-6 space-y-1 bg-brand-navy"
        >
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-base font-medium py-3.5 text-white/65 hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="pt-4 space-y-3 border-t border-brand-navy/8">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-center px-6 py-3.5 text-sm font-semibold border rounded-lg text-white/80 border-white/15 hover:text-white transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block text-center px-6 py-3.5 text-white rounded-lg text-sm font-bold bg-brand-blue"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

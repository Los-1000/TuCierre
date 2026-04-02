'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)

  const NAV_LINKS = [
    ['Cómo funciona', '#como-funciona'],
    ['Características', '#features'],
    ['Precio', '#precios'],
  ] as const

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#00081e]/90 backdrop-blur-md shadow-sm border-b border-white/10">
      <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white hover:text-[#d06d0d] transition-colors">
            Tu Cierre
          </Link>
          <div className="hidden md:flex gap-8 items-center text-sm font-semibold tracking-tight">
            {NAV_LINKS.map(([label, href]) => (
              <a key={label} href={href} className="text-white/60 hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="hidden md:block px-6 py-2 bg-[#d06d0d] text-white rounded-lg text-sm font-bold shadow-md hover:brightness-110 transition-all active:scale-95"
          >
            Empezar gratis
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d06d0d]"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-6 py-6 space-y-4" style={{ background: '#00081e' }}>
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-base font-semibold text-white/70 hover:text-white transition-colors py-2"
            >
              {label}
            </a>
          ))}
          <div className="pt-4 space-y-3 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-center px-6 py-3 text-sm font-semibold text-white/70 border border-white/20 rounded-lg hover:text-white hover:border-white/40 transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block text-center px-6 py-3 bg-[#d06d0d] text-white rounded-lg text-sm font-bold hover:brightness-110 transition-all"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

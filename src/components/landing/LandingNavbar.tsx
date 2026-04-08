'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAV_LINKS = [
  ['Cómo funciona', '#como-funciona'],
  ['Características', '#features'],
  ['Precios', '#precios'],
] as const

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'rgba(248,250,255,0.96)',
        backdropFilter: 'blur(12px)',
        borderColor: '#DBEAFE',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-3.5 flex items-center justify-between">

        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black tracking-tighter" style={{ color: '#0F172A' }}>
            Tu<span style={{ color: '#2563EB' }}>Cierre</span>
          </Link>

          <div className="hidden md:flex gap-7 items-center">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium transition-colors hover:text-[#0F172A]"
                style={{ color: '#475569' }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:block px-4 py-2 text-sm font-semibold transition-colors hover:text-[#0F172A]"
            style={{ color: '#475569' }}
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="hidden md:block px-5 py-2.5 text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-110 transition-all active:scale-95"
            style={{ background: '#2563EB' }}
          >
            Empezar gratis
          </Link>

          <button
            className="md:hidden p-2 transition-colors"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            style={{ color: '#0F172A' }}
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
          className="md:hidden border-t px-6 py-6 space-y-1"
          style={{ background: '#F8FAFF', borderColor: '#DBEAFE' }}
        >
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-base font-medium py-3 transition-colors"
              style={{ color: '#475569' }}
            >
              {label}
            </a>
          ))}
          <div className="pt-4 space-y-3 border-t" style={{ borderColor: '#DBEAFE' }}>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-center px-6 py-3 text-sm font-semibold border rounded-lg transition-colors"
              style={{ color: '#475569', borderColor: '#DBEAFE' }}
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block text-center px-6 py-3 text-white rounded-lg text-sm font-bold hover:brightness-110 transition-all"
              style={{ background: '#2563EB' }}
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

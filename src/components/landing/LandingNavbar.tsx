'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Comisiones', href: '#precios' },
  { label: 'Testimonios', href: '#testimonios' },
]

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl z-50 transition-all duration-300',
          scrolled ? 'top-2' : ''
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between px-6 py-3.5 rounded-full border transition-all duration-300',
            scrolled
              ? 'bg-[#FFFEF5]/90 backdrop-blur-md border-[#12161F]/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
              : 'bg-[#FFFEF5]/80 backdrop-blur-sm border-[#12161F]/5 shadow-sm'
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-[#12161F] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="#C9880E" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-[16px] text-[#12161F] tracking-tight">TuCierre</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#como-funciona" className="text-[13px] font-medium text-[#12161F]/60 hover:text-[#12161F] transition-colors">
              Cómo funciona
            </Link>
            <Link href="#beneficios" className="text-[13px] font-medium text-[#12161F]/60 hover:text-[#12161F] transition-colors">
              Beneficios
            </Link>
            <Link href="#precios" className="text-[13px] font-medium text-[#12161F]/60 hover:text-[#12161F] transition-colors">
              Precios
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-semibold text-[#12161F] hover:text-[#C9880E] px-4 py-2 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-semibold bg-[#12161F] text-[#FFFEF5] px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1 p-1.5"
            aria-label="Menú"
          >
            <div className={cn('w-4 h-[1.5px] bg-[#12161F] transition-all duration-300', mobileMenuOpen && 'rotate-45 translate-y-[3.5px]')} />
            <div className={cn('w-4 h-[1.5px] bg-[#12161F] transition-all duration-300', mobileMenuOpen && '-rotate-45 -translate-y-[2px]')} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={cn(
        'fixed inset-x-0 top-[72px] z-40 md:hidden transition-all duration-300',
        mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        <div className="mx-4 bg-[#FFFEF5]/95 backdrop-blur-xl rounded-2xl border border-[#12161F]/8 shadow-lg p-5 space-y-4">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[15px] text-[#12161F]/70 font-medium py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#12161F]/8 flex gap-3">
            <Link href="/login" className="text-[14px] text-[#12161F]/60 font-medium py-1">Ingresar</Link>
          </div>
        </div>
      </div>
    </>
  )
}

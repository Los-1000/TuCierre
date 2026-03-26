'use client'

// Tiny client component — only the scroll-reactive navbar
// Keeps the entire landing page as a server component (better SEO + smaller JS bundle)

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Precios', href: '#precios' },
]

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled
        ? 'bg-[#09101C]/95 backdrop-blur-sm border-b border-white/8'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
              <Shield size={15} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-[#EDE8DF] tracking-tight">TuCierre</span>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#EDE8DF]/60 hover:text-[#EDE8DF] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm text-[#EDE8DF]/70 hover:text-[#EDE8DF] transition-colors px-3 py-1.5"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Empezar gratis
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

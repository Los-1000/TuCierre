'use client'

import Link from 'next/link'

export default function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-10 py-5 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D47151]/15">
        <Link href="/" className="text-[13px] font-black tracking-widest uppercase text-white/60 hover:text-[#D47151] transition-colors">
          TC
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {[['Cómo funciona', '#como-funciona'], ['Características', '#features'], ['Precios', '#precios']].map(([label, href]) => (
            <a key={label} href={href} className="text-[11px] font-light uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <Link href="/login" className="text-[11px] uppercase tracking-widest font-light text-white/35 hover:text-white transition-colors">
            Ingresar
          </Link>
          <Link href="/register" className="text-[11px] font-black uppercase tracking-widest bg-[#D47151] text-white rounded-full px-5 py-2.5 hover:bg-[#A6553A] transition-colors">
            Empezar gratis
          </Link>
        </div>
      </div>
    </nav>
  )
}

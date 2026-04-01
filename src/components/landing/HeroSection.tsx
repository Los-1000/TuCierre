'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

const CommissionCalculator = dynamic(
  () => import('@/components/landing/CommissionCalculator'),
  { ssr: false, loading: () => <div className="h-[500px] bg-white/5 animate-pulse" /> }
)

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row pt-[60px]">

      {/* LEFT — Black 60% */}
      <div
        className="w-full md:w-[60%] bg-[#0A0A0A] flex flex-col justify-between px-12 lg:px-16 py-16 lg:py-20 min-h-[60vh] md:min-h-screen"
      >
        {/* Masthead stamp */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-white/25">TuCierre</span>
            <span className="text-[11px] font-light tracking-[0.15em] uppercase text-[#D47151]/60 ml-3">· Notaría Digital</span>
          </div>
          <span className="text-[10px] font-light tracking-[0.2em] uppercase text-white/15">Est. 2024 · Lima</span>
        </div>

        {/* Giant headline */}
        <div className="flex-1 flex flex-col justify-center py-10">
          {/* Category pill */}
          <div className="inline-flex items-center gap-2 mb-8 self-start">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D47151]" />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white/40">
              Para brokers inmobiliarios
            </span>
          </div>

          <h1
            className="font-black text-white uppercase leading-[0.88] tracking-[-0.04em] select-none"
            style={{ fontSize: 'clamp(72px, 10.5vw, 160px)' }}
          >
            <span className="block">CIERRA.</span>
            <span className="block">COBRA.</span>
            <span className="block" style={{ color: '#D47151' }}>REPITE.</span>
          </h1>

          {/* Terracotta rule */}
          <div className="h-px bg-[#D47151] w-full my-8 lg:my-10" />

          {/* Light contrast subtitle */}
          <p
            className="font-extralight italic text-white/50 leading-none tracking-[-0.02em] mb-6"
            style={{ fontSize: 'clamp(30px, 3.8vw, 52px)', fontWeight: 200 }}
          >
            Sin papeleos. Sin esperas.
          </p>

          {/* Value prop — small, understated */}
          <p className="text-[14px] font-light text-white/35 leading-relaxed max-w-sm">
            Conectamos brokers con notarías de Lima.
            Registra el trámite, sube los documentos —
            <span className="text-white/55"> nosotros lo cerramos.</span>
          </p>
        </div>

        {/* Bottom corner stamp */}
        <div className="text-[9px] font-light tracking-[0.25em] uppercase text-white/15">
          Lima, Perú · 2026
        </div>
      </div>

      {/* RIGHT — Cream 40% */}
      <div
        className="w-full md:w-[40%] bg-[#F5F0E8] flex flex-col justify-between px-10 lg:px-14 py-16 lg:py-20"
      >
        {/* Label */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] uppercase text-[#D47151] mb-1">
              Calculadora de comisiones
            </p>
            <p className="text-[11px] font-light text-[#0A0A0A]/40">
              Descubre cuánto ganas al mes según tus trámites
            </p>
          </div>
          <span className="text-[9px] font-light tracking-[0.15em] uppercase text-[#0A0A0A]/25">
            Gratis
          </span>
        </div>

        {/* Calculator — editorial: sharp corners via wrapper */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="editorial-wrapper">
            <CommissionCalculator />
          </div>
        </div>

        {/* CTA + social proof */}
        <div className="space-y-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full gap-2 rounded-full bg-[#D47151] text-white px-8 py-4 text-[13px] font-black uppercase tracking-widest hover:bg-[#A6553A] transition-colors"
          >
            Empezar gratis →
          </Link>
          <p className="text-[10px] text-[#0A0A0A]/35 font-medium tracking-wide text-center">
            120+ brokers activos · Lima, Perú · Gratis · Sin tarjeta
          </p>
        </div>
      </div>

    </section>
  )
}

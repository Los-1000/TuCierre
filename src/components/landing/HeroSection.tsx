'use client'

import Link from 'next/link'
import Reveal from '@/components/landing/Reveal'
import CountUp from '@/components/landing/CountUp'
import dynamic from 'next/dynamic'

const CommissionCalculator = dynamic(
  () => import('@/components/landing/CommissionCalculator'),
  { ssr: false, loading: () => <div className="h-[480px] rounded-3xl bg-[#12161F]/4 animate-pulse" /> }
)

export default function HeroSection() {
  return (
    <>
      <div className="w-full py-3 px-4 text-center bg-[#12161F] relative z-[60]">
        <p className="text-[13px] text-white/90 font-medium tracking-wide">
          Más de{' '}
          <span className="text-[#C9880E] font-semibold">1,000 trámites cerrados</span>
          {' '}por brokers peruanos en 2026
          <span className="ml-3 text-white/50">✦</span>
        </p>
      </div>

      <section className="relative pt-32 pb-20 overflow-hidden bg-[#FFFEF5]">
        {/* Subtle dot grid + soft glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle, #12161F10 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#C9880E]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
            
            {/* Left */}
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9880E] animate-pulse" />
                  <span className="text-[12px] text-[#12161F]/70 font-semibold tracking-widest uppercase">
                    Plataforma notarial para brokers
                  </span>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="font-display font-semibold leading-[1.05] tracking-tight mb-7 text-[#12161F]" style={{ fontSize: 'clamp(48px, 6vw, 84px)' }}>
                  No persigas a nadie.<br />
                  <span className="italic text-[#C9880E] font-medium selection:bg-[#C9880E]/30">Solo cierra.</span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="text-[18px] font-medium leading-relaxed mb-10 text-[#12161F]/65 max-w-xl">
                  TuCierre conecta a los brokers con notarías de Lima.
                  Registra tu cliente, sube los documentos y nosotros hacemos el resto.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl bg-[#12161F] text-[#FFFEF5]"
                  >
                    Empezar gratis
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <a
                    href="#como-funciona"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium border border-[#12161F]/15 transition-all duration-200 bg-[#FFFEF5]/50 hover:bg-[#FFFEF5] hover:border-[#12161F]/30 text-[#12161F]"
                  >
                    Ver cómo funciona
                  </a>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center -space-x-2">
                    {['C', 'R', 'A', 'M', 'P'].map((initial, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full border-2 border-[#FFFEF5] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: ['#2a5e3a','#C9880E','#12161F','#1B5E4B','#8B5E34'][i], zIndex: 5 - i }}
                      >
                        {initial}
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full border-2 border-[#FFFEF5] bg-[#12161F] flex items-center justify-center text-[10px] font-bold text-[#FFFEF5] shadow-sm" style={{ zIndex: 0 }}>
                      +50
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-[#12161F]/70">
                    <span className="font-bold text-[#12161F]"><CountUp end={120} suffix="+" /></span> brokers activos<br/>
                    <span className="opacity-70">Gratis · Sin tarjeta</span>
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right: Calculator */}
            <Reveal direction="right" delay={300} className="w-full max-w-xl mx-auto lg:mx-0">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#C9880E]/0 via-[#C9880E]/10 to-[#C9880E]/0 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                <div className="relative transition-transform duration-700 hover:-translate-y-1">
                  <CommissionCalculator />
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>
    </>
  )
}

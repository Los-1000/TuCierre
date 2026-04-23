'use client'

import dynamic from 'next/dynamic'
import Reveal from '@/components/landing/Reveal'

const CommissionCalculator = dynamic(
  () => import('@/components/landing/CommissionCalculator'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] rounded-2xl animate-pulse bg-white/10" />
    ),
  }
)

export default function CalculatorSection() {
  return (
    <section className="py-32 bg-brand-navy border-t border-white/6">
      <div className="max-w-4xl mx-auto px-6">

        <Reveal direction="up" delay={0}>
          <div className="mb-14 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
              Calculadora de ganancias
            </p>
            <h2
              className="font-black tracking-tight text-white"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
            >
              Calcula cuánto ganas al mes
            </h2>
            <p className="text-lg text-white/50">
              Ajusta cuántos trámites cierras y ve tu comisión exacta según tu nivel.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={150}>
          <CommissionCalculator />
        </Reveal>

        <p className="mt-6 text-sm text-center text-white/45">
          Estimado sobre ticket promedio de <strong className="text-white/50">S/. 900</strong> por trámite en Lima.
        </p>

      </div>
    </section>
  )
}

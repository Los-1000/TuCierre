'use client'

import dynamic from 'next/dynamic'
import Reveal from '@/components/landing/Reveal'

const CommissionCalculator = dynamic(
  () => import('@/components/landing/CommissionCalculator'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] rounded-2xl animate-pulse bg-brand-text/8" />
    ),
  }
)

export default function CalculatorSection() {
  return (
    <section className="py-32 bg-brand-bg border-t border-brand-border-light">
      <div className="max-w-4xl mx-auto px-6">

        <Reveal direction="up" delay={0}>
          <div className="mb-14 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted">
              Calculadora de ganancias
            </p>
            <h2
              className="font-black text-heading-md tracking-tight text-brand-navy"
            >
              Calcula cuánto ganas al mes
            </h2>
            <p className="text-lg text-brand-muted">
              Ajusta tus trámites y los de tus referidos para ver tu cashback exacto.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={150}>
          <CommissionCalculator />
        </Reveal>

        <p className="mt-6 text-sm text-center text-brand-text/50">
          Estimado sobre ticket promedio de <strong className="text-brand-text/65">S/. 900</strong> por trámite en Lima.
        </p>

      </div>
    </section>
  )
}

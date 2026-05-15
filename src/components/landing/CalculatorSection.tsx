'use client'

import dynamic from 'next/dynamic'
import Reveal from '@/components/landing/Reveal'

const CommissionCalculator = dynamic(
  () => import('@/components/landing/CommissionCalculator'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] rounded-2xl animate-pulse bg-[#1A2050]/8" />
    ),
  }
)

export default function CalculatorSection() {
  return (
    <section className="py-32 bg-[#F5F7FF] border-t border-[#E0E4F0]">
      <div className="max-w-4xl mx-auto px-6">

        <Reveal direction="up" delay={0}>
          <div className="mb-14 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6B7A9A]">
              Calculadora de ganancias
            </p>
            <h2
              className="font-black text-heading-md tracking-tight text-brand-navy"
            >
              Calcula cuánto ganas al mes
            </h2>
            <p className="text-lg text-[#6B7A9A]">
              Ajusta cuántos trámites cierras y ve tu comisión exacta según tu nivel.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={150}>
          <CommissionCalculator />
        </Reveal>

        <p className="mt-6 text-sm text-center text-[#1A2050]/50">
          Estimado sobre ticket promedio de <strong className="text-[#1A2050]/65">S/. 900</strong> por trámite en Lima.
        </p>

      </div>
    </section>
  )
}

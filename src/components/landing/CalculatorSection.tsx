'use client'

import dynamic from 'next/dynamic'

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
    <section
      className="py-32"
      style={{ background: '#020952', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-4xl mx-auto px-6">

        <div className="mb-14 space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Calculadora de ganancias
          </p>
          <h2
            className="font-black tracking-tight text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            Calcula cuánto ganas al mes
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Ajusta cuántos trámites cierras y ve tu comisión exacta según tu nivel.
          </p>
        </div>

        <CommissionCalculator />

        <p className="mt-6 text-sm text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Estimado sobre ticket promedio de <strong className="text-white/50">S/. 900</strong> por trámite en Lima.
        </p>

      </div>
    </section>
  )
}

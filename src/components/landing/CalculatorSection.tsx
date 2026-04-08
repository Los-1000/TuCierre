'use client'

import dynamic from 'next/dynamic'

const CommissionCalculator = dynamic(
  () => import('@/components/landing/CommissionCalculator'),
  { ssr: false, loading: () => <div className="h-[500px] rounded-2xl animate-pulse" style={{ background: '#0F172A' }} /> }
)

export default function CalculatorSection() {
  return (
    <section className="py-32" style={{ background: '#EEF2FF' }}>
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-16 space-y-4">
          <div
            className="inline-flex items-center px-3 py-1 rounded-full border mb-2"
            style={{ background: 'rgba(37,99,235,0.07)', borderColor: 'rgba(37,99,235,0.28)' }}
          >
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1E3A8A' }}>
              Calculadora de Ganancias
            </span>
          </div>
          <h2
            className="font-black tracking-tight"
            style={{ color: '#0F172A', fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            Calcula cuánto ganas al mes
          </h2>
          <p className="text-xl font-medium" style={{ color: '#475569' }}>
            Ajusta cuántos trámites cierras por mes y ve tu comisión exacta según tu nivel en la red.
          </p>
        </div>

        <CommissionCalculator />

        <div
          className="mt-6 p-5 rounded-2xl flex items-center gap-4 border"
          style={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" stroke="#2563EB" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-base leading-snug" style={{ color: '#94A3B8' }}>
            Estimado sobre ticket promedio de{' '}
            <strong className="text-white">S/. 900</strong>{' '}
            por trámite en Lima.
            Los brokers de Nivel 3 cobran hasta{' '}
            <strong style={{ color: '#93C5FD' }}>8 días antes</strong>{' '}
            que en el mercado tradicional.
          </p>
        </div>

      </div>
    </section>
  )
}

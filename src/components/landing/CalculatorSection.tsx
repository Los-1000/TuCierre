'use client'

import dynamic from 'next/dynamic'

const CommissionCalculator = dynamic(
  () => import('@/components/landing/CommissionCalculator'),
  { ssr: false, loading: () => <div className="h-[500px] rounded-3xl animate-pulse" style={{ background: '#0a1f44' }} /> }
)

export default function CalculatorSection() {
  return (
    <section className="py-32 bg-[#fbf8fc]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div
            className="inline-flex items-center px-3 py-1 rounded-full mb-2"
            style={{ background: '#0a1f4415', border: '1px solid #0a1f4425' }}
          >
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#0a1f44' }}>
              Calculadora de Ganancias
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: '#00081e' }}>
            Calcula cuánto ganas al mes
          </h2>
          <p className="text-xl font-medium" style={{ color: '#44464e' }}>
            Ajusta cuántos trámites cierras por mes y ve tu comisión exacta según tu nivel en la red.
          </p>
        </div>

        <CommissionCalculator />

        <div
          className="mt-6 p-5 rounded-2xl flex items-center gap-4 border"
          style={{ background: '#0a1f44', borderColor: '#ffffff10' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" stroke="#d06d0d" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#d06d0d" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-base leading-snug" style={{ color: '#7f9fc2' }}>
            Estimado sobre ticket promedio de <strong className="text-white">S/. 900</strong> por trámite en Lima.
            Los brokers de Nivel 3 cobran hasta <strong style={{ color: '#d06d0d' }}>8 días antes</strong> que en el mercado tradicional.
          </p>
        </div>
      </div>
    </section>
  )
}

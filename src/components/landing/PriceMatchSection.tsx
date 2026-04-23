import Link from 'next/link'

const CHECKS = [
  'Cotizaciones instantáneas sin llamadas',
  'Cero costos adicionales para el broker',
  'Cobertura en todo Lima Metropolitana',
]

const TABLE_ROWS = [
  { tramite: 'Transferencia de Inmueble', mercado: 'S/ 1,200', tucierre: 'S/ 850'   },
  { tramite: 'Hipoteca (Escritura)',       mercado: 'S/ 1,500', tucierre: 'S/ 1,100' },
  { tramite: 'Poder Registral',            mercado: 'S/ 150',   tucierre: 'S/ 90'    },
]

export default function PriceMatchSection() {
  return (
    <section
      id="pricematch"
      className="py-32"
      style={{ background: '#020952', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

        {/* Left — copy */}
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Igualador de precio
            </p>
            <h2
              className="tracking-tight leading-tight"
              style={{ fontSize: 'clamp(32px, 4.5vw, 58px)' }}
            >
              <span className="font-extralight text-white">Si encuentras un precio menor, </span>
              <span className="font-black font-display italic" style={{ color: '#4D78FF' }}>lo igualamos.</span>
            </h2>
          </div>

          <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            ¿Tu cliente encontró un precio más bajo en otra notaría?{' '}
            <strong className="text-white font-semibold">Preséntanoslo y lo igualamos.</strong>{' '}
            Misma calidad, mismos plazos.
          </p>

          <ul className="space-y-3">
            {CHECKS.map(item => (
              <li key={item} className="flex items-center gap-3 text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(28,122,82,0.15)', border: '1px solid rgba(28,122,82,0.3)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="#22A06B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Disponible desde Nivel 2 · Se solicita vía plataforma · Sin papeleo
          </p>
        </div>

        {/* Right — white price table */}
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
          {/* Card header */}
          <div className="px-7 py-5 flex items-center justify-between bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
            <span className="font-black text-lg tracking-tight" style={{ color: '#020952' }}>Tarifas 2026</span>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: 'rgba(2,9,82,0.06)', color: '#020952' }}>
              Verificado
            </span>
          </div>

          {/* Table — scrollable on narrow viewports */}
          <div className="bg-white overflow-x-auto">
            <table className="w-full min-w-[460px] text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: '#F3F4F6' }}>
                  <th scope="col" className="px-7 py-4 text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(2,9,82,0.35)' }}>Trámite</th>
                  <th scope="col" className="px-7 py-4 text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(2,9,82,0.35)' }}>Mercado</th>
                  <th scope="col" className="px-7 py-4 text-xs font-black uppercase tracking-widest" style={{ color: '#020952' }}>TuCierre</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#F3F4F6' }}>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-7 py-5 text-sm font-medium" style={{ color: '#1E293B' }}>{row.tramite}</td>
                    <td className="px-7 py-5 text-sm line-through" style={{ color: '#94A3B8' }}>{row.mercado}</td>
                    <td className="px-7 py-5 text-sm font-black" style={{ color: '#020952' }}>{row.tucierre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Savings footer — outside scroll zone so it stays anchored */}
          <div className="px-7 py-5 flex items-center justify-between border-t" style={{ background: '#020952', borderColor: '#E5E7EB' }}>
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Ahorro promedio</span>
            <span className="text-2xl font-black tracking-tighter text-white">28% menos</span>
          </div>
        </div>

      </div>
    </section>
  )
}

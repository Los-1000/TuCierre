import Link from 'next/link'
import Reveal from '@/components/landing/Reveal'

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
      className="py-32 bg-brand-navy border-t border-white/6"
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

        {/* Left — copy */}
        <Reveal direction="up" delay={0}>
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
              Igualador de precio
            </p>
            <h2
              className="tracking-tight leading-tight"
              style={{ fontSize: 'clamp(32px, 4.5vw, 58px)' }}
            >
              <span className="font-extralight text-white">Si encuentras un precio menor, </span>
              <span className="font-black font-display italic text-brand-blue">lo igualamos.</span>
            </h2>
          </div>

          <p className="text-lg leading-relaxed text-white/55">
            ¿Tu cliente encontró un precio más bajo en otra notaría?{' '}
            <strong className="text-white font-semibold">Preséntanoslo y lo igualamos.</strong>{' '}
            Misma calidad, mismos plazos.
          </p>

          <ul className="space-y-3">
            {CHECKS.map(item => (
              <li key={item} className="flex items-center gap-3 text-base text-white/80">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-brand-success/15 border border-brand-success/30">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brand-emerald-light">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="text-sm text-white/50">
            Disponible desde Nivel 2 · Se solicita vía plataforma · Sin papeleo
          </p>
        </div>
        </Reveal>

        {/* Right — white price table */}
        <Reveal direction="up" delay={150}>
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
          {/* Card header */}
          <div className="px-7 py-5 flex items-center justify-between bg-white border-b border-brand-navy/10">
            <span className="font-black text-lg tracking-tight text-brand-navy">Tarifas 2026</span>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-brand-navy/6 text-brand-navy">
              Verificado
            </span>
          </div>

          {/* Table — scrollable on narrow viewports */}
          <div className="bg-white overflow-x-auto">
            <table className="w-full min-w-[460px] text-left">
              <thead>
                <tr className="border-b border-brand-navy/8">
                  <th scope="col" className="px-7 py-4 text-xs font-black uppercase tracking-widest text-brand-navy/55">Trámite</th>
                  <th scope="col" className="px-7 py-4 text-xs font-black uppercase tracking-widest text-brand-navy/55">Mercado</th>
                  <th scope="col" className="px-7 py-4 text-xs font-black uppercase tracking-widest text-brand-navy">TuCierre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/8">
                {TABLE_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-brand-navy/5 transition-colors">
                    <td className="px-7 py-5 text-sm font-medium text-brand-navy">{row.tramite}</td>
                    <td className="px-7 py-5 text-sm line-through text-brand-navy/40">{row.mercado}</td>
                    <td className="px-7 py-5 text-sm font-black text-brand-navy">{row.tucierre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Savings footer */}
          <div className="px-7 py-5 flex items-center justify-between border-t bg-brand-navy border-white/10">
            <span className="text-sm font-medium text-white/50">Ahorro promedio</span>
            <span className="text-2xl font-black tracking-tighter text-white">28% menos</span>
          </div>
        </div>
        </Reveal>

      </div>
    </section>
  )
}

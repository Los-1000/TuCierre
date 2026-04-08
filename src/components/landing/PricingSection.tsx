import Link from 'next/link'

const ROWS = [
  {
    level: 'Nivel 1',
    range: '1–3 trámites / mes',
    pct: '3%',
    cta: 'Empezar →',
    featured: false,
    benefits: 'Plataforma gratis · Tracking · Chat notaría',
  },
  {
    level: 'Nivel 2',
    range: '4–7 trámites / mes',
    pct: '5%',
    cta: 'Escalar a Nivel 2 →',
    featured: true,
    benefits: 'Price match · Soporte prioritario · Gestor asignado',
  },
  {
    level: 'Nivel 3',
    range: '8+ trámites / mes',
    pct: '8%',
    cta: 'Alcanzar Nivel 3 →',
    featured: false,
    benefits: 'Prioridad máxima · Ejecutivo senior · Atención dedicada',
  },
]

export default function PricingSection() {
  return (
    <section id="precios" className="py-32 md:py-40" style={{ background: '#0F172A' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <h2
          className="font-black tracking-tighter leading-none mb-3 text-white"
          style={{ fontSize: 'clamp(60px, 10vw, 120px)' }}
        >
          El{' '}
          <span className="font-display italic" style={{ color: '#2563EB' }}>Sistema.</span>
        </h2>
        <p className="font-light text-lg mb-16" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Tu comisión sube sola. Sin formularios. Sin aprobaciones.
        </p>

        <div
          className="hidden md:grid grid-cols-4 pb-4 mb-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {[
            { label: 'Categoría', align: 'left'   },
            { label: 'Volumen',   align: 'left'   },
            { label: 'Comisión',  align: 'center' },
            { label: 'Acceso',    align: 'right'  },
          ].map(h => (
            <div
              key={h.label}
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.22)', textAlign: h.align as 'left' | 'center' | 'right' }}
            >
              {h.label}
            </div>
          ))}
        </div>

        {ROWS.map(row =>
          row.featured ? (
            <div
              key={row.level}
              className="rounded-2xl my-3 relative overflow-hidden p-8 md:grid md:grid-cols-4 md:items-center flex flex-col gap-4"
              style={{ background: '#2563EB', minHeight: '140px' }}
            >
              <span
                className="absolute right-8 bottom-0 font-black leading-none select-none pointer-events-none hidden md:block"
                style={{ fontSize: '120px', color: 'rgba(255,255,255,0.08)' }}
                aria-hidden="true"
              >
                PRO
              </span>

              <div className="relative z-10">
                <div className="font-black text-2xl uppercase tracking-tight text-white">{row.level}</div>
                <div className="text-xs font-black uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  — Popular
                </div>
                <div className="text-sm font-light mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{row.range}</div>
              </div>

              <div className="md:text-center relative z-10">
                <span
                  className="font-black tracking-tighter leading-none tabular-nums text-white"
                  style={{ fontSize: 'clamp(56px, 9vw, 112px)' }}
                >
                  {row.pct}
                </span>
              </div>

              <div className="text-sm font-light relative z-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {row.benefits}
              </div>

              <div className="md:text-right relative z-10">
                <Link
                  href="/register"
                  className="inline-block rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest hover:opacity-85 transition-opacity"
                  style={{ background: '#fff', color: '#1E3A8A' }}
                >
                  {row.cta}
                </Link>
              </div>
            </div>
          ) : (
            <div
              key={row.level}
              className="md:grid md:grid-cols-4 flex flex-col gap-3 items-start md:items-center border-b py-7 opacity-50 hover:opacity-100 transition-opacity"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <div>
                <div className="font-black text-lg uppercase tracking-tight text-white">{row.level}</div>
                <div className="text-xs font-light mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>{row.range}</div>
              </div>
              <div className="text-center">
                <span className="font-extralight text-3xl text-white tabular-nums">{row.pct}</span>
              </div>
              <div className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.32)' }}>{row.benefits}</div>
              <div className="text-right">
                <Link
                  href="/register"
                  className="text-xs font-black uppercase tracking-widest transition-colors hover:text-[#93C5FD]"
                  style={{ color: 'rgba(255,255,255,0.32)' }}
                >
                  {row.cta}
                </Link>
              </div>
            </div>
          )
        )}

        <p className="text-center text-xs font-light mt-10 tracking-wide" style={{ color: 'rgba(255,255,255,0.22)' }}>
          El nivel sube automáticamente según tus trámites firmados cada mes. Sin formularios, sin aprobaciones.
        </p>
      </div>
    </section>
  )
}

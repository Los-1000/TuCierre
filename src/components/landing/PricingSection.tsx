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
    <section id="precios" className="py-32 md:py-40" style={{ background: '#0a1f44' }}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">

        {/* Heading */}
        <h2
          className="font-black uppercase tracking-[-0.04em] leading-none mb-4 text-white"
          style={{ fontSize: 'clamp(56px, 8vw, 96px)' }}
        >
          El Sistema.
        </h2>
        <p className="text-white/40 font-light text-lg mb-16">
          Tu comisión sube sola. Sin formularios. Sin aprobaciones.
        </p>

        {/* Table header — hidden on mobile */}
        <div className="hidden md:grid grid-cols-4 border-b border-white/10 pb-4 mb-4">
          {['Categoría', 'Volumen', 'Comisión', 'Acceso'].map(h => (
            <div
              key={h}
              className={`text-xs font-black uppercase tracking-[0.2em] text-white/30 ${h === 'Comisión' ? 'text-center' : h === 'Acceso' ? 'text-right' : ''}`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {ROWS.map((row) =>
          row.featured ? (
            <div
              key={row.level}
              className="rounded-2xl my-3 relative overflow-hidden p-8 md:grid md:grid-cols-4 md:items-center md:rounded-none flex flex-col gap-4"
              style={{ background: '#d06d0d', minHeight: '140px' }}
            >
              <span className="absolute right-8 bottom-0 font-black text-[120px] leading-none text-black/10 select-none pointer-events-none hidden md:block">
                PRO
              </span>

              <div className="relative z-10">
                <div className="font-black text-2xl uppercase tracking-tight text-[#00081e]">{row.level}</div>
                <div className="text-xs font-black uppercase tracking-widest text-[#00081e]/50 mt-1">★ Popular</div>
                <div className="text-sm font-light text-[#00081e]/60 mt-2">{row.range}</div>
              </div>

              <div className="md:text-center relative z-10">
                <span
                  className="font-black text-[#00081e] tracking-[-0.05em] leading-none tabular-nums"
                  style={{ fontSize: 'clamp(56px, 9vw, 112px)' }}
                >
                  {row.pct}
                </span>
              </div>

              <div className="text-sm font-light text-[#00081e]/60 relative z-10">{row.benefits}</div>

              <div className="md:text-right relative z-10">
                <Link
                  href="/register"
                  className="inline-block bg-[#00081e] text-white rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#0a1f44] transition-colors"
                >
                  {row.cta}
                </Link>
              </div>
            </div>
          ) : (
            <div
              key={row.level}
              className="md:grid md:grid-cols-4 flex flex-col gap-3 items-start md:items-center border-b border-white/5 py-7 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div>
                <div className="font-black text-lg uppercase tracking-tight text-white">{row.level}</div>
                <div className="text-xs font-light text-white/35 mt-1">{row.range}</div>
              </div>

              <div className="text-center">
                <span className="font-extralight text-3xl text-white tabular-nums">{row.pct}</span>
              </div>

              <div className="text-sm font-light text-white/40">{row.benefits}</div>

              <div className="text-right">
                <Link
                  href="/register"
                  className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-[#d06d0d] transition-colors"
                >
                  {row.cta}
                </Link>
              </div>
            </div>
          )
        )}

        <p className="text-center text-xs font-light text-white/20 mt-10 tracking-wide">
          El nivel sube automáticamente según tus trámites firmados cada mes. Sin formularios, sin aprobaciones.
        </p>
      </div>
    </section>
  )
}

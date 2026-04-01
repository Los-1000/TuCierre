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
    <section id="precios" className="bg-[#131313] px-10 lg:px-16 py-32 lg:py-40 overflow-x-auto">
      <div className="min-w-[720px]">

        {/* Heading */}
        <h2
          className="font-black text-[#F5F0E8] uppercase tracking-[-0.04em] leading-none mb-4"
          style={{ fontSize: 'clamp(56px, 8vw, 96px)' }}
        >
          El Sistema.
        </h2>
        <p className="text-white/30 font-extralight text-[17px] mb-16">
          Tu comisión sube sola. Sin formularios. Sin aprobaciones.
        </p>

        {/* Table header */}
        <div className="grid grid-cols-4 border-b border-white/8 pb-4 mb-4">
          {['Categoría', 'Volumen', 'Comisión', 'Acceso'].map(h => (
            <div key={h} className={`text-[9px] font-black uppercase tracking-[0.2em] text-white/25 ${h === 'Comisión' ? 'text-center' : h === 'Acceso' ? 'text-right' : ''}`}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {ROWS.map((row) => (
          row.featured ? (
            /* Featured terracotta row */
            <div
              key={row.level}
              className="grid grid-cols-4 items-center bg-[#D47151] -mx-10 lg:-mx-16 px-10 lg:px-16 my-3 relative overflow-hidden"
              style={{ minHeight: '180px' }}
            >
              {/* Decorative ghost text */}
              <span className="absolute right-8 bottom-0 font-black text-[120px] leading-none text-black/10 select-none pointer-events-none">
                PRO
              </span>

              <div className="relative z-10">
                <div className="font-black text-[22px] uppercase tracking-tight text-[#0A0A0A]">
                  {row.level}
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-[#0A0A0A]/50 mt-1">
                  ★ Popular
                </div>
                <div className="text-[12px] font-light text-[#0A0A0A]/60 mt-2">
                  {row.range}
                </div>
              </div>

              <div className="text-center relative z-10">
                <span
                  className="font-black text-[#0A0A0A] tracking-[-0.05em] leading-none tabular-nums"
                  style={{ fontSize: 'clamp(72px, 9vw, 112px)' }}
                >
                  {row.pct}
                </span>
              </div>

              <div className="text-[12px] font-light text-[#0A0A0A]/60 relative z-10">
                {row.benefits}
              </div>

              <div className="text-right relative z-10">
                <Link
                  href="/register"
                  className="inline-block bg-[#0A0A0A] text-white rounded-full px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors"
                >
                  {row.cta}
                </Link>
              </div>
            </div>
          ) : (
            /* Normal cream row */
            <div
              key={row.level}
              className="grid grid-cols-4 items-center border-b border-white/5 py-7 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div>
                <div className="font-black text-[18px] uppercase tracking-tight text-[#F5F0E8]">
                  {row.level}
                </div>
                <div className="text-[11px] font-light text-white/35 mt-1">{row.range}</div>
              </div>

              <div className="text-center">
                <span className="font-extralight text-[32px] text-[#F5F0E8] tabular-nums">
                  {row.pct}
                </span>
              </div>

              <div className="text-[12px] font-light text-white/40">
                {row.benefits}
              </div>

              <div className="text-right">
                <Link
                  href="/register"
                  className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-[#D47151] transition-colors"
                >
                  {row.cta}
                </Link>
              </div>
            </div>
          )
        ))}

        <p className="text-center text-[11px] font-light text-white/20 mt-10 tracking-wide">
          El nivel sube automáticamente según tus trámites firmados cada mes. Sin formularios, sin aprobaciones.
        </p>
      </div>
    </section>
  )
}

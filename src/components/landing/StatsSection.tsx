const STATS = [
  { value: '1,000+', label: 'Trámites cerrados en 2026', accent: false },
  { value: '7 días', label: 'Tiempo promedio de cierre', accent: true },
  { value: '16+',    label: 'Tipos de trámite',          accent: false },
  { value: '8%',     label: 'Comisión máxima por cierre', accent: false },
]

export default function StatsSection() {
  return (
    <section className="bg-[#131313] border-b border-white/5">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`p-8 lg:p-12 flex flex-col gap-3 ${i < 3 ? 'border-r border-white/8' : ''} ${i >= 2 ? 'border-t md:border-t-0 border-white/8' : ''}`}
          >
            <span
              className="font-black tracking-[-0.04em] leading-none"
              style={{
                fontSize: 'clamp(48px, 5.5vw, 72px)',
                color: s.accent ? '#D47151' : '#F5F0E8',
              }}
            >
              {s.value}
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

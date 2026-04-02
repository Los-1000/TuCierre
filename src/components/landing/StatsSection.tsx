const STATS = [
  { value: '45+',    label: 'Notarías Aliadas',     },
  { value: '1,200+', label: 'Trámites Cerrados',    },
  { value: 'S/ 4.2M', label: 'Ahorro Total Clientes' },
  { value: '98%',    label: 'Satisfacción Broker',  },
]

export default function StatsSection() {
  return (
    <section className="py-24 border-y border-white/5" style={{ background: '#00081e' }}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {STATS.map((s) => (
          <div key={s.label} className="space-y-3">
            <div
              className="text-5xl font-black tracking-tighter"
              style={{ color: '#ffffff' }}
            >
              {s.value}
            </div>
            <div
              className="text-xs font-black uppercase tracking-[0.25em]"
              style={{ color: '#7f9fc2' }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

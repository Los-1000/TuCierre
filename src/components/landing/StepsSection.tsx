const BULLETS = [
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d06d0d" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Imagen Profesional',
    body: 'Entrega reportes digitales y procesos claros que elevan tu marca personal ante cada cliente.',
  },
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#d06d0d" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="#d06d0d" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#d06d0d" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Fidelización Garantizada',
    body: 'Un cierre sin fricciones es el inicio de una relación a largo plazo con tus clientes y su red.',
  },
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d06d0d" strokeWidth="2" strokeLinejoin="round" fill="#d06d0d" fillOpacity="0.1"/>
        <path d="M9 12l2 2 4-4" stroke="#d06d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Price Match Garantizado',
    body: 'Cierra sin miedo a perder por precio. Si hay una oferta menor, la igualamos — disponible desde Nivel 2.',
  },
]

const TRAMITE_ROWS = [
  { label: 'Compraventa de inmueble',  status: 'Firmado',    color: '#22c55e' },
  { label: 'Poder notarial registral', status: 'En proceso', color: '#d06d0d' },
  { label: 'Hipoteca escritura pública', status: 'Firmado',  color: '#22c55e' },
  { label: 'Sucesión intestada',        status: 'Pendiente', color: '#7f9fc2' },
]

function DashboardMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 select-none"
      style={{ background: '#071733' }}
      aria-hidden="true"
    >
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10" style={{ background: '#0a1f44' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d06d0d]" />
          <span className="text-white font-bold text-sm tracking-tight">Tu Cierre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 rounded-full bg-white/10" />
          <div className="w-7 h-7 rounded-full bg-[#d06d0d]/20 border border-[#d06d0d]/30 flex items-center justify-center">
            <span className="text-[10px] font-black text-[#d06d0d]">BR</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/5">
        {[
          { label: 'Este mes', value: 'S/. 4,200' },
          { label: 'Trámites', value: '7 activos' },
          { label: 'Nivel',    value: 'Nivel 2 · 5%' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3" style={{ background: '#071733' }}>
            <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#7f9fc2' }}>{s.label}</div>
            <div className="text-sm font-black text-white mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tramites list */}
      <div className="px-4 py-3 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#7f9fc2' }}>
          Mis Trámites
        </div>
        {TRAMITE_ROWS.map(row => (
          <div
            key={row.label}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/5"
            style={{ background: '#0a1f4450' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 rounded-full" style={{ background: row.color }} />
              <span className="text-xs font-medium text-white/80 truncate max-w-[160px]">{row.label}</span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: row.color, background: `${row.color}18` }}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>

      {/* Commission bar */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#7f9fc2' }}>
            Progreso al Nivel 3
          </span>
          <span className="text-[10px] font-bold text-white">7 / 8 trámites</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '87.5%', background: '#d06d0d' }} />
        </div>
        <p className="text-[10px] mt-1.5 font-medium" style={{ color: '#d06d0d' }}>
          1 trámite más → 8% comisión
        </p>
      </div>
    </div>
  )
}

export default function StepsSection() {
  return (
    <section id="como-funciona" className="py-24" style={{ background: '#00081e' }}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">

        {/* Left — dashboard mockup */}
        <DashboardMockup />

        {/* Right — copy */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-6">
              <span className="text-xs text-white/60 font-bold tracking-widest uppercase">Para Brokers de Élite</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-tight text-white">
              Posiciónate como un{' '}
              <span style={{ color: '#d06d0d' }}>Socio de Alto Nivel</span>
            </h2>
          </div>
          <p className="text-xl leading-relaxed" style={{ color: '#7f9fc2' }}>
            En el mercado inmobiliario actual, la diferencia entre un vendedor y un asesor de élite
            es la infraestructura que lo respalda.
          </p>

          <div className="space-y-6">
            {BULLETS.map((b, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#d06d0d10', border: '1px solid #d06d0d30' }}
                >
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{b.title}</h4>
                  <p className="mt-0.5" style={{ color: '#7f9fc2' }}>{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

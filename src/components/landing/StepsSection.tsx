const BULLETS = [
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Registra tu operación',
    body: 'Crea el trámite en minutos. Sube los datos del cliente y el tipo de operación — nosotros asignamos la notaría.',
  },
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="#2563EB" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Sube los documentos',
    body: 'Tu cliente carga los documentos directamente desde su teléfono. Sin imprimir, sin ir a la notaría antes de tiempo.',
  },
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" fill="#2563EB" fillOpacity="0.1" />
        <path d="M9 12l2 2 4-4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Solo apareces a firmar',
    body: 'Tu Cierre coordina con la notaría, valida los documentos y te avisa cuando es hora. Tú ganas tiempo; tu cliente, tranquilidad.',
  },
]

const TRAMITE_ROWS = [
  { label: 'Compraventa de inmueble',    status: 'Firmado',    color: '#1C7A52' },
  { label: 'Poder notarial registral',   status: 'En proceso', color: '#2563EB' },
  { label: 'Hipoteca escritura pública', status: 'Firmado',    color: '#1C7A52' },
  { label: 'Sucesión intestada',         status: 'Pendiente',  color: '#94A3B8' },
]

function DashboardMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl select-none border"
      style={{ background: '#07101F', borderColor: 'rgba(255,255,255,0.06)' }}
      aria-hidden="true"
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#2563EB' }} />
          <span className="text-white font-bold text-sm tracking-tight">Tu Cierre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)' }}
          >
            <span className="text-[10px] font-black" style={{ color: '#93C5FD' }}>BR</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-b" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.04)' }}>
        {[
          { label: 'Este mes', value: 'S/. 4,200' },
          { label: 'Trámites', value: '7 activos' },
          { label: 'Nivel',    value: 'Nivel 2 · 5%' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3" style={{ background: '#07101F' }}>
            <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>{s.label}</div>
            <div className="text-sm font-black text-white mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
          Mis Trámites
        </div>
        {TRAMITE_ROWS.map(row => (
          <div
            key={row.label}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg border"
            style={{ background: 'rgba(30,58,138,0.25)', borderColor: 'rgba(255,255,255,0.04)' }}
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

      <div className="px-4 pb-4 pt-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>
            Progreso al Nivel 3
          </span>
          <span className="text-[10px] font-bold text-white">7 / 8 trámites</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: '87.5%', background: '#2563EB' }} />
        </div>
        <p className="text-[10px] mt-1.5 font-medium" style={{ color: '#93C5FD' }}>
          1 trámite más → 8% comisión
        </p>
      </div>
    </div>
  )
}

export default function StepsSection() {
  return (
    <section id="como-funciona" className="py-28" style={{ background: '#0F172A' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">

        <DashboardMockup />

        <div className="space-y-8">
          <div>
            <div
              className="inline-flex items-center px-3 py-1 rounded-full border mb-6"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <span className="text-xs text-white/50 font-bold tracking-widest uppercase">Cómo funciona</span>
            </div>
            <h2
              className="tracking-tight leading-tight text-white"
              style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}
            >
              <span className="font-extralight">De la operación a la firma </span>
              <span className="font-black font-display italic" style={{ color: '#2563EB' }}>en tres pasos</span>
            </h2>
          </div>

          <p className="text-xl leading-relaxed font-light" style={{ color: '#94A3B8' }}>
            Sin llamadas a notarías. Sin documentos extraviados. Sin "¿cómo va mi trámite?".
            Todo en una sola plataforma.
          </p>

          <div className="space-y-6">
            {BULLETS.map((b) => (
              <div key={b.title} className="flex gap-5">
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)' }}
                >
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{b.title}</h4>
                  <p className="mt-0.5 font-light" style={{ color: '#94A3B8' }}>{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

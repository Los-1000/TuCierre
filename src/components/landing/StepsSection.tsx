import Reveal from '@/components/landing/Reveal'

const BULLETS = [
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Registra tu operación',
    body: 'Crea el trámite en minutos. Sube los datos del cliente y el tipo de operación — nosotros asignamos la notaría.',
  },
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Sube los documentos',
    body: 'Tu cliente carga los documentos directamente desde su teléfono. Sin imprimir, sin ir a la notaría antes de tiempo.',
  },
  {
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.55)" fillOpacity="0.1" />
        <path d="M9 12l2 2 4-4" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Solo apareces a firmar',
    body: 'Tu Cierre coordina con la notaría, valida los documentos y te avisa cuando es hora. Tú ganas tiempo; tu cliente, tranquilidad.',
  },
]

const ACTIVITY = [
  { type: 'done' as const,    title: 'Documentos validados',          case: 'Compraventa García-Flores', meta: 'Notaría San Marcos · Hace 2 h' },
  { type: 'ready' as const,   title: '¡Lista para firma!',            case: 'Poder Notarial Ríos',        meta: 'Jueves 29, 14:00 · Notaría Central' },
  { type: 'pending' as const, title: 'En coordinación notarial',      case: 'Hipoteca Vargas-Mendoza',    meta: 'Confirmando hora · Est. 3 h' },
]

function DashboardMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl select-none border border-white/6 bg-brand-navy"
      aria-hidden="true"
    >
      {/* App header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/12" />
          <span className="text-white font-bold text-sm tracking-tight">Tu Cierre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 rounded-full bg-white/8" />
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/8 border border-white/12">
            <span className="text-[11px] font-black text-white/65">BR</span>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="px-4 py-4">
        <p className="text-[11px] font-black uppercase tracking-widest mb-3 text-white/50">
          Actividad reciente
        </p>
        <div className="space-y-2">
          {ACTIVITY.map((item) => (
            <div
              key={item.case}
              className={`flex items-start gap-3 px-3 py-3 rounded-xl border ${
                item.type === 'ready'
                  ? 'bg-brand-blue/10 border-brand-blue/22'
                  : 'bg-white/4 border-white/5'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                item.type === 'done'    ? 'bg-brand-success/25'
                : item.type === 'ready' ? 'bg-brand-blue/20'
                : 'bg-white/7'
              }`}>
                {item.type === 'done' && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" className="text-brand-success">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {item.type === 'ready' && (
                  <div className="w-2 h-2 rounded-full animate-pulse bg-brand-blue" />
                )}
                {item.type === 'pending' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                <p className="text-[11px] font-medium mt-0.5 truncate text-white/65">{item.case}</p>
                <p className="text-[11px] mt-1 text-white/40">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer action bar */}
      <div className="px-4 pb-4 pt-0 flex gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg text-center text-[11px] font-semibold bg-white/6 text-white/55">
          Ver todos los trámites
        </div>
        <div className="px-3 py-2 rounded-lg text-[11px] font-bold text-white bg-brand-blue">
          + Nuevo
        </div>
      </div>
    </div>
  )
}

export default function StepsSection() {
  return (
    <section id="como-funciona" className="py-28 bg-brand-navy border-t border-white/6">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">

        <DashboardMockup />

        <div className="space-y-8">
          <Reveal direction="up" delay={0}>
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border mb-6 bg-white/5 border-white/12">
                <span className="text-xs text-white/50 font-bold tracking-widest uppercase">Cómo funciona</span>
              </div>
              <h2
                className="tracking-tight leading-tight text-white"
                style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}
              >
                <span className="font-extralight">De la operación a la firma </span>
                <span className="font-black font-display italic text-white/65">en tres pasos</span>
              </h2>
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <p className="text-xl leading-relaxed font-light text-white/50">
              Sin llamadas a notarías. Sin documentos extraviados. Sin "¿cómo va mi trámite?".
              Todo en una sola plataforma.
            </p>
          </Reveal>

          <Reveal direction="up" delay={150}>
          <div className="space-y-6">
            {BULLETS.map((b) => (
              <div key={b.title} className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-brand-blue/12 border border-brand-blue/25">
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{b.title}</h4>
                  <p className="mt-0.5 font-light text-white/50">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}

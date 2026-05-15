import Reveal from '@/components/landing/Reveal'

const STEPS = [
  {
    num: '01',
    title: 'El broker registra la operación',
    body: 'Crea el trámite en minutos desde tu celular. Ingresas los datos del cliente y el tipo de operación — nosotros asignamos la notaría.',
  },
  {
    num: '02',
    title: 'Tu cliente sube los documentos',
    body: 'El cliente carga todo directamente desde su teléfono. Sin imprimir, sin trasladarse antes de tiempo.',
  },
  {
    num: '03',
    title: 'TuCierre coordina — tu cliente firma',
    body: 'Verificamos los documentos, coordinamos con la notaría y avisamos a tu cliente cuándo y dónde firmar. Tú supervisas el estado en tiempo real.',
  },
]

const ACTIVITY = [
  { type: 'done' as const,    title: 'Documentos validados',     case: 'Compraventa García-Flores', meta: 'Notaría San Marcos · Hace 2 h'          },
  { type: 'ready' as const,   title: '¡Lista para firma!',       case: 'Poder Notarial Ríos',        meta: 'Jueves 29, 14:00 · Notaría Central'     },
  { type: 'pending' as const, title: 'En coordinación notarial', case: 'Hipoteca Vargas-Mendoza',    meta: 'Confirmando hora · Est. 3 h'            },
]

function DashboardMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl select-none border border-white/6 bg-brand-navy"
      aria-hidden="true"
    >
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

      <div className="px-4 py-4">
        <p className="text-[11px] font-black uppercase tracking-widest mb-3 text-white/45">
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
                <p className="text-[11px] mt-1 text-white/45">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 pt-0 flex gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg text-center text-[11px] font-semibold bg-white/6 text-white/65">
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

        {/* Text column — left on desktop, top on mobile (correct read order) */}
        <div className="space-y-8">
          <Reveal direction="up" delay={0}>
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border mb-6 bg-brand-gold/15 border-brand-gold/30">
                <span className="text-xs text-brand-gold font-bold tracking-widest uppercase">Cómo funciona</span>
              </div>
              <h2 className="text-heading-lg tracking-tight text-white">
                <span className="font-black">De la operación a la firma </span>
                <span className="block font-extralight text-white/65">en tres pasos.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <p className="text-xl leading-relaxed font-light text-white/45">
              Tú registras la operación. Tu cliente sube los documentos y asiste a firmar.
              TuCierre coordina todo lo demás.
            </p>
          </Reveal>

          <Reveal direction="up" delay={150}>
            <div className="space-y-7">
              {STEPS.map((s) => (
                <div key={s.title} className="flex gap-5 items-start">
                  <span
                    className="shrink-0 font-black text-brand-gold tabular-nums leading-none mt-1"
                    style={{ fontSize: '1.75rem' }}
                    aria-hidden="true"
                  >
                    {s.num}
                  </span>
                  <div>
                    <h4 className="font-bold text-lg text-white">{s.title}</h4>
                    <p className="mt-1 font-light text-white/45">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Mockup — right on desktop, bottom on mobile */}
        <DashboardMockup />

      </div>
    </section>
  )
}

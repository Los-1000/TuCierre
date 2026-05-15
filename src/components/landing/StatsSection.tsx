import Reveal from '@/components/landing/Reveal'

const STATS = [
  { value: '500+',  label: 'Trámites gestionados',  sub: 'En Lima Metropolitana'          },
  { value: '120+',  label: 'Brokers activos',        sub: 'Registrados en la plataforma'   },
  { value: '48 h',  label: 'Cierre promedio',        sub: 'De solicitud a firma'            },
  { value: '28%',   label: 'Ahorro vs mercado',      sub: 'En tarifas notariales'           },
]

const TESTIMONIALS = [
  {
    quote: 'Antes coordinaba con la notaría por WhatsApp y siempre había algo perdido. Con TuCierre subo los documentos y me avisan cuando hay que ir a firmar. Así de simple.',
    name: 'Carmen R.',
    role: 'Broker Inmobiliaria · San Isidro',
    tier: 'Nivel 2',
  },
  {
    quote: 'El price match es real. Presenté una cotización de otra notaría y la igualaron al día siguiente. Mis clientes lo notan y confían más en mí.',
    name: 'Marco V.',
    role: 'Corredor Independiente · Miraflores',
    tier: 'Nivel 3',
  },
]

export default function StatsSection() {
  return (
    <section className="py-32 bg-brand-bg border-t border-brand-border-light">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <Reveal direction="up" delay={0}>
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-14 text-brand-text/50">
            Por qué TuCierre
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-24">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} direction="up" delay={i * 60}>
              <div>
                <p
                  className="font-black tracking-tighter leading-none tabular-nums text-brand-navy"
                  style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-bold text-brand-navy">{stat.label}</p>
                <p className="mt-0.5 text-xs text-brand-muted">{stat.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} direction="up" delay={i * 100}>
              <div className="rounded-2xl p-8 bg-white border border-brand-border-light">
                <p className="text-base leading-relaxed text-brand-text/75 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{t.name}</p>
                    <p className="text-xs text-brand-muted mt-0.5">{t.role}</p>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-navy/6 text-brand-navy/55">
                    {t.tier}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}

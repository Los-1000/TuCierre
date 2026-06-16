import Reveal from '@/components/landing/Reveal'

const SECONDARY_STATS = [
  { value: '1,000+', label: 'Trámites gestionados', sub: 'Lima Metropolitana' },
  { value: '120+', label: 'Brokers activos',      sub: 'En la plataforma'   },
  { value: '48 h', label: 'Cierre promedio',      sub: 'Solicitud → firma'  },
]

const TESTIMONIALS = [
  {
    quote: 'Antes coordinaba con la notaría por WhatsApp y siempre había algo perdido. Con TuCierre subo los documentos y me avisan cuando hay que ir a firmar. Así de simple.',
    name: 'Carmen R.',
    role: 'Broker Inmobiliaria · San Isidro',
    tier: 'Plata',
  },
  {
    quote: 'El price match es real. Presenté una cotización de otra notaría y la igualaron al día siguiente. Mis clientes lo notan y confían más en mí.',
    name: 'Marco V.',
    role: 'Corredor Independiente · Miraflores',
    tier: 'Oro',
  },
]

export default function StatsSection() {
  return (
    <section className="py-24 md:py-32 bg-brand-bg border-t border-brand-border-light">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <Reveal direction="up" delay={0}>
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-12 text-brand-text/50">
            Por qué TuCierre
          </p>
        </Reveal>

        {/* Asymmetric stats: big anchor stat left, three secondary right */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-0 mb-20 md:mb-24 items-end">

          <Reveal direction="up" delay={0}>
            <div className="md:pr-16">
              <p
                className="font-black tracking-tighter leading-none tabular-nums text-brand-navy"
                style={{ fontSize: 'clamp(80px, 11vw, 144px)' }}
              >
                28%
              </p>
              <p className="text-lg md:text-xl font-bold text-brand-navy mt-3">Ahorro vs. mercado</p>
              <p className="text-sm md:text-base text-brand-muted mt-1.5 max-w-xs">
                En tarifas notariales certificadas en Lima Metropolitana
              </p>
            </div>
          </Reveal>

          <div className="md:pl-16 md:border-l md:border-brand-navy/10 space-y-7">
            {SECONDARY_STATS.map((stat, i) => (
              <Reveal key={stat.label} direction="up" delay={i * 70}>
                <div className="flex items-baseline gap-5">
                  <p
                    className="font-black tracking-tighter tabular-nums text-brand-navy shrink-0 leading-none"
                    style={{ fontSize: 'clamp(26px, 3.2vw, 40px)' }}
                  >
                    {stat.value}
                  </p>
                  <div>
                    <p className="text-sm font-bold text-brand-navy leading-snug">{stat.label}</p>
                    <p className="text-xs text-brand-muted mt-0.5">{stat.sub}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} direction="up" delay={i * 100}>
              <div className="rounded-2xl p-7 md:p-8 bg-white border border-brand-border-light">
                <p className="text-base leading-relaxed text-brand-text/75 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-bold text-brand-navy">{t.name}</p>
                  <p className="text-xs text-brand-muted mt-0.5">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}

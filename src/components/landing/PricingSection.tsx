import Link from 'next/link'
import Reveal from '@/components/landing/Reveal'

const TIERS = [
  {
    name: 'Bronce',
    color: '#B5540E',
    range: '1–3 trámites / mes',
    pct: '3%',
    benefits: ['Plataforma gratis', 'Tracking en tiempo real', 'Chat con notaría'],
    featured: false,
  },
  {
    name: 'Plata',
    color: '#6B7F99',
    range: '4–7 trámites / mes',
    pct: '5%',
    benefits: ['Price match garantizado', 'Soporte prioritario', 'Gestor asignado'],
    featured: true,
  },
  {
    name: 'Oro',
    color: '#C9880E',
    range: '8+ trámites / mes',
    pct: '8%',
    benefits: ['Prioridad máxima', 'Ejecutivo senior', 'Atención dedicada'],
    featured: false,
  },
]

export default function PricingSection() {
  return (
    <section
      id="precios"
      className="py-24 md:py-32 bg-brand-navy border-t border-white/6"
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <Reveal direction="up" delay={0}>
          <div className="mb-14 md:mb-20">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/45">Comisiones</p>
            <h2 className="font-black text-display-xl tracking-tighter text-white mb-4">
              El Sistema.
            </h2>
            <p className="font-light text-lg max-w-md text-white/65">
              Tu comisión sube sola cada mes según volumen. Sin formularios. Sin aprobaciones.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={150}>
          <div className="space-y-3">
            {TIERS.map(tier =>
              tier.featured ? (
                <div
                  key={tier.name}
                  className="rounded-2xl p-6 md:p-10"
                  style={{ background: '#ffffff' }}
                >
                  {/* Mobile layout */}
                  <div className="flex flex-col gap-5 md:hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.2em] mb-1" style={{ color: tier.color }}>
                          Más popular
                        </div>
                        <div className="font-black text-2xl tracking-tight text-brand-navy flex items-center gap-2">
                          {tier.name}
                          <span className="text-sm font-light text-brand-navy/55">{tier.range}</span>
                        </div>
                      </div>
                      <span
                        className="font-black tracking-tighter leading-none tabular-nums text-brand-navy"
                        style={{ fontSize: '56px' }}
                      >
                        {tier.pct}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {tier.benefits.map(b => (
                        <div key={b} className="flex items-start gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" stroke={tier.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-xs font-medium text-brand-navy/70 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/register"
                      className="w-full text-center py-3.5 rounded-xl text-sm font-black tracking-wide text-white"
                      style={{ background: '#020952' }}
                    >
                      Empezar gratis
                    </Link>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:flex md:items-center gap-0">
                    <div className="md:w-52 shrink-0">
                      <div className="text-xs font-black uppercase tracking-[0.2em] mb-1" style={{ color: tier.color }}>
                        Más popular
                      </div>
                      <div className="font-black text-2xl tracking-tight text-brand-navy">{tier.name}</div>
                      <div className="text-sm font-light mt-1 text-brand-navy/65">{tier.range}</div>
                    </div>

                    <div className="flex-1 text-center">
                      <span
                        className="font-black tracking-tighter leading-none tabular-nums text-brand-navy"
                        style={{ fontSize: 'clamp(64px, 10vw, 120px)' }}
                      >
                        {tier.pct}
                      </span>
                      <span className="block text-sm font-medium mt-1 text-brand-navy/60">
                        de comisión notarial
                      </span>
                    </div>

                    <div className="md:w-64 shrink-0 space-y-2">
                      {tier.benefits.map(b => (
                        <div key={b} className="flex items-center gap-2.5 text-brand-navy">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" stroke={tier.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-sm font-medium text-brand-navy/70">{b}</span>
                        </div>
                      ))}
                    </div>

                    <div className="md:w-40 md:text-right shrink-0">
                      <Link
                        href="/register"
                        className="inline-block rounded-full px-7 py-3.5 text-sm font-black tracking-wide text-white hover:opacity-90 active:scale-95 transition-all bg-brand-navy"
                      >
                        Empezar gratis
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={tier.name}
                  className="rounded-2xl p-6 md:p-10 border"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                >
                  {/* Mobile layout */}
                  <div className="flex items-center justify-between md:hidden">
                    <div>
                      <div
                        className="text-xs font-black uppercase tracking-[0.18em] mb-0.5"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </div>
                      <div className="text-sm font-light text-white/65">{tier.range}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-extralight tracking-tighter tabular-nums text-white"
                        style={{ fontSize: '44px', lineHeight: 1 }}
                      >
                        {tier.pct}
                      </span>
                      <div className="text-xs text-white/45 mt-1">comisión</div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:flex md:items-center gap-0">
                    <div className="md:w-52 shrink-0">
                      <div
                        className="text-xs font-black uppercase tracking-[0.18em] mb-1"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </div>
                      <div className="font-black text-xl tracking-tight text-white">{tier.range}</div>
                    </div>

                    <div className="flex-1 md:text-center">
                      <span
                        className="font-extralight tracking-tighter leading-none tabular-nums text-white"
                        style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}
                      >
                        {tier.pct}
                      </span>
                    </div>

                    <div className="md:w-64 shrink-0 space-y-1.5">
                      {tier.benefits.map(b => (
                        <div key={b} className="text-sm font-light text-white/65">{b}</div>
                      ))}
                    </div>

                    <div className="md:w-40 md:text-right shrink-0">
                      <Link
                        href="/register"
                        className="text-sm font-bold tracking-wide hover:text-white transition-colors text-white/65"
                      >
                        Comenzar <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </Reveal>

      </div>
    </section>
  )
}

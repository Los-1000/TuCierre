import Link from 'next/link'
import Reveal from '@/components/landing/Reveal'

const TIERS = [
  {
    level: 'Nivel 1',
    range: '1–3 trámites / mes',
    pct: '3%',
    benefits: ['Plataforma gratis', 'Tracking en tiempo real', 'Chat con notaría'],
    featured: false,
  },
  {
    level: 'Nivel 2',
    range: '4–7 trámites / mes',
    pct: '5%',
    benefits: ['Price match garantizado', 'Soporte prioritario', 'Gestor asignado'],
    featured: true,
  },
  {
    level: 'Nivel 3',
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
      className="py-32 bg-brand-navy border-t border-white/6"
      
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        {/* Header */}
        <Reveal direction="up" delay={0}>
        <div className="mb-20">
          <h2
            className="font-black tracking-tighter leading-none text-white mb-4"
            style={{ fontSize: 'clamp(56px, 9vw, 112px)' }}
          >
            El Sistema.
          </h2>
          <p className="font-light text-lg max-w-md" className="text-white/60">
            Tu comisión sube sola cada mes según volumen. Sin formularios. Sin aprobaciones.
          </p>
        </div>
        </Reveal>

        {/* Tier cards */}
        <Reveal direction="up" delay={150}>
        <div className="space-y-3">
          {TIERS.map(tier =>
            tier.featured ? (
              /* Featured — white card on dark navy */
              <div
                key={tier.level}
                className="rounded-2xl p-8 md:p-10"
                style={{ background: '#ffffff' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-0">
                  {/* Label */}
                  <div className="md:w-48 shrink-0">
                    <div className="text-xs font-black uppercase tracking-[0.2em] mb-1" className="text-brand-navy/55">
                      Más popular
                    </div>
                    <div className="font-black text-2xl tracking-tight text-brand-navy">{tier.level}</div>
                    <div className="text-sm font-light mt-1" className="text-brand-navy/65">{tier.range}</div>
                  </div>

                  {/* Percentage */}
                  <div className="flex-1 md:text-center">
                    <span
                      className="font-black tracking-tighter leading-none tabular-nums text-brand-navy"
                      style={{ fontSize: 'clamp(64px, 10vw, 120px)' }}
                    >
                      {tier.pct}
                    </span>
                    <span className="block text-sm font-medium mt-1" className="text-brand-navy/60">
                      de comisión notarial
                    </span>
                  </div>

                  {/* Benefits */}
                  <div className="md:w-64 shrink-0 space-y-2">
                    {tier.benefits.map(b => (
                      <div key={b} className="flex items-center gap-2.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm font-medium" className="text-brand-navy/70">{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
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
              /* Non-featured — transparent row */
              <div
                key={tier.level}
                className="rounded-2xl p-8 md:p-10 border"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-0">
                  <div className="md:w-48 shrink-0">
                    <div className="font-black text-xl tracking-tight text-white">{tier.level}</div>
                    <div className="text-sm font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{tier.range}</div>
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
                      <div key={b} className="text-sm font-light" className="text-white/60">
                        {b}
                      </div>
                    ))}
                  </div>

                  <div className="md:w-40 md:text-right shrink-0">
                    <Link
                      href="/register"
                      className="text-sm font-bold tracking-wide hover:text-white transition-colors"
                      className="text-white/60"
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

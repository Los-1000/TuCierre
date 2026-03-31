import Link from 'next/link'
import { cn } from '@/lib/utils'
import Reveal from '@/components/landing/Reveal'
import CountUp from '@/components/landing/CountUp'

const TIERS = [
  { name: 'Nivel 1', range: '1–3 trámites/mes', commission: '3%', featured: false, benefits: ['3% de comisión al cierre', 'Plataforma notarial gratis', 'Tracking en tiempo real', 'Soporte por chat integrado'] },
  { name: 'Nivel 2', range: '4–7 trámites/mes', commission: '5%', featured: true, benefits: ['5% de comisión al cierre', 'Price match garantizado', 'Soporte prioritario', 'Gestor de cuenta asignado'] },
  { name: 'Nivel 3', range: '8+ trámites/mes', commission: '8%', featured: false, benefits: ['8% de comisión al cierre', 'Prioridad de firma máxima', 'Atención notarial dedicada', 'Ejecutivo senior asignado'] },
]

export default function PricingSection() {
  return (
    <section id="precios" className="py-24 sm:py-32 bg-[#FFFEF5] relative">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <Reveal>
          <div className="max-w-2xl mb-16 text-center mx-auto">
            <div className="inline-flex items-center gap-2 border border-[#C9880E]/20 bg-[#C9880E]/5 rounded-full px-3 py-1 mb-6">
              <span className="text-[11px] text-[#C9880E] font-bold tracking-widest uppercase">Escala automática</span>
            </div>
            <h2 className="font-display font-semibold leading-tight mb-6" style={{ fontSize: 'clamp(40px, 5vw, 60px)', color: '#12161F' }}>
              Más clientes,<br /><span className="italic text-[#C9880E] font-medium">más comisión.</span>
            </h2>
            <p className="text-[17px] font-medium leading-relaxed text-[#12161F]/65">
              Tres niveles automáticos. Tu porcentaje sube solo cuando cierras más trámites. Sin pagar suscripciones.{' '}
              <br className="hidden sm:block" />
              <a href="#precios" className="underline underline-offset-4 text-[#C9880E] hover:text-[#A06A08] transition-colors font-semibold">
                Sube de nivel sumando referidos →
              </a>
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-center">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 150}>
              <div
                className={cn(
                  'rounded-[2rem] p-8 sm:p-10 border transition-all duration-500 hover:-translate-y-2 flex flex-col h-full',
                  tier.featured
                    ? 'bg-[#12161F] border-[#C9880E]/40 shadow-[0_20px_60px_rgba(201,136,14,0.15)] relative overflow-hidden transform lg:scale-105 z-10'
                    : 'bg-white border-[#12161F]/10 hover:border-[#12161F]/20 shadow-sm'
                )}
              >
                {/* Glow effect for featured card */}
                {tier.featured && (
                  <>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C9880E]/20 rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9880E]/40 to-transparent" />
                  </>
                )}
                
                <div className="mb-8 relative z-10">
                  <p className="text-[12px] font-bold tracking-widest uppercase mb-2" style={{ color: tier.featured ? '#C9880E' : '#12161F', opacity: tier.featured ? 1 : 0.6 }}>
                    {tier.name} {tier.featured && '· Popular'}
                  </p>
                  
                  <div className="font-display font-bold flex items-baseline tracking-tight" style={{ fontSize: 'clamp(56px, 6vw, 76px)', lineHeight: 1, color: tier.featured ? '#FFFEF5' : '#12161F' }}>
                    <CountUp end={parseInt(tier.commission)} duration={1500} />%
                  </div>
                  
                  <p className="text-[14px] font-semibold mt-2" style={{ color: tier.featured ? '#FFFEF5' : '#12161F', opacity: tier.featured ? 0.8 : 0.5 }}>
                    comisión directa · {tier.range}
                  </p>
                </div>
                
                <ul className="space-y-4 mb-10 relative z-10 flex-grow">
                  {tier.benefits.map(b => (
                    <li key={b} className="flex items-start gap-4 text-[14px] font-medium" style={{ color: tier.featured ? '#FFFEF5' : '#12161F', opacity: tier.featured ? 0.9 : 0.75 }}>
                      <div className="mt-0.5 shrink-0 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="12" fill={tier.featured ? '#C9880E' : '#12161F'} fillOpacity={tier.featured ? "0.2" : "0.05"} />
                          <path d="M8 12l3 3 5-6" stroke={tier.featured ? '#C9880E' : '#12161F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/register"
                  className={cn(
                    'block text-center w-full rounded-full py-4 text-[14px] font-semibold transition-all duration-300 relative z-10 border',
                    tier.featured
                      ? 'bg-[#C9880E] border-[#C9880E] text-white shadow-lg hover:bg-[#A06A08] hover:border-[#A06A08]'
                      : 'bg-transparent border-[#12161F]/15 text-[#12161F] hover:border-[#12161F]/40 hover:bg-[#12161F]/5'
                  )}
                >
                  Continuar
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <p className="mt-12 text-center text-[13px] font-medium text-[#12161F]/40">
            El nivel sube automáticamente según tus trámites firmados cada mes. Sin formularios, sin aprobaciones de ejecutivos. Todo desde tu dashboard.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

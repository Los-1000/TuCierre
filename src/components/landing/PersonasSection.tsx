import { cn } from '@/lib/utils'
import Reveal from '@/components/landing/Reveal'

const PERSONAS = [
  {
    title: 'Broker independiente',
    desc: 'Gestiona tus clientes en un solo lugar. Sin Excel, sin WhatsApp, sin notas en papel.',
    bullets: ['Dashboard por cada trámite', 'Comisiones automáticas al cierre', 'Referidos que generan ingresos extra'],
  },
  {
    title: 'Equipos inmobiliarios',
    desc: 'Visibilidad total sobre cada trámite de tu equipo desde un solo panel.',
    bullets: ['Un panel para todo el equipo', 'Sin depender de reportes manuales', 'Coordinación con la notaría incluida'],
  },
  {
    title: 'Agencias y gerentes',
    desc: 'Escala sin perder el control. La plataforma crece contigo.',
    bullets: ['Supervisión en tiempo real', 'Hasta 8% de comisión mensual', 'Reportes automáticos mensuales'],
  },
]

export default function PersonasSection() {
  return (
    <section id="beneficios" className="py-24 sm:py-32 relative bg-[#F0F3FF]">
      {/* Top subtle divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#18181B]/10 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <Reveal>
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 border border-[#18181B]/15 bg-[#18181B]/5 rounded-full px-3 py-1 mb-6">
              <span className="text-[11px] text-[#18181B]/50 font-semibold tracking-widest uppercase">Para quién</span>
            </div>
            <h2 className="font-display font-semibold leading-tight" style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#18181B' }}>
              Hecho para ti.<br/>
              <span className="italic text-[#2855E0]">No para la notaría.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {PERSONAS.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div
                className={cn(
                  'rounded-[2rem] p-8 sm:p-10 border transition-all duration-500 h-full flex flex-col hover:-translate-y-1',
                  i === 1
                    ? 'bg-[#18181B] border-[#18181B] shadow-[0_16px_40px_rgba(18,18,27,0.25)] relative overflow-hidden'
                    : 'bg-[#F0F3FF] border-[#18181B]/10 hover:border-[#18181B]/20 shadow-sm'
                )}
              >
                {/* Glow effect for featured card */}
                {i === 1 && (
                  <>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2855E0]/15 blur-[50px] rounded-full pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2855E0]/30 to-transparent" />
                  </>
                )}
                
                <h3
                  className="font-display text-[26px] font-semibold mb-4 relative z-10"
                  style={{ color: i === 1 ? '#F0F3FF' : '#18181B' }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-[15px] font-medium leading-relaxed mb-8 relative z-10 flex-grow"
                  style={{ color: i === 1 ? '#F0F3FF' : '#18181B', opacity: i === 1 ? 0.8 : 0.6 }}
                >
                  {p.desc}
                </p>
                
                <ul className="space-y-4 relative z-10">
                  {p.bullets.map(b => (
                    <li key={b} className="flex items-start gap-3 text-[14px] font-medium" style={{ color: i === 1 ? '#F0F3FF' : '#18181B', opacity: i === 1 ? 0.9 : 0.7 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="12" fill={i === 1 ? '#2855E0' : '#2855E0'} fillOpacity={i === 1 ? "0.2" : "0.08"} />
                        <path d="M8 12l3 3 5-6" stroke={i === 1 ? '#2855E0' : '#2855E0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

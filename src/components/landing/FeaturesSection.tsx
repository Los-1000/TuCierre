import { cn } from '@/lib/utils'
import Reveal from '@/components/landing/Reveal'

const FEATURES = [
  {
    tag: 'Cotizaciones',
    title: 'Precio exacto.\nEn segundos.',
    desc: 'Sin llamar a la notaría. Sin esperar. Selecciona el trámite y el precio aparece al instante — listo para compartir con tu cliente.',
    bullets: ['16+ tipos de trámite', 'Precio siempre actualizado', 'Cotización compartible al instante'],
  },
  {
    tag: 'Seguimiento',
    title: 'Nunca más\n"¿Cuándo sale?"',
    desc: 'Estado en tiempo real para ti y tu cliente. Cada paso visible, notificaciones automáticas, historial completo del trámite.',
    bullets: ['Tracking paso a paso', 'Chat directo con la notaría', 'Notificaciones automáticas'],
  },
  {
    tag: 'Comisiones',
    title: 'Tu pago,\nsin perseguir.',
    desc: 'Al cerrar un trámite, la comisión se calcula y acredita automáticamente. Sin negociaciones, sin demoras, sin olvidos.',
    bullets: ['Hasta 8% por trámite cerrado', 'Acreditación automática', 'Historial completo de pagos'],
  },
]

function FeatureMockup({ tag }: { tag: string }) {
  if (tag === 'Cotizaciones') return (
    <div className="bg-[#1C1C1E] rounded-3xl border border-white/10 p-6 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9880E]/10 blur-2xl pointer-events-none" />
      <div className="text-[11px] text-white/30 font-mono mb-3">tucierre.pe/cotizar</div>
      <div className="space-y-3 relative z-10">
        {[
          { label: 'Tipo', value: 'Compraventa de inmueble' },
          { label: 'Precio base', value: 'S/. 1,200.00' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3 border border-white/5 transition-colors hover:bg-white/10">
            <span className="text-[12px] text-white/40">{row.label}</span>
            <span className="text-[13px] font-semibold text-white/90">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-4 flex justify-between items-center relative z-10">
        <span className="text-[13px] text-white/40">Total</span>
        <span className="font-display text-[26px] font-bold text-[#C9880E]">S/. 1,200</span>
      </div>
      <div className="bg-[#C9880E]/10 border border-[#C9880E]/20 rounded-xl px-3 py-2.5 text-[11px] text-[#C9880E]/90 text-center font-medium relative z-10 shadow-sm">
        ⚡ Calculado al instante — sin llamadas
      </div>
    </div>
  )

  if (tag === 'Seguimiento') return (
    <div className="bg-[#1C1C1E] rounded-3xl border border-white/10 p-6 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-[#1B5E4B]/20 blur-2xl -translate-y-1/2 pointer-events-none" />
      <div className="text-[11px] text-white/30 font-mono mb-3">TC-2025-00134 · Estado del trámite</div>
      <div className="relative z-10">
        <div className="absolute left-[9px] top-6 bottom-6 w-[2px] bg-white/5" />
        {[
          { step: 'Solicitud recibida', done: true },
          { step: 'Documentos completos', done: true },
          { step: 'En firma notarial', done: true, active: true },
          { step: 'Inscripción registral', done: false },
          { step: 'Escritura entregada', done: false },
        ].map(row => (
          <div key={row.step} className="flex items-center gap-4 py-2 relative">
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] relative z-10 shadow-sm border',
              row.active ? 'bg-[#C9880E] border-[#C9880E]/50 text-white' : row.done ? 'bg-[#1B5E4B] border-[#1B5E4B]/50 text-[#1B5E4B]' : 'bg-[#1C1C1E] border-white/10 text-transparent'
            )}>
              {row.done && !row.active ? <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : row.active ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : null}
            </div>
            <span className={cn('text-[14px] transition-colors', row.active ? 'text-white font-semibold' : row.done ? 'text-white/60 font-medium' : 'text-white/30')}>
              {row.step}
            </span>
            {row.active && <span className="ml-auto text-[10px] bg-[#C9880E]/20 text-[#C9880E] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">En curso</span>}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-[#1C1C1E] rounded-3xl border border-white/10 p-6 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#C9880E]/15 blur-2xl pointer-events-none" />
      <div className="text-[11px] text-white/30 font-mono mb-3">Comisiones · Diciembre 2026</div>
      <div className="space-y-3 relative z-10">
        {[
          { label: 'Compraventa · Carlos R.', amount: 'S/. 96', status: 'paid' },
          { label: 'Hipoteca · Ana M.', amount: 'S/. 60', status: 'paid' },
          { label: 'Poder Notarial · Luis P.', amount: 'S/. 24', status: 'pending' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5 transition-colors hover:bg-white/10">
            <div>
              <div className="text-[13px] text-white/80 font-medium">{row.label}</div>
              <div className={cn('text-[11px] mt-1 font-semibold flex items-center gap-1.5', row.status === 'paid' ? 'text-emerald-400' : 'text-[#C9880E]/80')}>
                <div className={cn("w-1.5 h-1.5 rounded-full", row.status === 'paid' ? 'bg-emerald-400' : 'bg-[#C9880E]/80 animate-pulse')} />
                {row.status === 'paid' ? 'Acreditado' : 'En proceso'}
              </div>
            </div>
            <span className="font-display text-[20px] font-semibold text-white/90">{row.amount}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-4 flex justify-between items-center relative z-10">
        <span className="text-[13px] text-white/40 font-medium">Total este mes</span>
        <span className="font-display text-[26px] font-bold text-[#C9880E]">S/. 720</span>
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section className="bg-[#12161F] border-t border-white/5">
      {FEATURES.map((feature, i) => (
        <div
          key={feature.tag}
          className={cn(
            'py-24 sm:py-32 relative',
            i !== FEATURES.length - 1 && 'border-b border-white/5'
          )}
        >
          {/* Subtle staggered noise backdrops */}
          <div className="absolute inset-0 noise-overlay pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-6 sm:px-10 relative z-10">
            <div className={cn('grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-center', i % 2 !== 0 && 'lg:[&>*:first-child]:order-2')}>
              {/* Text */}
              <Reveal direction={i % 2 !== 0 ? 'right' : 'left'}>
                <div>
                  <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-[#C9880E] border border-[#C9880E]/20 bg-[#C9880E]/10 rounded-full px-3 py-1 mb-6">
                    {feature.tag}
                  </span>
                  
                  <h2 className="font-display font-semibold leading-tight mb-6 whitespace-pre-line" style={{ fontSize: 'clamp(36px, 4.5vw, 52px)', color: '#FFFEF5' }}>
                    {feature.title}
                  </h2>
                  
                  <p className="text-[17px] leading-relaxed mb-10 text-[#FFFEF5]/60">
                    {feature.desc}
                  </p>
                  
                  <ul className="space-y-4">
                    {feature.bullets.map(b => (
                      <li key={b} className="flex items-center gap-4 text-[15px] font-medium text-[#FFFEF5]/70">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C9880E]" />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              
              {/* Mockup */}
              <Reveal direction={i % 2 !== 0 ? 'left' : 'right'} delay={200}>
                <div className="relative group perspective-1000">
                  <div className="absolute -inset-8 bg-gradient-to-r from-[#C9880E]/0 via-[#C9880E]/5 to-[#C9880E]/0 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 pointer-events-none" />
                  <div className="relative transition-transform duration-700 hover:scale-[1.02] hover:-rotate-1">
                    <FeatureMockup tag={feature.tag} />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

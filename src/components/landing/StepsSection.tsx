import Reveal from '@/components/landing/Reveal'

const HOW_STEPS = [
  { n: '01', title: 'Registra a tu cliente', body: 'Ingresa el tipo de trámite, sube los documentos y listo. Menos de 3 minutos.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { n: '02', title: 'La notaría lo procesa', body: 'Nuestro equipo notarial recibe todo de forma automática y empieza el trámite.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { n: '03', title: 'Tú cobras la comisión', body: 'Al cierre, recibes tu comisión directamente. Sin perseguir a nadie.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

export default function StepsSection() {
  return (
    <section id="como-funciona" className="py-24 sm:py-32 relative bg-[#FFFEF5]">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <Reveal>
          <div className="max-w-xl mb-16">
            <div className="inline-flex items-center gap-2 border border-[#C9880E]/20 bg-[#C9880E]/5 rounded-full px-3 py-1 mb-6">
              <span className="text-[11px] text-[#C9880E] font-semibold tracking-widest uppercase">Cómo funciona</span>
            </div>
            <h2 className="font-display font-semibold leading-tight mb-5" style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#12161F' }}>
              Tres pasos.<br /><span className="italic text-[#C9880E]">Sin complicaciones.</span>
            </h2>
            <p className="text-[17px] leading-relaxed text-[#12161F]/60">
              El proceso tradicional tarda 3 semanas en promedio. Con TuCierre, tus clientes tienen respuesta en 7 días y tú cobras tu comisión en automático.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {HOW_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <div className="group relative bg-white border border-[#12161F]/5 rounded-3xl p-8 hover:border-[#12161F]/15 hover:shadow-[0_8px_32px_rgba(18,22,31,0.04)] transition-all duration-500 hover:-translate-y-1">
                {/* Number Watermark */}
                <div className="absolute top-6 right-6 font-display font-bold text-[64px] leading-none text-[#12161F]/[0.03] group-hover:text-[#C9880E]/10 transition-colors duration-500 pointer-events-none select-none">
                  {step.n}
                </div>
                
                <div className="flex flex-col h-full relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#12161F]/5 flex items-center justify-center text-[#12161F] group-hover:bg-[#C9880E] group-hover:text-white transition-all duration-300 mb-8 shadow-sm">
                    {step.icon}
                  </div>
                  <h3 className="font-display text-[24px] font-semibold mb-3 text-[#12161F]">{step.title}</h3>
                  <p className="text-[15px] font-medium leading-relaxed text-[#12161F]/65">{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

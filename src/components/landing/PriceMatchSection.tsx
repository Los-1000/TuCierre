import Reveal from '@/components/landing/Reveal'

export default function PriceMatchSection() {
  return (
    <section id="pricematch" className="py-24 sm:py-32 bg-[#F9F9F8] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#18181B]/10 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-center">

          {/* Left — Copy */}
          <Reveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#2B3B44]/8 border border-[#2B3B44]/20 rounded-full px-3 py-1 mb-8">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5L12.5 4.5V9.5L7 12.5L1.5 9.5V4.5L7 1.5Z" stroke="#2B3B44" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M4.5 7l1.5 1.5L9.5 5" stroke="#2B3B44" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[11px] text-[#2B3B44] font-bold tracking-widest uppercase">Garantía Price Match</span>
              </div>
              
              <h2 className="font-display font-semibold leading-tight mb-6" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', color: '#18181B' }}>
                Promete el mejor precio.<br />
                <span className="italic" style={{ color: '#2B3B44' }}>Siempre.</span>
              </h2>
              
              <p className="text-[17px] leading-relaxed mb-10 text-[#18181B]/60">
                Si tu cliente encuentra un precio más bajo en otra notaría, nosotros lo igualamos.
                Tú cierras el trato con total confianza — sin perder ni una sola operación por precio.
              </p>

              <ol className="space-y-6 mb-10 relative">
                {/* Connecting line */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-[#2B3B44]/15 z-0" />
                
                {[
                  { n: '01', title: 'Tu cliente recibe una cotización más baja', body: 'En otra notaría le ofrecen un precio menor. Sucede.' },
                  { n: '02', title: 'Presentas la cotización en tu panel', body: 'Subes el documento en segundos desde el trámite correspondiente.' },
                  { n: '03', title: 'Igualamos el precio', body: 'Verificamos la oferta y aplicamos el descuento. Garantizado.' },
                ].map((step, i) => (
                  <li key={step.n} className="flex items-start gap-5 relative z-10">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold bg-[#F9F9F8] border-2 border-[#2B3B44]/20 text-[#2B3B44] shadow-sm">
                      {step.n}
                    </div>
                    <div className="pt-1">
                      <div className="text-[15px] font-semibold text-[#18181B] mb-1">{step.title}</div>
                      <div className="text-[14px] text-[#18181B]/40 font-medium leading-relaxed">{step.body}</div>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="inline-flex items-center gap-2 text-[12px] text-[#18181B]/40 font-medium border border-[#18181B]/10 rounded-full px-4 py-2 bg-[#F0EDE6]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L5 8.5L2 5.5" stroke="#18181B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                </svg>
                Garantía documentada · Solo disponible desde Nivel 2
              </div>
            </div>
          </Reveal>

          {/* Right — Mockup Comparison */}
          <Reveal direction="right" delay={200}>
            <div className="space-y-3 relative group">
              <div className="absolute -inset-10 bg-gradient-to-tr from-[#2B3B44]/0 via-[#2B3B44]/5 to-transparent rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000 pointer-events-none" />
              
              <p className="text-[11px] text-[#18181B]/40 font-bold uppercase tracking-widest mb-6 text-center">Ejemplo real</p>

              {/* Competitor quote */}
              <div className="relative z-10 rounded-3xl border border-[#18181B]/8 bg-[#F0EDE6] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] text-[#18181B]/50 font-medium">Notaría externa</div>
                  <div className="text-[11px] bg-[#18181B]/5 text-[#18181B]/50 px-3 py-1.5 rounded-full font-medium border border-[#18181B]/5">
                    Cotización del cliente
                  </div>
                </div>
                <div className="text-[14px] font-medium text-[#18181B]/60 mb-2">Compraventa de inmueble</div>
                <div className="font-display text-[40px] font-bold text-[#18181B]/30 line-through leading-none">
                  S/. 1,100
                </div>
              </div>

              {/* Arrow Connection */}
              <div className="flex items-center justify-center py-2 relative z-10">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-[#2B3B44]/10 rounded-full flex items-center justify-center border border-[#2B3B44]/20">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4v12M6 12l4 4 4-4" stroke="#2B3B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#2B3B44] font-semibold mt-1">Price Match aplicado</span>
                </div>
              </div>

              {/* TuCierre matched quote */}
              <div className="relative z-20 rounded-3xl border-2 bg-[#F9F9F8] p-7 shadow-[0_12px_48px_rgba(18,18,27,0.10)] transition-transform duration-500 hover:-translate-y-2" style={{ borderColor: '#18181B22' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#18181B] flex items-center justify-center shadow-md">
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="#D47151" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[14px] font-bold text-[#18181B] tracking-tight">TuCierre</span>
                  </div>
                  <div className="text-[11px] bg-[#2B3B44]/10 text-[#2B3B44] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-[#2B3B44]/20">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2L8 3" stroke="#2B3B44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Precio igualado
                  </div>
                </div>
                
                <div className="text-[14px] font-medium text-[#18181B]/60 mb-2">Compraventa de inmueble</div>
                <div className="font-display text-[48px] font-bold leading-none mb-4" style={{ color: '#2B3B44' }}>
                  S/. 1,100
                </div>
                
                <div className="pt-4 border-t border-[#18181B]/10 flex items-center justify-between">
                  <span className="text-[13px] text-[#18181B]/50 font-semibold">Tu comisión (5%)</span>
                  <span className="text-[14px] font-bold text-[#D47151] px-2.5 py-1 bg-[#D47151]/10 rounded-md">+ S/. 55</span>
                </div>
              </div>

            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}

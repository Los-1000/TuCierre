import Reveal from '@/components/landing/Reveal'

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 bg-brand-navy border-t border-white/6">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <Reveal direction="up" delay={0}>
            <h2
              className="leading-[1.05] tracking-tighter max-w-2xl text-white/95"
              style={{ fontSize: 'clamp(32px, 4.5vw, 62px)' }}
            >
              <span className="font-extralight">Todo lo que necesitas<br />para cerrar </span>
              <span className="font-black font-display italic text-brand-blue">sin fricciones</span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <p className="text-sm font-medium leading-relaxed max-w-xs text-white/50">
              Una sola plataforma. Desde la cotización hasta la firma.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-3">

          {/* Feature 01 — spans 2 cols */}
          <Reveal className="md:col-span-2" direction="up" delay={150}>
            <div
              className="rounded-2xl p-10 md:p-14 flex flex-col justify-between h-full bg-white/7"
              style={{ minHeight: '340px' }}
            >
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">01</p>
              <div>
                <h3
                  className="font-black tracking-tight leading-tight mb-4 text-white/95"
                  style={{ fontSize: 'clamp(22px, 2.8vw, 38px)' }}
                >
                  Precios verificados<br />al instante
                </h3>
                <p className="text-lg leading-relaxed text-white/60" style={{ maxWidth: '460px' }}>
                  Cotizaciones notariales en segundos. Sin llamadas, sin sorpresas.
                  Lo que ves en pantalla es lo que paga tu cliente.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Feature 02 — process flow */}
          <Reveal direction="up" delay={200}>
            <div
              className="rounded-2xl p-8 flex flex-col justify-between gap-6 h-full bg-white/7"
              style={{ minHeight: '340px' }}
            >
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">02</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Cotización', time: '< 1 min', desc: 'Precio exacto en segundos', done: true },
                  { label: 'Documentos', time: '1 día', desc: 'Cliente sube desde su celular', done: true },
                  { label: 'Firma y registro', time: '48 h', desc: 'Coordinamos con la notaría', done: false },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 mt-0.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? 'bg-brand-blue/25' : 'bg-white/8'}`}>
                        {s.done ? (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        )}
                      </div>
                      {i < 2 && <div className="w-px h-3 bg-white/8" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white">{s.label}</span>
                        <span className="text-[11px] font-black tracking-widest uppercase text-white/50">{s.time}</span>
                      </div>
                      <p className="text-xs mt-0.5 text-white/60">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/50">
                De la cotización a la firma — 48 h promedio en Lima
              </p>
            </div>
          </Reveal>

          {/* Feature 03 — full width bottom */}
          <Reveal className="md:col-span-3" direction="up" delay={100}>
            <div className="rounded-2xl overflow-hidden">
              <div className="grid md:grid-cols-[5fr_7fr] bg-white/7">
                <div className="p-10 md:p-14 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-white/12">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">03</p>
                  <h3
                    className="font-black tracking-tight leading-tight text-white/95"
                    style={{ fontSize: 'clamp(20px, 2.5vw, 36px)' }}
                  >
                    Tu reputación,<br />protegida
                  </h3>
                </div>
                <div className="p-10 md:p-14 flex items-center bg-brand-navy border-t border-white/6">
                  <p className="text-lg leading-relaxed text-white/60">
                    Cada trámite es supervisado por expertos notariales en Lima.
                    Sin errores de proceso, sin riesgos legales para ti ni para tu cliente
                    — tu nombre queda limpio en cada operación.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}

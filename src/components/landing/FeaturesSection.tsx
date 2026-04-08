export default function FeaturesSection() {
  return (
    <section id="features" className="py-28" style={{ background: '#F8FAFF' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h2
            className="leading-[1.05] tracking-tighter max-w-2xl"
            style={{ fontSize: 'clamp(32px, 4.5vw, 62px)', color: '#0F172A' }}
          >
            <span className="font-extralight">Todo lo que necesitas<br />para cerrar </span>
            <span className="font-black font-display italic" style={{ color: '#2563EB' }}>sin fricciones</span>
          </h2>
          <p className="text-sm font-medium leading-relaxed max-w-xs" style={{ color: '#94A3B8' }}>
            Una sola plataforma. Desde la cotización hasta la firma.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">

          {/* Feature 01 — spans 2 cols */}
          <div
            className="md:col-span-2 rounded-2xl p-10 md:p-14 flex flex-col justify-between"
            style={{ background: '#EEF2FF', minHeight: '340px' }}
          >
            <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: '#2563EB' }}>01</p>
            <div>
              <h3
                className="font-black tracking-tight leading-tight mb-4"
                style={{ color: '#0F172A', fontSize: 'clamp(22px, 2.8vw, 38px)' }}
              >
                Precios verificados<br />al instante
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: '#475569', maxWidth: '460px' }}>
                Cotizaciones notariales en segundos. Sin llamadas, sin sorpresas.
                Lo que ves en pantalla es lo que paga tu cliente.
              </p>
            </div>
          </div>

          {/* Feature 02 — stat hero */}
          <div
            className="rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden"
            style={{ background: '#0F172A', minHeight: '340px' }}
          >
            <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: '#2563EB' }}>02</p>
            <div
              className="absolute bottom-0 right-0 font-black leading-none select-none pointer-events-none"
              style={{ fontSize: '200px', color: 'rgba(255,255,255,0.03)', lineHeight: 1 }}
              aria-hidden="true"
            >
              %
            </div>
            <div className="relative z-10">
              <div
                className="font-black leading-none tracking-tighter mb-3"
                style={{ fontSize: 'clamp(72px, 12vw, 128px)', color: '#fff' }}
              >
                40<span style={{ color: '#2563EB' }}>%</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Más rápido al cierre</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                Gestión 100% digital. Tu cliente sube los documentos desde su celular;
                tú sigues el avance en tiempo real.
              </p>
            </div>
          </div>

          {/* Feature 03 — full width bottom */}
          <div className="md:col-span-3 rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-[5fr_7fr]" style={{ background: '#EEF2FF' }}>
              <div
                className="p-10 md:p-14 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r"
                style={{ borderColor: '#DBEAFE' }}
              >
                <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: '#2563EB' }}>03</p>
                <h3
                  className="font-black tracking-tight leading-tight"
                  style={{ color: '#0F172A', fontSize: 'clamp(20px, 2.5vw, 36px)' }}
                >
                  Tu reputación,<br />protegida
                </h3>
              </div>
              <div className="p-10 md:p-14 flex items-center" style={{ background: '#F8FAFF' }}>
                <p className="text-lg leading-relaxed" style={{ color: '#475569' }}>
                  Cada trámite es supervisado por expertos notariales en Lima.
                  Sin errores de proceso, sin riesgos legales para ti ni para tu cliente
                  — tu nombre queda limpio en cada operación.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

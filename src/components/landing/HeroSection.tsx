import Link from 'next/link'

const STEPS = [
  { label: 'Documentos cargados',      state: 'done'    },
  { label: 'Revisión notarial',        state: 'done'    },
  { label: 'Listo para firma',         state: 'active'  },
  { label: 'Inscripción en Registros', state: 'pending' },
] as const

function TramiteCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden select-none"
      style={{
        background: '#fff',
        boxShadow: '0 24px 64px rgba(37,99,235,0.10), 0 4px 16px rgba(37,99,235,0.06)',
        border: '1px solid #DBEAFE',
      }}
      aria-hidden="true"
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#0F172A' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#2563EB' }} />
          <span className="text-sm font-bold text-white tracking-tight">Tu Cierre</span>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.35)' }}
        >
          En firma
        </span>
      </div>

      <div className="px-5 py-4 border-b" style={{ borderColor: '#DBEAFE' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#94A3B8' }}>
          Tipo de trámite
        </p>
        <p className="font-semibold text-sm" style={{ color: '#0F172A' }}>Compraventa de Inmueble</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {STEPS.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            {step.state === 'done' && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#1C7A52' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            {step.state === 'active' && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 animate-pulse" style={{ background: '#2563EB' }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
            {step.state === 'pending' && (
              <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: '#DBEAFE' }} />
            )}
            <div className="flex-1 flex items-center justify-between gap-2">
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    step.state === 'done'    ? '#1C7A52'
                    : step.state === 'active' ? '#0F172A'
                    : '#94A3B8',
                }}
              >
                {step.label}
              </span>
              {step.state === 'active' && (
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#2563EB' }}>
                  Ahora
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 flex items-center gap-2 border-t" style={{ background: '#F8FAFF', borderColor: '#DBEAFE' }}>
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <p className="text-[10px] font-semibold" style={{ color: '#475569' }}>
          Precio igualado automáticamente
        </p>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden pt-[64px] flex items-center"
      style={{ background: '#F8FAFF', minHeight: '88vh' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 65% 50%, rgba(37,99,235,0.05) 0%, transparent 60%)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(37,99,235,0.25), transparent)' }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-20 w-full">
        <div className="grid lg:grid-cols-[1fr_400px] gap-16 xl:gap-24 items-center">

          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border"
              style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.28)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#2563EB' }} aria-hidden="true" />
              <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: '#1E3A8A' }}>
                Plataforma Notarial · Lima, Perú
              </span>
            </div>

            <h1
              className="leading-[0.93] tracking-tighter"
              style={{ fontSize: 'clamp(48px, 7vw, 96px)', color: '#0F172A' }}
            >
              <span className="block font-extralight">El trámite notarial</span>
              <span className="block font-extralight">de tu cliente,</span>
              <span className="block font-black font-display italic" style={{ color: '#2563EB' }}>
                resuelto.
              </span>
            </h1>

            <p
              className="leading-relaxed max-w-xl"
              style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', color: '#475569' }}
            >
              Gestiona compraventas, poderes notariales e hipotecas en Lima desde tu celular.
              Sube los documentos, coordinamos con la notaría y avisamos cuándo firmar.{' '}
              <strong style={{ color: '#0F172A', fontWeight: 600 }}>Gratis para brokers.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200"
                style={{ background: '#2563EB', fontSize: '1rem' }}
              >
                Crear mi cuenta gratis
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl border hover:bg-[#2563EB]/5 active:scale-95 transition-all duration-200"
                style={{ color: '#0F172A', borderColor: '#DBEAFE', fontSize: '1rem' }}
              >
                Ver cómo funciona
              </a>
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              {['Sin tarjeta requerida', 'Gratis para brokers', 'Activo en Lima'].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#94A3B8' }}>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#1C7A52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <TramiteCard />
          </div>

        </div>
      </div>
    </section>
  )
}

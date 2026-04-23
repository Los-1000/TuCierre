import Link from 'next/link'
import Reveal from '@/components/landing/Reveal'

export default function CtaSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-brand-navy border-t border-white/6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(255,255,255,0.02) 0%, transparent 55%)' }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 relative z-10 text-center space-y-10">

        <Reveal direction="up" delay={0}>
          <h2
            className="leading-none tracking-tighter mx-auto text-white"
            style={{ fontSize: 'clamp(48px, 9vw, 120px)', maxWidth: '900px' }}
          >
            <span className="font-extralight">Tu próximo trámite </span>
            <span className="font-black font-display italic text-brand-blue">empieza aquí.</span>
          </h2>
        </Reveal>

        <Reveal direction="up" delay={100}>
          <p
            className="font-medium mx-auto text-white/60"
            style={{ fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '520px' }}
          >
            Regístrate en 2 minutos. Tu primer trámite puede salir hoy mismo.
          </p>
        </Reveal>

        <Reveal direction="up" delay={150}>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-white/60">
            {['Mejor precio garantizado', 'Sin tarjeta requerida', 'Activo en Lima hoy'].map(item => (
              <span key={item} className="flex items-center gap-2">
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/55" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal direction="up" delay={200}>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-12 py-5 text-white font-black text-lg rounded-xl hover:brightness-110 active:scale-95 transition-all duration-200 bg-brand-blue"
            >
              Crear mi cuenta gratis
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 font-semibold text-base rounded-xl border border-white/18 hover:bg-white/5 active:scale-95 transition-all duration-200 text-white"
            >
              Ingresar a mi cuenta
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  )
}

import Link from 'next/link'
import Reveal from '@/components/landing/Reveal'

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-brand-border-light">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 relative z-10">

        <div className="grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-end">

          <div>
            <Reveal direction="up" delay={0}>
              <h2
                className="text-display-cta tracking-tighter text-brand-navy"
                style={{ maxWidth: '720px' }}
              >
                <span className="font-extralight">Tu próximo trámite </span>
                <span className="font-black font-display italic text-brand-gold-light">empieza aquí.</span>
              </h2>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <p
                className="font-medium mt-5 text-brand-muted"
                style={{ fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: '460px' }}
              >
                Regístrate en 2 minutos. Tu primer trámite puede salir hoy mismo.
              </p>
            </Reveal>
          </div>

          <Reveal direction="up" delay={150}>
            <div className="flex flex-col gap-3 md:items-end">
              <Link
                href="/register"
                className="px-10 py-4 text-brand-navy font-black text-base rounded-xl hover:brightness-110 active:scale-95 transition-all motion-reduce:transition-none duration-200 bg-brand-gold text-center"
              >
                Crear mi cuenta gratis
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-center py-2 hover:text-brand-navy transition-colors text-brand-navy/50"
              >
                Ya tengo cuenta → Ingresar
              </Link>
            </div>
          </Reveal>

        </div>

      </div>
    </section>
  )
}

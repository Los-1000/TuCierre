import Link from 'next/link'

export default function HeroSection() {
  return (
    <header className="relative overflow-hidden pt-[64px]" style={{ background: '#0a1f44' }}>
      {/* Subtle architectural texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-[#d06d0d]/10" />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-28 md:py-44 relative z-10 flex flex-col items-center text-center">
        <div className="space-y-10 max-w-4xl flex flex-col items-center">

          {/* Eyebrow pill */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20">
            <span className="text-white text-xs font-bold tracking-widest uppercase">
              Red de Brokers · Lima, Perú
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95]">
            El trámite notarial{' '}
            <span style={{ color: '#d06d0d' }}>de tu cliente</span>,{' '}
            resuelto.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl max-w-2xl leading-relaxed font-medium" style={{ color: '#7f9fc2' }}>
            Sube los documentos desde cualquier lugar. Nosotros coordinamos con la notaría
            — tú solo apareces a firmar.
          </p>

          {/* Price Match guarantee badge */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-[#d06d0d]/30 bg-white/5">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d06d0d" strokeWidth="2" strokeLinejoin="round" fill="#d06d0d" fillOpacity="0.15"/>
            </svg>
            <span className="text-sm font-semibold text-white/80">
              Igualador de Precio — <span style={{ color: '#d06d0d' }}>si encuentras menos, lo igualamos</span>
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 pt-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="px-10 py-5 text-white rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-2xl flex items-center justify-center gap-2"
              style={{ background: '#d06d0d' }}
            >
              Registrarme como Broker
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-white/10 text-white rounded-xl font-bold text-lg backdrop-blur hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center"
            >
              Ingresar
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-xs text-white/30 font-medium tracking-widest uppercase">
            120+ brokers activos · Lima, Perú · Gratis · Sin tarjeta
          </p>
        </div>
      </div>
    </header>
  )
}

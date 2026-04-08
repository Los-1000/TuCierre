import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: '#0F172A' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(37,99,235,0.1) 0%, transparent 55%)' }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 relative z-10 text-center space-y-10">

        <h2
          className="leading-none tracking-tighter mx-auto"
          style={{ fontSize: 'clamp(48px, 9vw, 120px)', color: '#fff', maxWidth: '900px' }}
        >
          <span className="font-extralight">Tu próximo trámite </span>
          <span className="font-black font-display italic" style={{ color: '#2563EB' }}>empieza aquí.</span>
        </h2>

        <p
          className="font-medium mx-auto"
          style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.4)', maxWidth: '520px' }}
        >
          Regístrate en 2 minutos. Tu primer trámite puede salir hoy mismo.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {['Mejor precio garantizado', 'Sin tarjeta requerida', 'Activo en Lima hoy'].map(item => (
            <span key={item} className="flex items-center gap-2">
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="px-12 py-5 text-white font-black text-lg rounded-xl hover:brightness-110 active:scale-95 transition-all duration-200"
            style={{ background: '#2563EB' }}
          >
            Crear mi cuenta gratis
          </Link>
          <Link
            href="/login"
            className="px-12 py-5 font-black text-lg rounded-xl border hover:bg-white/5 active:scale-95 transition-all duration-200"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            Ingresar a mi cuenta
          </Link>
        </div>

      </div>
    </section>
  )
}

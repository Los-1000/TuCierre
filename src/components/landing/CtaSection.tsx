import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="py-32 bg-[#fbf8fc] relative overflow-hidden">
      {/* Diagonal accent */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full -skew-x-12 transform translate-x-1/3 pointer-events-none"
        style={{ background: '#d06d0d08' }}
      />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10 text-center space-y-12">
        <h2
          className="font-black max-w-4xl mx-auto tracking-tighter leading-none"
          style={{ fontSize: 'clamp(44px, 7vw, 84px)', color: '#00081e' }}
        >
          120 brokers ya cerraron{' '}
          <br />
          <span style={{ color: '#d06d0d', textDecoration: 'underline', textDecorationColor: '#d06d0d', textUnderlineOffset: '8px', textDecorationThickness: '4px' }}>
            su último trámite aquí
          </span>.
        </h2>

        <p className="text-xl md:text-2xl max-w-2xl mx-auto font-medium" style={{ color: '#44464e' }}>
          Regístrate en 2 minutos. Tu primer trámite puede salir hoy mismo.
        </p>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold" style={{ color: '#44464e' }}>
          {['✓ Mejor precio garantizado', '✓ Sin tarjeta requerida', '✓ Activo en Lima hoy'].map(item => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
          <Link
            href="/register"
            className="px-12 py-6 text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
            style={{ background: '#00081e' }}
          >
            Crear mi cuenta gratis
          </Link>
          <Link
            href="/login"
            className="px-12 py-6 bg-white border-2 border-slate-200 rounded-2xl font-black text-xl hover:bg-slate-50 transition-colors shadow-lg"
            style={{ color: '#00081e' }}
          >
            Ingresar a mi cuenta
          </Link>
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'

const COLS = [
  {
    heading: 'Empresa',
    links: [['Contacto', '#'], ['Nosotros', '#'], ['Blog Notarial', '#']],
  },
  {
    heading: 'Legal',
    links: [['Privacidad', '/privacidad'], ['Términos', '/terminos'], ['Seguridad', '#']],
  },
  {
    heading: 'Recursos',
    links: [['Soporte', '#'], ['Cómo funciona', '#como-funciona'], ['Precios', '#precios']],
  },
]

export default function LandingFooter() {
  return (
    <footer className="w-full py-20 px-6 md:px-16 border-t border-white/10" style={{ background: '#00081e' }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-screen-2xl mx-auto">
        {/* Brand col */}
        <div className="space-y-6">
          <Link href="/" className="text-3xl font-black text-white block tracking-tighter">
            Tu Cierre
          </Link>
          <p className="text-lg" style={{ color: '#7f9fc2' }}>
            Líder en infraestructura digital para transacciones inmobiliarias de alto valor en Lima.
          </p>
          {/* Price Match badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold"
            style={{ background: '#0a1f44', borderColor: '#d06d0d30', color: '#d06d0d' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d06d0d" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Igualador de Precio
          </div>
        </div>

        {/* Link cols */}
        {COLS.map(col => (
          <div key={col.heading} className="space-y-6">
            <h4 className="font-black uppercase tracking-widest text-xs" style={{ color: '#d06d0d' }}>
              {col.heading}
            </h4>
            <div className="flex flex-col gap-4">
              {col.links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-lg transition-colors hover:text-white"
                  style={{ color: '#64748b' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="max-w-screen-2xl mx-auto mt-20 pt-16 border-t border-white/10 flex flex-col items-center text-center gap-6">
        <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Tu próximo cierre empieza aquí.
        </p>
        <p className="text-lg max-w-md" style={{ color: '#7f9fc2' }}>
          Gratis para brokers. Sin tarjeta. Listo en minutos.
        </p>
        <Link
          href="/register"
          className="px-10 py-5 text-white rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-2xl"
          style={{ background: '#d06d0d' }}
        >
          Registrarme como Broker
        </Link>
      </div>

      {/* Bottom bar */}
      <div className="max-w-screen-2xl mx-auto mt-12 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-sm font-medium" style={{ color: '#44464e' }}>
          © 2026 Tu Cierre · Plataforma notarial para brokers inmobiliarios en Perú
        </p>
        <div className="flex items-center gap-3">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#44464e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#44464e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#44464e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
      </div>
    </footer>
  )
}

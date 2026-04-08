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
    <footer
      className="w-full border-t"
      style={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        <div className="space-y-5">
          <Link href="/" className="text-2xl font-black tracking-tighter block" style={{ color: '#fff' }}>
            Tu<span style={{ color: '#2563EB' }}>Cierre</span>
          </Link>
          <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
            Líder en infraestructura digital para transacciones inmobiliarias de alto valor en Lima.
          </p>
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold"
            style={{ background: '#1E3A8A22', borderColor: 'rgba(37,99,235,0.3)', color: '#93C5FD' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#93C5FD" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Igualador de Precio
          </div>
        </div>

        {COLS.map(col => (
          <div key={col.heading} className="space-y-5">
            <h4 className="font-black uppercase tracking-widest text-xs" style={{ color: '#2563EB' }}>
              {col.heading}
            </h4>
            <div className="flex flex-col gap-3">
              {col.links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm transition-colors duration-200 hover:text-white"
                  style={{ color: '#475569' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="max-w-screen-xl mx-auto px-6 md:px-10 py-12 border-t flex flex-col items-center text-center gap-5"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <p className="font-black text-white tracking-tight leading-none" style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}>
          Tu próximo cierre{' '}
          <span className="font-display italic" style={{ color: '#2563EB' }}>empieza aquí.</span>
        </p>
        <p className="text-base" style={{ color: '#475569' }}>Gratis para brokers. Sin tarjeta. Listo en minutos.</p>
        <Link
          href="/register"
          className="px-8 py-4 text-white rounded-xl font-bold text-base hover:brightness-110 active:scale-95 transition-all duration-200"
          style={{ background: '#2563EB' }}
        >
          Registrarme como Broker
        </Link>
      </div>

      <div
        className="max-w-screen-xl mx-auto px-6 md:px-10 py-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs font-medium" style={{ color: '#334155' }}>
          © 2026 Tu Cierre · Plataforma notarial para brokers inmobiliarios en Perú
        </p>
        <div className="flex items-center gap-3">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

const COLS = [
  {
    heading: 'Plataforma',
    links: [
      ['Cómo funciona', '#como-funciona'],
      ['Precios',        '#precios'],
      ['Registrarme',    '/register'],
    ],
  },
  {
    heading: 'Legal',
    links: [
      ['Privacidad', '/privacidad'],
      ['Términos',   '/terminos'],
    ],
  },
  {
    heading: 'Acceso',
    links: [
      ['Ingresar',      '/login'],
      ['Crear cuenta',  '/register'],
    ],
  },
]

export default function LandingFooter() {
  return (
    <footer className="w-full border-t border-white/6 bg-brand-navy-deep">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        <div className="space-y-5">
          <Logo variant="light" size="md" href="/" />
          <p className="text-sm leading-relaxed text-white/60">
            Infraestructura digital para transacciones notariales en Lima. Gratis para brokers.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold bg-brand-blue/8 border-white/15 text-white/60">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-brand-blue-light">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Igualador de Precio
          </div>
        </div>

        {COLS.map(col => (
          <div key={col.heading} className="space-y-5">
            <h4 className="font-black uppercase tracking-widest text-xs text-white/55">
              {col.heading}
            </h4>
            <div className="flex flex-col gap-3">
              {col.links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm transition-colors duration-200 text-white/60 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-8 border-t border-white/6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs font-medium text-white/55">
          © 2026 Tu Cierre · Plataforma notarial para brokers inmobiliarios en Perú
        </p>
      </div>
    </footer>
  )
}

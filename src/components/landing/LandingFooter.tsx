import Link from 'next/link'

const FOOTER_COLS = [
  { title: 'Producto', links: [{ label: 'Cómo funciona', href: '#como-funciona' }, { label: 'Comisiones', href: '#precios' }, { label: 'Crear cuenta', href: '/register' }] },
  { title: 'Soporte', links: [{ label: 'Contacto', href: 'mailto:soporte@tucierre.pe' }, { label: 'Iniciar sesión', href: '/login' }] },
  { title: 'Legal', links: [{ label: 'Términos de uso', href: '/terminos' }, { label: 'Privacidad', href: '/privacidad' }] },
]

export default function LandingFooter() {
  return (
    <footer className="bg-[#FFFEF5] pt-24 pb-12 relative overflow-hidden">
      {/* Top subtle border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#12161F]/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 inline-flex">
              <div className="w-8 h-8 rounded-[8px] bg-[#12161F] flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="#C9880E" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display font-semibold text-[20px] tracking-tight text-[#12161F]">TuCierre</span>
            </Link>
            
            <p className="text-[15px] font-medium leading-relaxed text-[#12161F]/60 mb-8 max-w-[240px]">
              Plataforma notarial digital para brokers inmobiliarios en Perú.
            </p>
            
            <div className="flex gap-4">
              {/* Socials */}
              <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-[#12161F]/10 text-[#12161F]/40 hover:text-[#12161F] hover:bg-[#12161F]/5 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-[#12161F]/10 text-[#12161F]/40 hover:text-[#12161F] hover:bg-[#12161F]/5 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Links cols */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <p className="text-[13px] font-bold tracking-widest uppercase mb-6 text-[#12161F]/40">
                {col.title}
              </p>
              <ul className="space-y-4">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-medium text-[#12161F]/70 hover:text-[#C9880E] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#12161F]/10">
          <p className="text-[14px] font-medium text-[#12161F]/50">
            © {new Date().getFullYear()} TuCierre · Lima, Perú
          </p>
          <p className="text-[14px] font-medium mt-4 sm:mt-0 text-[#12161F]/40 flex items-center gap-2">
            Hecho con <span className="text-red-400">♥</span> para brokers
          </p>
        </div>
      </div>
    </footer>
  )
}

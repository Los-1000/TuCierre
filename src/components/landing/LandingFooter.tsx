import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#D47151]">
      <div className="px-10 lg:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 bg-[#D47151] flex items-center justify-center text-white"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
            <span className="text-[11px] font-black">TC</span>
          </div>
          <span className="text-[22px] font-black text-white tracking-tight uppercase">TuCierre</span>
        </div>

        {/* Center */}
        <p className="text-[10px] font-light tracking-[0.25em] uppercase text-white/20">
          Lima, Perú · 2026
        </p>

        {/* Links */}
        <div className="flex items-center gap-8">
          {[
            ['Cómo funciona', '#como-funciona'],
            ['Precios', '#precios'],
            ['Ingresar', '/login'],
            ['Crear cuenta', '/register'],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-[10px] font-light tracking-[0.15em] uppercase text-white/25 hover:text-[#D47151] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-px bg-[#D47151]/15 mx-10 lg:mx-16" />
      <div className="px-10 lg:px-16 py-5">
        <p className="text-[9px] font-light tracking-[0.2em] uppercase text-white/15 text-center">
          © 2026 TuCierre · Plataforma notarial para brokers inmobiliarios en Perú
        </p>
      </div>
    </footer>
  )
}

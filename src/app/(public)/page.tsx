import Link from 'next/link'
import { ArrowRight, CheckCircle, Clock, FileText, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react'

export const metadata = {
  title: 'TuCierre | La plataforma notarial para Brokers Inmobiliarios',
  description: 'TuCierre conecta a los brokers con notarías de Lima. Registra tu trámite, sube los documentos y nosotros hacemos el resto.',
}

const FEATURES = [
  { icon: Zap, title: 'Cotización al instante', desc: 'Calcula honorarios notariales en segundos con nuestra calculadora de precios inteligente.' },
  { icon: Clock, title: 'Seguimiento en tiempo real', desc: 'Monitorea cada etapa de tu trámite con actualizaciones automáticas de estado.' },
  { icon: Shield, title: 'Seguridad garantizada', desc: 'Tus documentos y datos protegidos con cifrado de extremo a extremo.' },
  { icon: Users, title: 'Red de notarías', desc: 'Acceso a las mejores notarías de Lima para todos los tipos de trámite.' },
  { icon: FileText, title: 'Gestión documental', desc: 'Centraliza todos tus documentos y expedientes en un solo lugar.' },
  { icon: TrendingUp, title: 'Comisiones diferenciadas', desc: 'Descuentos progresivos según tu nivel: Bronce, Plata y Oro.' },
]

const TIERS = [
  {
    name: 'Bronce',
    subtitle: 'Para empezar',
    discount: '5%',
    requirement: '0–3 trámites/mes',
    color: '#b2832e',
    bg: '#fdf8ee',
    features: ['Cotización en línea', 'Seguimiento de trámites', 'Chat con notaría', 'Soporte por email'],
  },
  {
    name: 'Plata',
    subtitle: 'Para crecer',
    discount: '10%',
    requirement: '4–7 trámites/mes',
    color: '#4a6da8',
    bg: '#f4f6fb',
    features: ['Todo en Bronce', 'Descuento 10%', 'Prioridad en atención', 'Reportes mensuales'],
    highlighted: true,
  },
  {
    name: 'Oro',
    subtitle: 'Para liderar',
    discount: '15%',
    requirement: '8+ trámites/mes',
    color: '#b2832e',
    bg: '#fdf8ee',
    features: ['Todo en Plata', 'Descuento 15%', 'Ejecutivo dedicado', 'Acceso anticipado a nuevas funciones'],
  },
]

const STATS = [
  { value: '500+', label: 'Brokers activos' },
  { value: '2,400+', label: 'Trámites completados' },
  { value: '48h', label: 'Tiempo promedio' },
  { value: '98%', label: 'Satisfacción' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: '#f4f6fb', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-navy-100" style={{ borderColor: '#e1e7f3' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight" style={{ color: '#0f1d3d' }}>
            Tu<span style={{ color: '#2c4dfb' }}>Cierre</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#4a6da8' }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
              style={{ background: '#2c4dfb' }}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: '#eff2ff', color: '#2c4dfb' }}
            >
              <Star size={12} /> La plataforma notarial #1 para brokers en Lima
            </div>
            <h1
              className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
              style={{ color: '#0f1d3d', fontFamily: 'Inter, sans-serif' }}
            >
              Cierra más trámites,{' '}
              <span style={{ color: '#2c4dfb' }}>sin complicaciones</span>
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: '#4a6da8' }}>
              TuCierre conecta a los brokers inmobiliarios de Lima con notarías de confianza.
              Cotiza al instante, sube documentos y haz seguimiento en tiempo real.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: '#2c4dfb' }}
              >
                Empieza gratis <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                style={{ background: 'white', color: '#0f1d3d', border: '1px solid #e1e7f3' }}
              >
                Ver demo
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-2">
              {['Sin costo de registro', 'Descuentos por volumen', 'Soporte en Lima'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#4a6da8' }}>
                  <CheckCircle size={13} style={{ color: '#2c4dfb' }} /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: '#e1e7f3' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#97aed4' }}>Dashboard</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#0f1d3d' }}>Buenos días, María</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#fdf8ee', color: '#b2832e' }}>Nivel Plata</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Trámites activos', value: '7', color: '#2c4dfb', bg: '#eff2ff' },
                  { label: 'Completados / mes', value: '5', color: '#16a34a', bg: '#f0fdf4' },
                  { label: 'Monto gestionado', value: 'S/ 124K', color: '#2c4dfb', bg: '#eff2ff' },
                  { label: 'Ahorro acumulado', value: 'S/ 2,480', color: '#b2832e', bg: '#fdf8ee' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: '#f4f6fb' }}>
                    <p className="text-xs font-medium" style={{ color: '#97aed4' }}>{s.label}</p>
                    <p className="text-xl font-bold mt-1" style={{ color: '#0f1d3d' }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#97aed4' }}>Trámites recientes</p>
                {[
                  { type: 'Compraventa', address: 'Av. Larco 1234', status: 'En Firma', statusColor: '#059669', statusBg: '#ecfdf5' },
                  { type: 'Hipoteca', address: 'Calle Los Pinos 56', status: 'En Revisión', statusColor: '#c2410c', statusBg: '#fff7ed' },
                  { type: 'Donación', address: 'Jr. Cusco 890', status: 'Cotizado', statusColor: '#2c4dfb', statusBg: '#eff2ff' },
                ].map((t) => (
                  <div key={t.type} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#f4f6fb' }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#0f1d3d' }}>{t.type}</p>
                      <p className="text-xs" style={{ color: '#97aed4' }}>{t.address}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: t.statusBg, color: t.statusColor }}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y" style={{ borderColor: '#e1e7f3' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#0f1d3d' }}>{s.value}</p>
                <p className="text-sm mt-1" style={{ color: '#4a6da8' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: '#0f1d3d' }}>Todo lo que necesitas para cerrar trámites</h2>
          <p className="mt-3 text-base" style={{ color: '#4a6da8' }}>Una plataforma diseñada para que los brokers trabajen más rápido y con mayor confianza.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border p-6 space-y-3 transition-shadow hover:shadow-sm" style={{ borderColor: '#e1e7f3' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#eff2ff' }}>
                <Icon size={18} style={{ color: '#2c4dfb' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: '#0f1d3d' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4a6da8' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-white border-y" style={{ borderColor: '#e1e7f3' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#0f1d3d' }}>Descuentos según tu nivel</h2>
            <p className="mt-3 text-base" style={{ color: '#4a6da8' }}>Cuantos más trámites cierres, mayor es tu descuento en honorarios notariales.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl border p-6 space-y-5"
                style={{
                  borderColor: tier.highlighted ? '#2c4dfb' : '#e1e7f3',
                  background: tier.highlighted ? 'white' : 'white',
                  boxShadow: tier.highlighted ? '0 0 0 2px #2c4dfb' : undefined,
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</span>
                    {tier.highlighted && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#eff2ff', color: '#2c4dfb' }}>Popular</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#97aed4' }}>{tier.requirement}</p>
                </div>
                <div>
                  <span className="text-4xl font-bold" style={{ color: '#0f1d3d' }}>{tier.discount}</span>
                  <span className="text-sm ml-1" style={{ color: '#4a6da8' }}>de descuento</span>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#4a6da8' }}>
                      <CheckCircle size={13} style={{ color: '#2c4dfb' }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={tier.highlighted
                    ? { background: '#2c4dfb', color: 'white' }
                    : { background: '#f4f6fb', color: '#0f1d3d' }}
                >
                  Empezar ahora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div
          className="rounded-3xl p-10 lg:p-16 text-center space-y-6"
          style={{ background: '#0f1d3d' }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white">¿Listo para cerrar más trámites?</h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: '#97aed4' }}>
            Únete a los brokers inmobiliarios de Lima que ya confían en TuCierre para gestionar sus operaciones notariales.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: '#2c4dfb', color: 'white' }}
          >
            Crear cuenta gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: '#e1e7f3', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-base" style={{ color: '#0f1d3d' }}>
            Tu<span style={{ color: '#2c4dfb' }}>Cierre</span>
          </span>
          <p className="text-xs" style={{ color: '#97aed4' }}>© 2024 TuCierre. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-xs" style={{ color: '#4a6da8' }}>
            <Link href="#" className="hover:underline">Términos</Link>
            <Link href="#" className="hover:underline">Privacidad</Link>
            <Link href="#" className="hover:underline">Contacto</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

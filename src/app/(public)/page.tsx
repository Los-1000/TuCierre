// Server Component — no 'use client' needed
// Only the navbar has client-side scroll logic (see LandingNavbar.tsx)
// This gives full SSR + smaller JS bundle + better Core Web Vitals

import Link from 'next/link'
import { Shield, ArrowRight, Check, FileText, MessageSquare,
  TrendingDown, Users, Zap, Clock, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import LandingNavbar from '@/components/landing/LandingNavbar'

const STEPS = [
  {
    n: '01',
    title: 'Cotiza al instante',
    desc: 'Selecciona el tipo de trámite y obtén precio exacto en segundos. Sin llamadas, sin esperas.',
    icon: Zap,
  },
  {
    n: '02',
    title: 'Sube tus documentos',
    desc: 'La plataforma te indica exactamente qué necesitas. Tu cliente lo hace desde el celular.',
    icon: FileText,
  },
  {
    n: '03',
    title: 'Firma y cierra',
    desc: 'Coordina la firma, sigue el estado en tiempo real y recibe confirmación al finalizar.',
    icon: Check,
  },
]

const BENEFITS = [
  { icon: Clock, title: 'Sin WhatsApp caótico', desc: 'Todo en un solo lugar. Historial, documentos y mensajes organizados por trámite.' },
  { icon: TrendingDown, title: 'Price Match garantizado', desc: 'Encontraste precio más bajo en otra notaría. Lo igualamos o te explicamos por qué no.' },
  { icon: MessageSquare, title: 'Chat directo con notaría', desc: 'Mensajería integrada por trámite. Sin confundir conversaciones.' },
  { icon: Lock, title: 'Documentos seguros', desc: 'Almacenamiento cifrado. Tus clientes nunca envían documentos por correo inseguro.' },
  { icon: Users, title: 'Referidos y recompensas', desc: 'Invita colegas y gana bonos. Sube de tier y obtén hasta 10% de descuento.' },
  { icon: Zap, title: 'Tracking en tiempo real', desc: 'Estado actualizado al minuto. Tu cliente siempre sabe dónde está su trámite.' },
]

const TIERS = [
  {
    name: 'Bronce',
    emoji: '🥉',
    range: '0–3 trámites/mes',
    discount: null,
    color: '#B5540E',
    benefits: ['Precio estándar', 'Plataforma gratis', 'Tracking en vivo', 'Chat con notaría'],
  },
  {
    name: 'Plata',
    emoji: '🥈',
    range: '4–7 trámites/mes',
    discount: 5,
    color: '#8B9EC0',
    benefits: ['5% descuento', 'Todo de Bronce', 'Soporte prioritario', 'Price match'],
  },
  {
    name: 'Oro',
    emoji: '🥇',
    range: '8+ trámites/mes',
    discount: 10,
    color: '#C9880E',
    featured: true,
    benefits: ['10% descuento', 'Todo de Plata', 'Prioridad máxima', 'Ejecutivo dedicado'],
  },
]

const FOOTER_LINKS = [
  {
    title: 'Producto',
    links: [
      { label: 'Cómo funciona', href: '#como-funciona' },
      { label: 'Beneficios', href: '#beneficios' },
      { label: 'Precios', href: '#precios' },
      { label: 'Recompensas', href: '/register' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Contacto', href: 'mailto:soporte@tucierre.pe' },
      { label: 'Iniciar sesión', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos de uso', href: '/terminos' },
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Cookies', href: '/privacidad#cookies' },
    ],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09101C] text-[#EDE8DF] font-sans">

      {/* Navbar — client component for scroll reactivity */}
      <LandingNavbar />

      {/* ── HERO ── */}
      <section className="noise-overlay relative pt-32 pb-24 px-5 sm:px-8 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,136,14,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,136,14,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-brand-gold/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="anim-1 inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-3.5 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                <span className="text-xs text-brand-gold font-medium tracking-wide">Para brokers inmobiliarios · Perú</span>
              </div>

              <h1 className="anim-2 font-display text-5xl sm:text-6xl lg:text-[68px] font-light leading-[1.05] tracking-tight text-[#EDE8DF] mb-6">
                Cierra más,<br />
                <em className="text-gold-gradient not-italic font-semibold">trámites.</em>
                <br />No caos.
              </h1>

              <p className="anim-3 text-lg text-[#EDE8DF]/55 leading-relaxed mb-10 max-w-md">
                Gestiona compraventas, hipotecas y escrituras con tu notaría sin WhatsApp.
                Cotiza, sube documentos y firma — todo digital.
              </p>

              <div className="anim-4 flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-white font-medium px-6 py-3.5 rounded-lg transition-all hover:shadow-[0_0_24px_rgba(201,136,14,0.4)] text-sm"
                >
                  Crear cuenta gratis
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 bg-white/6 hover:bg-white/10 border border-white/10 text-[#EDE8DF] font-medium px-6 py-3.5 rounded-lg transition-colors text-sm"
                >
                  Ver cómo funciona
                </a>
              </div>

              {/* Stats */}
              <div className="anim-5 flex items-center gap-8">
                {[
                  { n: '2.4K+', label: 'Brokers activos' },
                  { n: 'S/. 0', label: 'Costo para brokers' },
                  { n: '7 días', label: 'Tiempo promedio' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="font-display text-2xl font-semibold text-[#EDE8DF]">{stat.n}</div>
                    <div className="text-xs text-[#EDE8DF]/40 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="anim-6 relative hidden lg:block">
              <div
                className="relative rounded-2xl bg-[#111827] border border-white/8 overflow-hidden shadow-2xl"
                style={{ animation: 'float 5s ease-in-out infinite' }}
              >
                {/* Mockup topbar */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-white/6">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="flex-1" />
                  <div className="text-xs text-white/30 font-mono">tucierre.pe/dashboard</div>
                </div>
                {/* Mockup content */}
                <div className="p-5 space-y-4">
                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Activos', val: '4', color: 'text-blue-400' },
                      { label: 'Completados', val: '12', color: 'text-emerald-400' },
                      { label: 'Ahorro', val: 'S/.320', color: 'text-brand-gold' },
                    ].map(k => (
                      <div key={k.label} className="bg-white/4 rounded-xl p-3 border border-white/5">
                        <div className={cn('font-display text-xl font-semibold', k.color)}>{k.val}</div>
                        <div className="text-[10px] text-white/35 mt-0.5">{k.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Tramite list */}
                  <div className="space-y-2">
                    {[
                      { code: 'TC-2025-00134', type: 'Compraventa', status: 'En firma', color: 'bg-sky-500/20 text-sky-400' },
                      { code: 'TC-2025-00121', type: 'Hipoteca', status: 'En revisión', color: 'bg-orange-500/20 text-orange-400' },
                      { code: 'TC-2025-00108', type: 'Poder Notarial', status: 'Completado', color: 'bg-emerald-500/20 text-emerald-400' },
                    ].map(t => (
                      <div key={t.code} className="flex items-center gap-3 bg-white/3 rounded-xl px-3.5 py-2.5 border border-white/5">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-mono text-white/40">{t.code}</div>
                          <div className="text-sm text-white/80 font-medium truncate">{t.type}</div>
                        </div>
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', t.color)}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Gold tier badge */}
                  <div className="flex items-center gap-3 bg-brand-gold/10 rounded-xl px-4 py-3 border border-brand-gold/20">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <div className="text-sm font-semibold text-brand-gold">Nivel Oro</div>
                      <div className="text-xs text-white/40">10% descuento activo · 8 trámites este mes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check size={16} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-800">Trámite completado</div>
                  <div className="text-[10px] text-gray-400">TC-2025-00098 · Compraventa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="py-24 px-5 sm:px-8 bg-[#0D1520]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-brand-gold/70 tracking-[0.2em] uppercase">Proceso</span>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-[#EDE8DF] mt-3">
              Tres pasos,<br /><em className="text-gold-gradient">sin complicaciones.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative group">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px bg-gradient-to-r from-brand-gold/30 to-transparent z-0" />
                )}
                <div className="relative bg-[#111827] border border-white/6 rounded-2xl p-7 group-hover:border-brand-gold/30 transition-colors">
                  <div className="flex items-start justify-between mb-5">
                    <span className="font-mono text-4xl font-medium text-brand-gold/20 leading-none">{step.n}</span>
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                      <step.icon size={18} className="text-brand-gold" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#EDE8DF] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#EDE8DF]/45 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="beneficios" className="py-24 px-5 sm:px-8 bg-[#09101C]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-mono text-brand-gold/70 tracking-[0.2em] uppercase">Beneficios</span>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-[#EDE8DF] mt-3">
                Todo lo que<br /><em className="text-gold-gradient">necesitas.</em>
              </h2>
            </div>
            <p className="text-[#EDE8DF]/45 text-sm max-w-xs leading-relaxed">
              Diseñado específicamente para el flujo de trabajo de brokers inmobiliarios en Perú.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white/3 hover:bg-white/5 border border-white/5 hover:border-brand-gold/20 rounded-2xl p-6 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center mb-4 group-hover:bg-brand-gold/15 transition-colors">
                  <b.icon size={18} className="text-brand-gold" />
                </div>
                <h3 className="font-semibold text-[#EDE8DF] mb-2 text-sm">{b.title}</h3>
                <p className="text-xs text-[#EDE8DF]/40 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIERS ── */}
      <section id="precios" className="py-24 px-5 sm:px-8 bg-[#0D1520]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-brand-gold/70 tracking-[0.2em] uppercase">Programa de niveles</span>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-[#EDE8DF] mt-3">
              Más trámites,<br /><em className="text-gold-gradient">más descuento.</em>
            </h2>
            <p className="text-[#EDE8DF]/45 text-sm mt-4 max-w-sm mx-auto">
              El programa es automático. Completas trámites y el sistema aplica tu descuento solo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-2xl p-7 border transition-all',
                  tier.featured
                    ? 'bg-gradient-to-b from-brand-gold/15 to-brand-gold/5 border-brand-gold/40 shadow-[0_0_40px_rgba(201,136,14,0.15)]'
                    : 'bg-white/3 border-white/8 hover:border-white/15'
                )}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-gold text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                      Más popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{tier.emoji}</span>
                  <div>
                    <div className="font-display text-lg font-semibold" style={{ color: tier.color }}>
                      {tier.name}
                    </div>
                    <div className="text-xs text-[#EDE8DF]/35 font-mono">{tier.range}</div>
                  </div>
                </div>

                <div className="mb-5">
                  {tier.discount ? (
                    <div>
                      <span className="font-display text-5xl font-semibold" style={{ color: tier.color }}>
                        {tier.discount}%
                      </span>
                      <span className="text-[#EDE8DF]/40 text-sm ml-1">descuento</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-display text-5xl font-semibold text-[#EDE8DF]/40">—</span>
                      <div className="text-xs text-[#EDE8DF]/35 mt-1">Precio estándar</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  {tier.benefits.map(b => (
                    <div key={b} className="flex items-center gap-2">
                      <Check size={13} style={{ color: tier.color }} className="shrink-0" />
                      <span className="text-sm text-[#EDE8DF]/60">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#EDE8DF]/25 mt-8">
            Los tiers se calculan automáticamente cada mes. Gratis para todos los brokers.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="noise-overlay relative py-28 px-5 sm:px-8 bg-brand-gold overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8A21A] to-[#A06A08]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-5xl sm:text-6xl font-semibold text-white mb-5 leading-tight">
            Empieza hoy,<br />es gratis.
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Únete a más de 2,400 brokers que ya gestionan sus trámites notariales con TuCierre.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-gold font-semibold px-8 py-4 rounded-xl hover:bg-[#FFF8F0] transition-colors text-sm shadow-xl"
            >
              Crear cuenta gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-8 py-4 rounded-xl transition-colors text-sm"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#050810] text-[#EDE8DF]/35 py-14 px-5 sm:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-brand-gold rounded-lg flex items-center justify-center">
                  <Shield size={13} className="text-white" />
                </div>
                <span className="font-display font-semibold text-lg text-[#EDE8DF]">TuCierre</span>
              </div>
              <p className="text-xs leading-relaxed">
                Plataforma digital de trámites notariales para brokers inmobiliarios en Perú.
              </p>
              <p className="text-xs text-[#EDE8DF]/20 mt-3">Powered by NotaryOS</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {FOOTER_LINKS.map(col => (
                <div key={col.title}>
                  <h4 className="text-[#EDE8DF]/60 text-xs font-semibold uppercase tracking-widest mb-4">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map(link => (
                      <li key={link.label}>
                        <a href={link.href} className="text-xs hover:text-[#EDE8DF] transition-colors">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span>© 2025 TuCierre. Todos los derechos reservados.</span>
            <span className="text-[#EDE8DF]/20">Lima, Perú 🇵🇪</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

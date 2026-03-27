'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import LandingNavbar from '@/components/landing/LandingNavbar'
import Reveal from '@/components/landing/Reveal'
import CountUp from '@/components/landing/CountUp'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRAMITE_TYPES = [
  'Compraventa de Inmueble', 'Hipoteca', 'Poder Notarial',
  'Anticipo de Legítima', 'Declaratoria de Herederos', 'Divorcio Notarial',
  'Constitución de Empresa', 'Testamento', 'Donación de Inmueble',
  'Rectificación de Área', 'Sucesión Intestada', 'Unión de Hecho',
  'Levantar Hipoteca', 'Transferencia Vehicular', 'Escritura Pública',
  'Reconocimiento de Paternidad',
]

const HOW_STEPS = [
  { n: '01', title: 'Registra a tu cliente', body: 'Ingresa el tipo de trámite, sube los documentos y listo. Menos de 3 minutos.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { n: '02', title: 'La notaría lo procesa', body: 'Nuestro equipo notarial recibe todo de forma automática y empieza el trámite.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { n: '03', title: 'Tú cobras la comisión', body: 'Al cierre, recibes tu comisión directamente. Sin perseguir a nadie.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

const PERSONAS = [
  {
    title: 'Broker independiente',
    desc: 'Gestiona tus clientes en un solo lugar. Sin Excel, sin WhatsApp, sin notas en papel.',
    bullets: ['Dashboard por cada trámite', 'Comisiones automáticas al cierre', 'Referidos que generan ingresos extra'],
  },
  {
    title: 'Equipos inmobiliarios',
    desc: 'Visibilidad total sobre cada trámite de tu equipo desde un solo panel.',
    bullets: ['Un panel para todo el equipo', 'Sin depender de reportes manuales', 'Coordinación con la notaría incluida'],
  },
  {
    title: 'Agencias y gerentes',
    desc: 'Escala sin perder el control. La plataforma crece contigo.',
    bullets: ['Supervisión en tiempo real', 'Hasta 8% de comisión mensual', 'Reportes automáticos mensuales'],
  },
]

const FEATURES = [
  {
    tag: 'Cotizaciones',
    title: 'Precio exacto.\nEn segundos.',
    desc: 'Sin llamar a la notaría. Sin esperar. Selecciona el trámite y el precio aparece al instante — listo para compartir con tu cliente.',
    bullets: ['16+ tipos de trámite', 'Precio siempre actualizado', 'Cotización compartible al instante'],
  },
  {
    tag: 'Seguimiento',
    title: 'Nunca más\n"¿Cuándo sale?"',
    desc: 'Estado en tiempo real para ti y tu cliente. Cada paso visible, notificaciones automáticas, historial completo del trámite.',
    bullets: ['Tracking paso a paso', 'Chat directo con la notaría', 'Notificaciones automáticas'],
  },
  {
    tag: 'Comisiones',
    title: 'Tu pago,\nsin perseguir.',
    desc: 'Al cerrar un trámite, la comisión se calcula y acredita automáticamente. Sin negociaciones, sin demoras, sin olvidos.',
    bullets: ['Hasta 8% por trámite cerrado', 'Acreditación automática', 'Historial completo de pagos'],
  },
]

const TIERS = [
  { name: 'Nivel 1', range: '1–3 trámites/mes', commission: '3%', featured: false, benefits: ['3% de comisión', 'Plataforma gratis', 'Tracking en vivo', 'Soporte por chat'] },
  { name: 'Nivel 2', range: '4–7 trámites/mes', commission: '5%', featured: true, benefits: ['5% de comisión', 'Price match garantizado', 'Soporte prioritario', 'Gestor asignado'] },
  { name: 'Nivel 3', range: '8+ trámites/mes', commission: '8%', featured: false, benefits: ['8% de comisión', 'Prioridad máxima', 'Atención dedicada', 'Ejecutivo asignado'] },
]

const TESTIMONIALS = [
  { quote: 'Antes perdía horas en WhatsApp. Ahora registro el cliente y sigo trabajando. La notaría se encarga del resto.', name: 'Carla M.', role: 'Broker · Miraflores' },
  { quote: 'Mis clientes ya no me preguntan "¿cuándo sale?". Ven el estado en tiempo real. Solo eso cambió mi relación con ellos.', name: 'Roberto Q.', role: 'Agente · San Isidro' },
  { quote: 'El mes pasado cerré 9 trámites y cobré S/. 720 en comisiones. No sabía que podía ganar así con la plataforma.', name: 'Andrea T.', role: 'Gerente de ventas · Surco' },
  { quote: 'Price match real. Me cotizaron menos en otra notaría y TuCierre igualó en 48 horas con todo documentado.', name: 'Miguel S.', role: 'Broker senior · La Molina' },
  { quote: 'Recomendé TuCierre a tres colegas. Cada uno ganó sus primeros trámites en la primera semana.', name: 'Patricia V.', role: 'Asesora · Barranco' },
  { quote: 'Centralicé los trámites de todo mi equipo en un panel. Supervisión sin depender de nadie.', name: 'Luis P.', role: 'Director · San Borja' },
]

const FOOTER_COLS = [
  { title: 'Producto', links: [{ label: 'Cómo funciona', href: '#como-funciona' }, { label: 'Comisiones', href: '#precios' }, { label: 'Crear cuenta', href: '/register' }] },
  { title: 'Soporte', links: [{ label: 'Contacto', href: 'mailto:soporte@tucierre.pe' }, { label: 'Iniciar sesión', href: '/login' }] },
  { title: 'Legal', links: [{ label: 'Términos de uso', href: '/terminos' }, { label: 'Privacidad', href: '/privacidad' }] },
]

// ─── Hero Demo ────────────────────────────────────────────────────────────────

function HeroDemo() {
  return (
    <div className="mt-16 max-w-3xl mx-auto grid sm:grid-cols-[1fr_44px_1fr] gap-4 items-stretch px-4">
      {/* Before */}
      <div className="rounded-2xl bg-[#1C1C1E] border border-white/8 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[11px] text-white/30 font-mono ml-2">WhatsApp · Trámite María</span>
        </div>
        <div className="p-4 space-y-2.5">
          {[
            { from: 'client', text: '¿Cuándo sale mi escritura? 😔' },
            { from: 'broker', text: 'Llamo a la notaría ahora...' },
            { from: 'notary', text: 'Mañana te confirmo 🤞' },
            { from: 'client', text: 'Ya van 3 semanas... 😤' },
            { from: 'broker', text: '📎 DNI_final_v3.pdf' },
          ].map((msg, i) => (
            <div key={i} className={cn('flex', msg.from === 'client' ? 'justify-end' : 'justify-start')} style={{ opacity: 1 - i * 0.12 }}>
              <div className={cn(
                'max-w-[78%] px-3 py-1.5 rounded-xl text-[11px] leading-relaxed',
                msg.from === 'client' ? 'bg-[#2A5E3A] text-white/70' : 'bg-white/8 text-white/50'
              )}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div className="text-[10px] text-white/20 text-center font-medium tracking-widest uppercase mt-1">Antes</div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-10 bg-[#12161F]/12" />
          <div className="w-7 h-7 rounded-full bg-[#C9880E]/10 border border-[#C9880E]/25 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#C9880E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-px h-10 bg-[#12161F]/12" />
        </div>
      </div>

      {/* After */}
      <div className="rounded-2xl bg-[#1C1C1E] border border-[#C9880E]/20 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#C9880E]/12 bg-[#C9880E]/5">
          <div className="w-2 h-2 rounded-full bg-[#C9880E] animate-pulse" />
          <span className="text-[11px] text-[#C9880E]/70 font-mono">TC-2025-00134 · Compraventa</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Estado', value: '● En firma', valueClass: 'text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-full text-[10px]' },
            { label: 'Documentos', value: '5 / 5 ✓', valueClass: 'text-emerald-400 text-xs font-medium' },
            { label: 'Entrega estimada', value: '2 días hábiles', valueClass: 'text-white/60 text-xs' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11px] text-white/35">{row.label}</span>
              <span className={row.valueClass}>{row.value}</span>
            </div>
          ))}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-white/25 mb-1">
              <span>Progreso</span>
              <span>80%</span>
            </div>
            <div className="h-1 bg-white/6 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-[#C9880E] to-[#E8A21A] rounded-full" />
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="text-[10px] text-[#C9880E]/60 text-center font-medium tracking-widest uppercase mt-1">TuCierre</div>
        </div>
      </div>
    </div>
  )
}

// ─── Feature Mockup ───────────────────────────────────────────────────────────

function FeatureMockup({ tag }: { tag: string }) {
  if (tag === 'Cotizaciones') return (
    <div className="bg-[#1C1C1E] rounded-2xl border border-white/8 p-5 space-y-3">
      <div className="text-[10px] text-white/20 font-mono mb-2">tucierre.pe/cotizar</div>
      <div className="space-y-2">
        {[
          { label: 'Tipo', value: 'Compraventa de inmueble' },
          { label: 'Precio base', value: 'S/. 1,200.00' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center bg-white/4 rounded-xl px-3 py-2.5 border border-white/5">
            <span className="text-[11px] text-white/30">{row.label}</span>
            <span className="text-xs font-medium text-white/75">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/6 pt-3 flex justify-between items-center">
        <span className="text-xs text-white/35">Total</span>
        <span className="font-display text-2xl font-bold text-[#C9880E]">S/. 1,200.00</span>
      </div>
      <div className="bg-[#C9880E]/8 border border-[#C9880E]/15 rounded-xl px-3 py-2.5 text-[11px] text-[#C9880E]/80">
        ⚡ Calculado al instante — sin llamadas
      </div>
    </div>
  )

  if (tag === 'Seguimiento') return (
    <div className="bg-[#1C1C1E] rounded-2xl border border-white/8 p-5 space-y-3">
      <div className="text-[10px] text-white/20 font-mono mb-2">TC-2025-00134 · Estado del trámite</div>
      {[
        { step: 'Solicitud recibida', done: true },
        { step: 'Documentos completos', done: true },
        { step: 'En firma notarial', done: true, active: true },
        { step: 'Inscripción registral', done: false },
        { step: 'Escritura entregada', done: false },
      ].map(row => (
        <div key={row.step} className="flex items-center gap-3">
          <div className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]',
            row.active ? 'bg-[#C9880E] text-white' : row.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/6 text-white/20'
          )}>
            {row.done ? '✓' : '·'}
          </div>
          <span className={cn('text-xs', row.active ? 'text-white font-medium' : row.done ? 'text-white/50' : 'text-white/20')}>
            {row.step}
          </span>
          {row.active && <span className="ml-auto text-[10px] bg-[#C9880E]/15 text-[#C9880E] px-2 py-0.5 rounded-full">En curso</span>}
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-[#1C1C1E] rounded-2xl border border-white/8 p-5 space-y-3">
      <div className="text-[10px] text-white/20 font-mono mb-2">Comisiones · Diciembre 2025</div>
      {[
        { label: 'Compraventa · Carlos R.', amount: 'S/. 96', status: 'paid' },
        { label: 'Hipoteca · Ana M.', amount: 'S/. 60', status: 'paid' },
        { label: 'Poder Notarial · Luis P.', amount: 'S/. 24', status: 'pending' },
      ].map(row => (
        <div key={row.label} className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
          <div>
            <div className="text-xs text-white/70">{row.label}</div>
            <div className={cn('text-[10px] mt-0.5', row.status === 'paid' ? 'text-emerald-400' : 'text-[#C9880E]/70')}>
              {row.status === 'paid' ? '● Acreditado' : '○ En proceso'}
            </div>
          </div>
          <span className="font-display text-lg font-semibold text-white/80">{row.amount}</span>
        </div>
      ))}
      <div className="border-t border-white/6 pt-3 flex justify-between">
        <span className="text-xs text-white/30">Total este mes</span>
        <span className="font-display text-xl font-bold text-[#C9880E]">S/. 720</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const marqueeItems = [...TRAMITE_TYPES, ...TRAMITE_TYPES]

  return (
    <div style={{ backgroundColor: '#FFFEF5', color: '#12161F' }} className="font-sans">
      <LandingNavbar />

      {/* ── Announcement bar ─────────────────────────────── */}
      <div className="w-full py-3 px-4 text-center bg-[#12161F] relative z-[60]">
        <p className="text-[13px] text-white/90 font-medium tracking-wide">
          Más de{' '}
          <span className="text-[#C9880E] font-semibold">1,000 trámites cerrados</span>
          {' '}por brokers peruanos en 2026
          <span className="ml-3 text-white/50">✦</span>
        </p>
      </div>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden" style={{ backgroundColor: '#FFFEF5' }}>
        {/* Decorative swirling text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <div className="animate-text-swirl opacity-[0.035] text-[14px] font-mono text-[#12161F] whitespace-nowrap" style={{ width: 600, height: 600 }}>
            <svg viewBox="0 0 600 600" className="w-full h-full">
              <defs>
                <path id="circle-text" d="M300,300 m-250,0 a250,250 0 1,1 500,0 a250,250 0 1,1 -500,0" />
              </defs>
              <text fontSize="13" fill="#12161F" opacity="0.5">
                <textPath href="#circle-text">
                  compraventa · hipoteca · poder notarial · escritura pública · anticipo · testamento · donación · transferencia · compraventa · hipoteca · poder notarial ·
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #12161F10 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-[#12161F]/15 rounded-full px-4 py-1.5 mb-8 bg-white/80 backdrop-blur-sm shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9880E]" />
              <span className="text-[13px] text-[#12161F]/80 font-medium tracking-wide">Plataforma notarial para brokers inmobiliarios</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            {/* Headline */}
            <h1 className="font-display font-semibold leading-[1.06] tracking-tight mb-6" style={{ fontSize: 'clamp(52px, 8vw, 88px)', color: '#12161F' }}>
              No persigas a nadie.
              <br />
              <span className="italic text-[#C9880E] font-medium">Solo cierra.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-[18px] font-medium leading-relaxed mb-10 max-w-xl mx-auto text-[#12161F]/70">
              TuCierre conecta a los brokers con notarías de Lima.
              Registra tu cliente, sube los documentos y nosotros hacemos el resto.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ backgroundColor: '#12161F', color: '#FFFEF5' }}
              >
                Empezar gratis
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium border transition-all duration-200 bg-white/50 hover:bg-white"
                style={{ borderColor: '#12161F30', color: '#12161F' }}
              >
                Ver cómo funciona
              </a>
            </div>
          </Reveal>

          {/* Social proof — avatars + counter */}
          <Reveal delay={400}>
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex items-center -space-x-2">
                {['C', 'R', 'A', 'M', 'P'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#FFFEF5] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: ['#2a5e3a','#C9880E','#12161F','#1B5E4B','#8B5E34'][i], zIndex: 5 - i }}
                  >
                    {initial}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#FFFEF5] bg-[#12161F] flex items-center justify-center text-[9px] font-bold text-[#FFFEF5]" style={{ zIndex: 0 }}>
                  +50
                </div>
              </div>
              <p className="text-[13px] font-medium tracking-wide text-[#12161F]/70">
                <span className="font-bold text-[#12161F]"><CountUp end={120} suffix="+" /></span> brokers activos · Gratis · Sin tarjeta
              </p>
            </div>
          </Reveal>
        </div>

        {/* Before/After demo */}
        <Reveal delay={500}>
          <HeroDemo />
        </Reveal>
      </section>

      {/* ── Tramite marquee — teal/green background like Wisprflow ── */}
      <section className="py-14 overflow-hidden" style={{ backgroundColor: '#1B5E4B' }}>
        <Reveal>
          <div className="mb-6 text-center">
            <p className="font-display text-[18px] italic text-white/60 tracking-wide">
              Todos los trámites. Una sola plataforma.
            </p>
          </div>
          <div className="relative">
            {/* Left/right gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to right, #1B5E4B, transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to left, #1B5E4B, transparent)' }} />
            <div className="flex gap-6 animate-marquee whitespace-nowrap">
              {marqueeItems.map((t, i) => (
                <div key={i} className="inline-flex items-center gap-2.5 shrink-0">
                  <span className="text-white/20 text-[10px]">✦</span>
                  <span className="text-[13px] text-white/50 font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="como-funciona" style={{ backgroundColor: '#FFFEF5' }} className="py-24 sm:py-32 relative">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="max-w-xl mb-16">
              <p className="text-[11px] text-[#C9880E] font-semibold tracking-widest uppercase mb-4">Cómo funciona</p>
              <h2 className="font-display font-semibold leading-tight mb-5" style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#12161F' }}>
                Tres pasos.<br /><span className="italic text-[#C9880E]">Sin complicaciones.</span>
              </h2>
              <p className="text-[16px] leading-relaxed text-[#12161F]/50">
                El proceso tradicional tarda 3 semanas en promedio. Con TuCierre, tus clientes tienen respuesta en 7 días.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-10">
            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div className="group relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#12161F]/5 flex items-center justify-center text-[#12161F] group-hover:bg-[#C9880E]/10 group-hover:text-[#C9880E] transition-colors duration-300">
                      {step.icon}
                    </div>
                    <div className="font-display text-[48px] font-semibold leading-none text-[#12161F]/[0.08] group-hover:text-[#C9880E]/20 transition-colors duration-500">
                      {step.n}
                    </div>
                  </div>
                  <h3 className="font-display text-[22px] font-semibold mb-3 text-[#12161F]">{step.title}</h3>
                  <p className="text-[15px] font-medium leading-relaxed text-[#12161F]/70">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3× más rápido ────────────────────────────────── */}
      <section style={{ backgroundColor: '#141414' }} className="py-24 sm:py-32 overflow-hidden border-t-2 border-[#12161F]/5">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Number */}
            <Reveal direction="left">
              <div>
                <div
                  className="font-display font-bold leading-none select-none"
                  style={{ fontSize: 'clamp(100px, 18vw, 220px)', color: '#FFFEF5', opacity: 0.04, lineHeight: 0.85 }}
                  aria-hidden
                >
                  3×
                </div>
                <div className="font-display font-bold leading-none mt-[-0.7em]" style={{ fontSize: 'clamp(80px, 14vw, 180px)', color: '#FFFEF5' }}>
                  <CountUp end={3} duration={1500} />×
                </div>
                <div className="flex gap-8 mt-8 pt-8 border-t border-white/8">
                  <div>
                    <div className="font-display text-3xl font-semibold text-white/25 line-through">3 sem.</div>
                    <div className="text-[11px] text-white/25 mt-1">Proceso tradicional</div>
                  </div>
                  <div>
                    <div className="font-display text-3xl font-semibold text-[#C9880E]">
                      <CountUp end={7} duration={1500} /> días
                    </div>
                    <div className="text-[11px] text-white/40 mt-1">Con TuCierre</div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Text */}
            <Reveal direction="right" delay={200}>
              <div>
                <p className="text-[11px] text-[#C9880E] font-semibold tracking-widest uppercase mb-5">Velocidad</p>
                <h2 className="font-display font-semibold leading-tight mb-6" style={{ fontSize: 'clamp(30px, 4vw, 44px)', color: '#FFFEF5' }}>
                  Cierra trámites <span className="italic text-[#C9880E]">3 veces más rápido</span> que el proceso tradicional.
                </h2>
                <p className="text-[15px] leading-relaxed mb-8 text-[#FFFEF5]/45">
                  El caos de WhatsApp, los documentos reenviados tres veces y las llamadas sin respuesta se terminaron.
                  TuCierre centraliza todo para que el trámite avance solo.
                </p>
                <ul className="space-y-3">
                  {['Sin llamadas a la notaría', 'Documentos en un solo lugar', 'Estado visible para todos'].map((item, i) => (
                    <li key={item} className="flex items-center gap-3 text-[14px] text-[#FFFEF5]/60" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="w-5 h-5 rounded-full bg-[#C9880E]/15 border border-[#C9880E]/25 flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#C9880E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Hecho para ti ────────────────────────────────── */}
      {/* Changed background from '#141414' to '#FFFEF5' (Cream) to break monotony */}
      <section id="beneficios" style={{ backgroundColor: '#FFFEF5' }} className="py-24 sm:py-32 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#12161F]/10 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="mb-16">
              <p className="text-[11px] text-[#C9880E] font-semibold tracking-widest uppercase mb-4">Para quién</p>
              <h2 className="font-display font-semibold leading-tight" style={{ fontSize: 'clamp(36px, 5vw, 52px)', color: '#12161F' }}>
                Hecho <span className="italic text-[#C9880E]">para ti.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div
                  className={cn(
                    'rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1',
                    i === 1
                      ? 'bg-[#C9880E] border-[#C9880E] shadow-[0_8px_32px_rgba(201,136,14,0.2)]'
                      : 'bg-white border-[#12161F]/10 hover:border-[#12161F]/20 shadow-sm'
                  )}
                >
                  <h3
                    className="font-display text-[22px] font-bold mb-3"
                    style={{ color: i === 1 ? '#FFFEF5' : '#12161F' }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-[14px] font-medium leading-relaxed mb-6"
                    style={{ color: i === 1 ? '#FFFEF5' : '#12161F', opacity: i === 1 ? 0.95 : 0.8 }}
                  >
                    {p.desc}
                  </p>
                  <ul className="space-y-2.5">
                    {p.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2.5 text-[13.5px] font-medium" style={{ color: i === 1 ? '#FFFEF5' : '#12161F', opacity: i === 1 ? 1 : 0.85 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                          <path d="M3 7l2.5 2.5L11 4" stroke={i === 1 ? '#FFFEF5' : '#C9880E'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ backgroundColor: '#141414' }} className="border-t border-white/5">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.tag}
            className={cn(
              'py-20 sm:py-28 border-b border-white/5',
              i % 2 !== 0 && 'border-y border-white/5'
            )}
            style={{ backgroundColor: i % 2 !== 0 ? '#111111' : '#141414' }}
          >
            <div className="max-w-5xl mx-auto px-6 sm:px-10">
              <div className={cn('grid md:grid-cols-2 gap-14 items-center', i % 2 !== 0 && 'md:[&>*:first-child]:order-2')}>
                {/* Text */}
                <Reveal direction={i % 2 !== 0 ? 'right' : 'left'}>
                  <div>
                    <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-[#C9880E] border border-[#C9880E]/25 rounded-full px-3 py-1 mb-6">
                      {feature.tag}
                    </span>
                    <h2 className="font-display font-semibold leading-tight mb-5 whitespace-pre-line" style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: '#FFFEF5' }}>
                      {feature.title}
                    </h2>
                    <p className="text-[15px] leading-relaxed mb-8 text-[#FFFEF5]/45">
                      {feature.desc}
                    </p>
                    <ul className="space-y-3">
                      {feature.bullets.map(b => (
                        <li key={b} className="flex items-center gap-3 text-[14px] text-[#FFFEF5]/55">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C9880E] shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
                {/* Mockup */}
                <Reveal direction={i % 2 !== 0 ? 'left' : 'right'} delay={200}>
                  <div className="relative group perspective-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#C9880E]/0 via-[#C9880E]/10 to-[#C9880E]/0 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                    <div className="relative shadow-[0_0_40px_rgba(201,136,14,0.05)] transition-transform duration-500 group-hover:scale-[1.02]">
                      <FeatureMockup tag={feature.tag} />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Comisiones / Tiers ───────────────────────────── */}
      <section id="precios" style={{ backgroundColor: '#FFFEF5' }} className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="max-w-xl mb-16">
              <p className="text-[11px] text-[#C9880E] font-bold tracking-widest uppercase mb-4">Comisiones</p>
              <h2 className="font-display font-semibold leading-tight mb-5" style={{ fontSize: 'clamp(36px, 5vw, 52px)', color: '#12161F' }}>
                Más clientes,<br /><span className="italic text-[#C9880E] font-medium">más comisión.</span>
              </h2>
              <p className="text-[17px] font-medium leading-relaxed text-[#12161F]/70">
                Tres niveles automáticos. Cuantos más trámites cierres, mayor es tu porcentaje. Sin burocracia.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 100}>
                <div
                  className={cn(
                    'rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1',
                    tier.featured
                      ? 'bg-[#12161F] border-[#C9880E]/40 shadow-[0_4px_40px_rgba(201,136,14,0.15)] relative overflow-hidden'
                      : 'bg-white border-[#12161F]/15 hover:border-[#12161F]/30'
                  )}
                >
                  {tier.featured && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9880E]/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  )}
                  <div className="mb-5 relative z-10">
                    <p className="text-[12.5px] font-bold tracking-widest uppercase mb-1" style={{ color: tier.featured ? '#C9880E' : '#12161F', opacity: tier.featured ? 1 : 0.6 }}>
                      {tier.name}
                    </p>
                    <div className="font-display font-bold flex items-baseline" style={{ fontSize: 64, lineHeight: 1, color: tier.featured ? '#FFFEF5' : '#12161F' }}>
                      <CountUp end={parseInt(tier.commission)} duration={1500} />%
                    </div>
                    <p className="text-[13.5px] font-medium mt-1" style={{ color: tier.featured ? '#FFFEF5' : '#12161F', opacity: tier.featured ? 0.7 : 0.6 }}>
                      comisión · {tier.range}
                    </p>
                  </div>
                  <ul className="space-y-2.5 mb-7 relative z-10">
                    {tier.benefits.map(b => (
                      <li key={b} className="flex items-start gap-2.5 text-[13.5px] font-medium" style={{ color: tier.featured ? '#FFFEF5' : '#12161F', opacity: tier.featured ? 0.8 : 0.7 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                          <path d="M3 7l2.5 2.5L11 4" stroke={tier.featured ? '#C9880E' : '#12161F'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={cn(
                      'block text-center rounded-full py-2.5 text-[13px] font-semibold transition-all duration-200 border relative z-10',
                      tier.featured
                        ? 'bg-[#C9880E] border-[#C9880E] text-white hover:bg-[#d99a16]'
                        : 'bg-transparent border-[#12161F]/15 text-[#12161F]/60 hover:border-[#12161F]/30 hover:bg-[#12161F]/5'
                    )}
                  >
                    Empezar gratis
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <p className="mt-8 text-center text-[12px] text-[#12161F]/30">
              El nivel sube automáticamente según tus trámites cerrados cada mes. Sin formularios, sin solicitudes.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonios ──────────────────────────────────── */}
      <section id="testimonios" style={{ backgroundColor: '#FFFEF5' }} className="py-24 sm:py-32 border-t border-[#12161F]/8">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="max-w-xl mb-16">
              <p className="text-[11px] text-[#C9880E] font-semibold tracking-widest uppercase mb-4">Testimonios</p>
              <h2 className="font-display font-semibold leading-tight" style={{ fontSize: 'clamp(36px, 5vw, 52px)', color: '#12161F' }}>
                Lo que dicen<br /><span className="italic text-[#C9880E]">los brokers.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-12 gap-5">
            {/* Featured testimonial (Andrea T.) occupies 2 columns */}
            <Reveal className="md:col-span-8" delay={100}>
              <div className="rounded-2xl p-8 border bg-[#12161F] border-[#12161F] hover:shadow-[0_8px_32px_rgba(201,136,14,0.15)] transition-all duration-300 h-full flex flex-col justify-center">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 12 12" fill="#C9880E">
                      <path d="M6 1l1.3 3.9H11L8 7.1l1.1 3.9L6 9l-3.1 2L4 7.1 1 4.9h3.7z"/>
                    </svg>
                  ))}
                </div>
                <blockquote className="font-display text-[22px] sm:text-[26px] italic leading-relaxed mb-8 text-[#FFFEF5]/90">
                  &ldquo;El mes pasado cerré 9 trámites y cobré S/. 720 en comisiones. No sabía que podía ganar así con la plataforma.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 bg-[#FFFEF5] text-[#12161F]">
                    AT
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#FFFEF5]">Andrea T.</p>
                    <p className="text-[13px] font-medium text-[#FFFEF5]/70">Gerente de ventas · Surco</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Other testimonials */}
            {TESTIMONIALS.filter(t => t.name !== 'Andrea T.').map((t, i) => (
              <Reveal key={i} className="md:col-span-4" delay={(i % 3) * 100}>
                <div
                  className="rounded-2xl p-6 border bg-white border-[#12161F]/15 hover:border-[#C9880E]/40 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col shadow-sm"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="#C9880E">
                        <path d="M6 1l1.3 3.9H11L8 7.1l1.1 3.9L6 9l-3.1 2L4 7.1 1 4.9h3.7z"/>
                      </svg>
                    ))}
                  </div>
                  <blockquote className="font-display text-[16px] italic leading-relaxed mb-5 text-[#12161F] flex-grow">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#12161F]/10 mt-auto">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 bg-[#F3F0E6] text-[#12161F]"
                    >
                      {t.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#12161F]">{t.name}</p>
                      <p className="text-[12px] font-medium text-[#12161F]/60">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1B5E4B' }} className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, #C9880E12 0%, transparent 60%), radial-gradient(circle at 70% 50%, #ffffff08 0%, transparent 60%)',
          }}
        />
        <Reveal>
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <p className="text-[11px] text-[#C9880E] font-bold tracking-widest uppercase mb-6">Empieza hoy</p>
            <h2 className="font-display font-semibold leading-tight mb-6" style={{ fontSize: 'clamp(40px, 6vw, 68px)', color: '#FFFEF5' }}>
              Empieza a cerrar más trámites <span className="italic text-[#C9880E]">hoy.</span>
            </h2>
            <p className="text-[17px] font-medium leading-relaxed mb-6 max-w-md mx-auto text-[#FFFEF5]/80">
              Gratis para brokers. Sin tarjeta de crédito. Listo en menos de 2 minutos.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#C9880E]/10 border border-[#C9880E]/20 text-[#C9880E] text-[13px] font-semibold px-4 py-1.5 rounded-full mb-10">
              <span className="w-2 h-2 rounded-full bg-[#C9880E] animate-pulse" /> Únete a los 120+ brokers que ya operan con nosotros
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[14px] font-semibold transition-all duration-200 bg-[#C9880E] text-white hover:bg-[#d99a16] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(201,136,14,0.3)]"
              >
                Crear cuenta gratis
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[14px] font-medium border transition-all duration-200 border-[#FFFEF5]/15 text-[#FFFEF5]/60 hover:border-[#FFFEF5]/30 hover:bg-[#FFFEF5]/5"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#FFFEF5', borderTop: '1px solid #12161F0a' }} className="py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-[#12161F] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="#C9880E" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-[18px] text-[#12161F]">TuCierre</span>
              </div>
              <p className="text-[14px] font-medium leading-relaxed max-w-[200px] text-[#12161F]/60 mb-6">
                Plataforma notarial digital para brokers inmobiliarios en Perú.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <a href="#" className="text-[#12161F]/40 hover:text-[#12161F] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="text-[#12161F]/40 hover:text-[#12161F] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Link cols */}
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <p className="text-[12px] font-bold tracking-widest uppercase mb-4 text-[#12161F]/50">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14px] font-medium text-[#12161F]/60 hover:text-[#12161F] transition-opacity duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#12161F]/15">
            <p className="text-[13px] font-medium text-[#12161F]/50">
              © {new Date().getFullYear()} TuCierre · Lima, Perú
            </p>
            <p className="text-[13px] font-medium mt-3 sm:mt-0 text-[#12161F]/40">
              Trámites notariales digitales para brokers
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}

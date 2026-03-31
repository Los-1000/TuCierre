'use client'

import Reveal from '@/components/landing/Reveal'

const TRAMITE_TYPES = [
  'Compraventa de Inmueble', 'Hipoteca', 'Poder Notarial',
  'Anticipo de Legítima', 'Declaratoria de Herederos', 'Divorcio Notarial',
  'Constitución de Empresa', 'Testamento', 'Donación de Inmueble',
  'Rectificación de Área', 'Sucesión Intestada', 'Unión de Hecho',
  'Levantar Hipoteca', 'Transferencia Vehicular', 'Escritura Pública',
  'Reconocimiento de Paternidad',
]

export default function MarqueeSection() {
  const marqueeItems = [...TRAMITE_TYPES, ...TRAMITE_TYPES]

  return (
    <section className="py-14 overflow-hidden bg-[#1B5E4B] relative border-y border-white/10">
      <div className="absolute inset-0 noise-overlay" />
      
      <Reveal className="relative z-10">
        <div className="mb-8 text-center px-4">
          <p className="font-display text-[22px] italic text-white/80 tracking-wide font-medium">
            Todos los trámites. Una sola plataforma.
          </p>
        </div>
        <div className="relative">
          {/* Left/right gradient masks for smooth fade */}
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #1B5E4B, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #1B5E4B, transparent)' }} />
          
          <div className="flex gap-8 animate-marquee whitespace-nowrap items-center hover:[animation-play-state:paused] cursor-default">
            {marqueeItems.map((t, i) => (
              <div key={i} className="inline-flex items-center gap-3 shrink-0">
                <span className="text-[#C9880E]/60 text-[10px]">✦</span>
                <span className="text-[14px] text-white/70 font-medium tracking-wide">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

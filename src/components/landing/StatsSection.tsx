import Reveal from '@/components/landing/Reveal'

export default function StatsSection() {
  return (
    <section className="py-32 bg-[#F5F7FF]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <Reveal direction="up" delay={0}>
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-10" style={{ color: 'rgba(2,9,82,0.5)' }}>
            Por qué TuCierre
          </p>
        </Reveal>

        <div className="space-y-6 max-w-4xl">
          <Reveal direction="up" delay={100}>
            <h2
              className="leading-none tracking-tight text-brand-navy"
              style={{ fontSize: 'clamp(36px, 5.5vw, 80px)' }}
            >
              <span className="font-black">Trámites notariales gestionados </span>
              <span className="font-extralight font-display italic">de inicio a firma</span>
              <span className="font-black"> — sin llamadas, sin papel, sin sorpresas.</span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <p className="text-xl font-light" style={{ color: 'rgba(2,9,82,0.65)' }}>
              Tú subes los documentos desde cualquier lugar.{' '}
              <strong className="font-semibold text-brand-navy">Nosotros coordinamos con la notaría</strong>{' '}
              y te avisamos cuando es hora de aparecer a firmar.
            </p>
          </Reveal>
        </div>

      </div>
    </section>
  )
}

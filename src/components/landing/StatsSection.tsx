export default function StatsSection() {
  return (
    <section className="py-24" style={{ background: '#1A2580' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <p className="text-xs font-black uppercase tracking-[0.2em] mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Por qué TuCierre
        </p>

        <div className="space-y-6 max-w-4xl">
          <h2
            className="leading-none tracking-tight"
            style={{ fontSize: 'clamp(36px, 5.5vw, 80px)', color: '#fff' }}
          >
            <span className="font-black">Trámites notariales gestionados </span>
            <span className="font-extralight font-display italic">de inicio a firma</span>
            <span className="font-black"> — sin llamadas, sin papel, sin sorpresas.</span>
          </h2>

          <p className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Tú subes los documentos desde cualquier lugar.{' '}
            <strong className="font-semibold text-white">Nosotros coordinamos con la notaría</strong>{' '}
            y te avisamos cuando es hora de aparecer a firmar.
          </p>
        </div>

      </div>
    </section>
  )
}

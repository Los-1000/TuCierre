const CHAPTERS = [
  {
    chapter: 'Capítulo I',
    tag: 'Cotizaciones',
    title: ['Precio', 'exacto.'],
    body: 'Sin llamar a la notaría. Selecciona el trámite y el precio aparece al instante — listo para compartir con tu cliente.',
    dark: false,
  },
  {
    chapter: 'Capítulo II',
    tag: 'Seguimiento',
    title: ['Nunca más', '"¿Cuándo sale?"'],
    body: 'Estado en tiempo real para ti y tu cliente. Cada paso visible, notificaciones automáticas, historial completo.',
    dark: true,
    accentFirst: true,
  },
  {
    chapter: 'Capítulo III',
    tag: 'Comisiones',
    title: ['Tu pago,', 'sin perseguir.'],
    body: 'Al cerrar un trámite, la comisión se calcula y acredita automáticamente. Sin negociaciones, sin demoras.',
    dark: false,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="flex flex-col md:flex-row min-h-screen">
      {CHAPTERS.map((c, i) => (
        <div
          key={c.tag}
          className={`flex-1 p-14 lg:p-16 flex flex-col justify-between min-h-[60vh] md:min-h-screen ${
            c.dark ? 'bg-[#0A0A0A] border-x border-white/5' : 'bg-[#F5F0E8]'
          }`}
        >
          <div>
            <span
              className={`block text-[9px] font-black uppercase tracking-[0.3em] mb-10 ${
                c.dark ? 'text-white/25' : 'text-black/25'
              }`}
            >
              {c.chapter}
            </span>

            <h2 className="leading-tight">
              <span
                className="block font-black uppercase tracking-tighter"
                style={{
                  fontSize: 'clamp(40px, 5vw, 60px)',
                  color: c.accentFirst ? '#D47151' : c.dark ? '#F5F0E8' : '#0A0A0A',
                }}
              >
                {c.title[0]}
              </span>
              <span
                className="block font-extralight italic tracking-tighter"
                style={{
                  fontSize: 'clamp(40px, 5vw, 60px)',
                  color: c.dark ? 'rgba(245,240,232,0.45)' : 'rgba(10,10,10,0.45)',
                }}
              >
                {c.title[1]}
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            <div
              className={`text-[10px] font-black uppercase tracking-[0.2em] text-[#D47151]`}
            >
              {c.tag}
            </div>
            <p
              className={`font-light text-[15px] leading-relaxed max-w-[260px] ${
                c.dark ? 'text-white/50' : 'text-black/55'
              }`}
            >
              {c.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}

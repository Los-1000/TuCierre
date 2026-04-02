const CARDS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d06d0d" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Gana confianza con Precios Transparentes',
    body: "Protege la inversión de tu cliente. Nuestro sistema Price Match garantiza la tarifa notarial más competitiva del mercado, eliminando sorpresas.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#d06d0d" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="#d06d0d" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Proyecta eficiencia con Cierres Acelerados',
    body: 'Reduce los tiempos de espera hasta en un 40%. Con Tu Cierre, la gestión documental fluye a través de nuestra red exclusiva de notarías digitales.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 6l9-3 9 3v6c0 5-4 8-9 9-5-1-9-4-9-9V6z" stroke="#d06d0d" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Respaldo Total con Seguridad Jurídica',
    body: 'Evita riesgos legales. Cada trámite es supervisado por expertos bajo los estándares institucionales más rigurosos de Lima.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-[#fbf8fc]">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: '#00081e' }}>
            Tu cliente, nuestra prioridad
          </h2>
          <div className="h-1.5 w-24 rounded-full" style={{ background: '#d06d0d' }} />
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="p-10 rounded-2xl space-y-6 hover:shadow-2xl transition-all border-b-4 border-transparent hover:border-[#d06d0d] group cursor-default"
              style={{ background: '#f5f3f7' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: '#0a1f44' }}
              >
                {card.icon}
              </div>
              <h3 className="text-2xl font-extrabold leading-tight" style={{ color: '#00081e' }}>
                {card.title}
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: '#44464e' }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

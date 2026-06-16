import Link from 'next/link'
import Reveal from '@/components/landing/Reveal'

const POINTS = [
  {
    pct: '5%',
    title: 'de cashback por cada trámite',
    body: 'Cierras un trámite, recibes el 5% de vuelta. Igual para todos, desde el primero.',
    color: 'var(--brand-blue)',
  },
  {
    pct: '1%',
    title: 'por los trámites de tus referidos',
    body: 'Cada broker que invitas suma. Ganas 1% de cada trámite que ellos cierran.',
    color: 'var(--brand-success)',
  },
]

export default function PricingSection() {
  return (
    <section
      id="precios"
      className="py-24 md:py-32 bg-brand-navy border-t border-white/6"
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <Reveal direction="up" delay={0}>
          <div className="mb-14 md:mb-20">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/45">Cashback</p>
            <h2 className="font-black text-display-xl tracking-tighter text-white mb-4">
              Un solo trato.
            </h2>
            <p className="font-light text-lg max-w-md text-white/65">
              Sin niveles, sin mínimos, sin letra chica. Tu cashback se acumula solo y se paga a fin de mes.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.pct} direction="up" delay={150 + i * 100}>
              <div
                className="rounded-2xl p-8 md:p-12 h-full flex flex-col justify-between gap-8 border"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
              >
                <span
                  className="font-black tracking-tighter leading-none tabular-nums"
                  style={{ fontSize: 'clamp(72px, 11vw, 132px)', color: p.color }}
                >
                  {p.pct}
                </span>
                <div>
                  <h3 className="font-black text-xl md:text-2xl tracking-tight text-white mb-2">
                    {p.title}
                  </h3>
                  <p className="font-light text-base leading-relaxed text-white/55">
                    {p.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal direction="up" delay={350}>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl p-8 md:p-10" style={{ background: '#ffffff' }}>
            <div>
              <p className="font-black text-xl md:text-2xl tracking-tight text-brand-navy">
                Gratis para brokers. Para siempre.
              </p>
              <p className="text-sm font-light mt-1 text-brand-navy/60">
                Usar TuCierre no cuesta nada. Solo ganas.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-block text-center rounded-full px-8 py-3.5 text-sm font-black tracking-wide text-white hover:opacity-90 active:scale-95 transition-all bg-brand-navy shrink-0"
            >
              Empezar gratis
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  )
}

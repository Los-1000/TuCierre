const STEPS = [
  {
    n: '01',
    title: 'Registra a tu cliente',
    body: 'Sube el trámite y los documentos. Menos de 3 minutos.',
    indent: '',
  },
  {
    n: '02',
    title: 'La notaría lo procesa',
    body: 'Automático. Sin llamadas. Sin seguimiento manual.',
    indent: 'md:ml-32',
  },
  {
    n: '03',
    title: 'Tú cobras la comisión',
    body: 'Directo. Sin perseguir a nadie.',
    indent: 'md:ml-64',
    accentTitle: true,
  },
]

export default function StepsSection() {
  return (
    <section id="como-funciona" className="bg-[#0A0A0A] px-10 lg:px-16 py-32 lg:py-40">
      {/* Eyebrow */}
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-20">
        / Cómo Funciona /
      </p>

      <div className="flex flex-col gap-10 lg:gap-12">
        {STEPS.map((step) => (
          <div key={step.n} className={`flex items-start gap-10 group ${step.indent}`}>
            {/* Ghost number */}
            <span
              className="text-[96px] lg:text-[120px] font-black leading-none text-white/[0.04] group-hover:text-[#D47151]/30 transition-colors duration-500 select-none shrink-0 tabular-nums"
            >
              {step.n}
            </span>

            {/* Content card */}
            <div className="bg-[#131313] p-10 lg:p-12 flex-1 max-w-2xl mt-6">
              <h3
                className="font-black text-[22px] uppercase tracking-tight mb-3"
                style={{ color: step.accentTitle ? '#D47151' : '#F5F0E8' }}
              >
                {step.title}
              </h3>
              <p className="text-white/50 font-extralight text-[16px] leading-relaxed max-w-md">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

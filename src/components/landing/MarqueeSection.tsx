const TICKER_A = 'TRÁMITE CERRADO  ✦  S/. 1,200  ✦  COMPRAVENTA  ✦  LIMA, PERÚ  ✦  TC‑2026  ✦  '
const TICKER_B = 'HIPOTECA  ◆  PODER NOTARIAL  ◆  SUCESIÓN  ◆  DONACIÓN  ◆  ESCRITURA PÚBLICA  ◆  '

export default function MarqueeSection() {
  return (
    <section aria-hidden="true" className="border-y border-white/5 overflow-hidden" style={{ background: 'var(--brand-navy)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Row 1: left → right, orange */}
      <div className="py-3 border-b border-white/5">
        <div className="flex whitespace-nowrap animate-ticker">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="shrink-0 text-[11px] font-black uppercase tracking-[0.18em] text-tier-bronce">
              {TICKER_A}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2: right → left, white/20 */}
      <div className="py-3">
        <div className="flex whitespace-nowrap animate-ticker-reverse">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="shrink-0 text-[11px] font-extralight uppercase tracking-[0.18em] italic text-white/20">
              {TICKER_B}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="bg-[#0A0A0A] px-10 lg:px-16 py-40 lg:py-56 text-center">
      <h2 className="mb-14">
        <span
          className="block font-black uppercase tracking-[-0.04em] text-[#F5F0E8] leading-none"
          style={{ fontSize: 'clamp(52px, 8vw, 96px)' }}
        >
          ¿Listo para
        </span>
        <span
          className="block font-extralight italic tracking-[-0.03em] text-[#D47151] leading-none"
          style={{ fontSize: 'clamp(52px, 8vw, 96px)' }}
        >
          cerrar?
        </span>
      </h2>

      <Link
        href="/register"
        className="inline-flex items-center gap-2 bg-[#D47151] text-white rounded-full px-12 py-5 text-[14px] font-black uppercase tracking-widest hover:bg-[#A6553A] hover:scale-105 active:scale-95 transition-all duration-300"
      >
        Empezar gratis →
      </Link>

      <p className="mt-6 text-[11px] font-light text-white/20 tracking-widest uppercase">
        Gratis · Sin tarjeta · Lima, Perú
      </p>
    </section>
  )
}

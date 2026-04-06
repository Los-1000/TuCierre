const CHECKS = [
  'Cotizaciones instantáneas',
  'Cero costos adicionales',
  'Cobertura en todo Lima Metropolitana',
]

const TABLE_ROWS = [
  { tramite: 'Transferencia de Inmueble', mercado: 'S/ 1,200', tucierre: 'S/ 850' },
  { tramite: 'Hipoteca (Escritura)',       mercado: 'S/ 1,500', tucierre: 'S/ 1,100' },
  { tramite: 'Poder Registral',            mercado: 'S/ 150',   tucierre: 'S/ 90' },
]

export default function PriceMatchSection() {
  return (
    <section id="pricematch" className="py-32" style={{ background: '#f5f3f7' }}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-20 items-center">

        {/* Left — copy */}
        <div className="space-y-8">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
              style={{ background: '#0a1f4420', border: '1px solid #0a1f4440' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d06d0d" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#0a1f44' }}>
                Garantía Price Match
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight" style={{ color: '#00081e' }}>
              Si encuentras un precio menor,{' '}
              <br />
              <span style={{ color: '#d06d0d' }}>lo igualamos</span>
            </h2>
          </div>

          <p className="text-xl leading-relaxed" style={{ color: '#44464e' }}>
            Si tu cliente recibe una cotización más baja de otra notaría en Lima,
            nosotros la igualamos. <strong style={{ color: '#00081e' }}>Mismo proceso, misma calidad</strong>{' '}
            — sin pagar un sol más.
          </p>

          <ul className="space-y-4">
            {CHECKS.map(item => (
              <li key={item} className="flex items-center gap-4 font-bold text-lg" style={{ color: '#00081e' }}>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#d06d0d15' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#d06d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
            style={{ background: '#e9e7eb', color: '#44464e' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#44464e" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#44464e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Disponible desde Nivel 2 · Se solicita vía plataforma · Sin papeleo
          </div>
        </div>

        {/* Right — comparison table */}
        <div
          className="rounded-3xl shadow-2xl overflow-hidden border"
          style={{ background: '#ffffff', borderColor: '#c5c6cf30' }}
        >
          <div
            className="px-8 py-6 flex justify-between items-center border-b border-white/10"
            style={{ background: '#0a1f44' }}
          >
            <span className="text-white text-xl font-black tracking-tight">Tarifas 2026</span>
            <span
              className="text-xs text-white px-3 py-1.5 rounded-full font-black uppercase tracking-widest"
              style={{ background: '#d06d0d' }}
            >
              Verificado
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead className="border-b" style={{ background: '#f5f3f7', borderColor: '#c5c6cf30' }}>
                <tr>
                  <th className="p-6 font-bold" style={{ color: '#00081e' }}>Trámite</th>
                  <th className="p-6 font-bold" style={{ color: '#00081e' }}>Mercado Lima</th>
                  <th className="p-6 font-bold" style={{ color: '#d06d0d' }}>Red Tu Cierre</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: '#c5c6cf20' }}>
                    <td className="p-6 font-semibold" style={{ color: '#1b1b1e' }}>{row.tramite}</td>
                    <td className="p-6" style={{ color: '#44464e' }}>{row.mercado}</td>
                    <td className="p-6 font-black" style={{ color: '#00081e' }}>{row.tucierre}</td>
                  </tr>
                ))}
                <tr style={{ background: '#0a1f44' }}>
                  <td className="p-6 font-black text-right" colSpan={2} style={{ color: '#ffffff', opacity: 0.7 }}>
                    Ahorro Promedio Directo
                  </td>
                  <td className="p-6 font-black text-2xl tracking-tighter" style={{ color: '#d06d0d' }}>
                    28% Menos
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  )
}

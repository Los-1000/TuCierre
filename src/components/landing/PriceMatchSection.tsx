const CHECKS = [
  'Cotizaciones instantáneas',
  'Cero costos adicionales',
  'Cobertura en todo Lima Metropolitana',
]

const TABLE_ROWS = [
  { tramite: 'Transferencia de Inmueble', mercado: 'S/ 1,200', tucierre: 'S/ 850'   },
  { tramite: 'Hipoteca (Escritura)',       mercado: 'S/ 1,500', tucierre: 'S/ 1,100' },
  { tramite: 'Poder Registral',            mercado: 'S/ 150',   tucierre: 'S/ 90'    },
]

export default function PriceMatchSection() {
  return (
    <section id="pricematch" className="py-32" style={{ background: '#F8FAFF' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-20 items-center">

        <div className="space-y-8">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
              style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.28)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1E3A8A' }}>
                Igualador de Precio
              </span>
            </div>
            <h2
              className="tracking-tight leading-tight"
              style={{ color: '#0F172A', fontSize: 'clamp(32px, 4.5vw, 62px)' }}
            >
              <span className="font-extralight">Si encuentras un precio menor, </span>
              <span className="font-black font-display italic" style={{ color: '#2563EB' }}>lo igualamos</span>
            </h2>
          </div>

          <p className="text-xl leading-relaxed" style={{ color: '#475569' }}>
            ¿Tu cliente encontró un precio más bajo en otra notaría?{' '}
            <strong style={{ color: '#0F172A', fontWeight: 600 }}>Preséntanoslo y lo igualamos.</strong>{' '}
            Misma calidad, mismos plazos — sin pagar un sol más.
          </p>

          <ul className="space-y-4">
            {CHECKS.map(item => (
              <li key={item} className="flex items-center gap-4 font-semibold text-lg" style={{ color: '#0F172A' }}>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(28,122,82,0.1)', border: '1px solid rgba(28,122,82,0.2)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#1C7A52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
            style={{ background: '#EEF2FF', color: '#475569' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#475569" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Disponible desde Nivel 2 · Se solicita vía plataforma · Sin papeleo
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: '#DBEAFE' }}>
          <div className="px-8 py-6 flex justify-between items-center" style={{ background: '#0F172A' }}>
            <span className="text-white text-xl font-black tracking-tight">Tarifas 2026</span>
            <span
              className="text-xs text-white px-3 py-1.5 rounded-full font-black uppercase tracking-widest"
              style={{ background: '#2563EB' }}
            >
              Verificado
            </span>
          </div>

          <div className="overflow-x-auto" style={{ background: '#fff' }}>
            <table className="w-full text-left">
              <thead className="border-b" style={{ background: '#F8FAFF', borderColor: '#DBEAFE' }}>
                <tr>
                  <th scope="col" className="p-6 text-sm font-bold" style={{ color: '#0F172A' }}>Trámite</th>
                  <th scope="col" className="p-6 text-sm font-bold" style={{ color: '#0F172A' }}>Precio Mercado</th>
                  <th scope="col" className="p-6 text-sm font-bold" style={{ color: '#2563EB' }}>Igualamos</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-[#F8FAFF] transition-colors" style={{ borderColor: '#EEF2FF' }}>
                    <td className="p-6 font-medium text-sm" style={{ color: '#0F172A' }}>{row.tramite}</td>
                    <td className="p-6 text-sm line-through" style={{ color: '#94A3B8' }}>{row.mercado}</td>
                    <td className="p-6 font-black text-sm" style={{ color: '#0F172A' }}>{row.tucierre}</td>
                  </tr>
                ))}
                <tr style={{ background: '#0F172A' }}>
                  <td className="p-6 font-bold text-sm text-white/50" colSpan={2}>
                    Ahorro Promedio Directo
                  </td>
                  <td className="p-6 font-black text-2xl tracking-tighter" style={{ color: '#2563EB' }}>
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

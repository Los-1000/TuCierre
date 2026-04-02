import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold text-[#18181B] text-lg tracking-tight">TuCierre</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← Volver al inicio</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
        <p className="text-slate-500 text-sm mb-10">Última actualización: marzo 2025</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 text-slate-700 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">1. Responsable del tratamiento</h2>
            <p>
              TuCierre (en adelante, "nosotros") es responsable del tratamiento de tus datos personales recopilados a través de esta plataforma, de conformidad con la Ley N.º 29733, Ley de Protección de Datos Personales del Perú.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">2. Datos que recopilamos</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Nombre completo y DNI</li>
              <li>Correo electrónico y teléfono</li>
              <li>Información de la empresa o inmobiliaria</li>
              <li>Datos de los trámites notariales gestionados</li>
              <li>Información de las partes involucradas en cada trámite</li>
              <li>Datos de uso de la plataforma (logs, navegación)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">3. Finalidad del tratamiento</h2>
            <p>Usamos tus datos para:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Gestionar tu cuenta y autenticación</li>
              <li>Procesar y dar seguimiento a tus trámites notariales</li>
              <li>Calcular descuentos por volumen y administrar el programa de tiers</li>
              <li>Gestionar el programa de referidos</li>
              <li>Enviarte notificaciones sobre el estado de tus trámites</li>
              <li>Mejorar la plataforma y el servicio</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">4. Compartición de datos</h2>
            <p>
              Compartimos tus datos únicamente con las notarías participantes en la medida necesaria para procesar tus trámites. No vendemos ni cedemos tus datos a terceros con fines comerciales.
            </p>
            <p>
              Utilizamos servicios de infraestructura de terceros (Supabase, Vercel) que cuentan con sus propias políticas de privacidad y medidas de seguridad.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">5. Conservación de datos</h2>
            <p>
              Conservamos tus datos mientras mantengas una cuenta activa en TuCierre y durante el plazo legal exigible por la normativa peruana aplicable a los documentos notariales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">6. Tus derechos</h2>
            <p>Conforme a la Ley N.º 29733, tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Acceso:</strong> solicitar información sobre los datos que tenemos de ti</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
              <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos</li>
            </ul>
            <p>Para ejercer estos derechos escríbenos a <a href="mailto:privacidad@tucierre.pe" className="text-[#D47151] hover:underline">privacidad@tucierre.pe</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">7. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (HTTPS), autenticación segura, y control de acceso basado en roles. Sin embargo, ningún sistema es 100% infalible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">8. Cookies</h2>
            <p>
              Usamos cookies estrictamente necesarias para mantener tu sesión activa. No usamos cookies de seguimiento o publicidad de terceros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">9. Contacto</h2>
            <p>
              Para consultas sobre privacidad escríbenos a <a href="mailto:privacidad@tucierre.pe" className="text-[#D47151] hover:underline">privacidad@tucierre.pe</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-brand-navy text-lg">TuCierre</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← Volver al inicio</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Términos de Uso</h1>
        <p className="text-slate-500 text-sm mb-10">Última actualización: marzo 2025</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 text-slate-700 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">1. Aceptación de los términos</h2>
            <p>
              Al registrarte y utilizar TuCierre, aceptas estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">2. Descripción del servicio</h2>
            <p>
              TuCierre es una plataforma digital que facilita la gestión y coordinación de trámites notariales entre brokers inmobiliarios y notarías en el Perú. El servicio es gratuito para los brokers registrados.
            </p>
            <p>
              TuCierre actúa como intermediario tecnológico y no es una notaría ni presta servicios notariales directamente. Los servicios notariales son prestados por notarías debidamente habilitadas conforme a la ley peruana.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">3. Registro de cuenta</h2>
            <p>
              Para usar la plataforma debes registrarte con información verídica. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">4. Programa de referidos</h2>
            <p>
              TuCierre ofrece un programa de referidos mediante el cual los usuarios pueden obtener beneficios al invitar a otros brokers a registrarse en la plataforma. Los bonos de referido se aplican según las condiciones vigentes publicadas en la plataforma y pueden modificarse sin previo aviso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">5. Sistema de tiers y descuentos</h2>
            <p>
              Los descuentos por volumen (tiers Plata y Oro) se calculan automáticamente según el número de trámites completados en el mes calendario. TuCierre se reserva el derecho de modificar los umbrales y porcentajes del programa de tiers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">6. Price Match</h2>
            <p>
              La política de igualación de precios está sujeta a verificación de la evidencia presentada. TuCierre se reserva el derecho de aprobar o rechazar solicitudes de price match según criterios internos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">7. Limitación de responsabilidad</h2>
            <p>
              TuCierre no se hace responsable por errores, demoras o incumplimientos atribuibles a las notarías, a los usuarios, o a terceros. La plataforma se provee "tal cual" y podría estar sujeta a interrupciones temporales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">8. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados con al menos 7 días de anticipación a través de la plataforma. El uso continuado del servicio después de los cambios implica su aceptación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">9. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a los tribunales competentes de la ciudad de Lima.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">10. Contacto</h2>
            <p>
              Para consultas sobre estos términos, escríbenos a <a href="mailto:soporte@tucierre.pe" className="text-brand-navy hover:underline">soporte@tucierre.pe</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'TuCierre – Trámites Notariales para Brokers',
  description: 'Gestiona tus trámites notariales de forma digital. Gratis para brokers inmobiliarios en Perú.',
  keywords: ['notaria', 'broker', 'inmobiliaria', 'peru', 'tramites', 'compraventa'],
  openGraph: {
    title: 'TuCierre',
    description: 'Trámites notariales digitales para brokers',
    locale: 'es_PE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'rounded-lg border shadow-lg font-inter text-sm',
              success: 'bg-white text-navy-900 border-green-200',
              error: 'bg-white text-navy-900 border-red-200',
            },
          }}
        />
      </body>
    </html>
  )
}

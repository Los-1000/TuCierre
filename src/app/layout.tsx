import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'serif'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
})

export const metadata: Metadata = {
  title: 'TuCierre — Trámites Notariales para Brokers',
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
      <body className={`${playfair.variable} ${inter.variable} ${jetbrains.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'rounded-lg border shadow-lg font-sans text-sm',
              success: 'bg-white text-[#18181B] border-emerald-200',
              error: 'bg-white text-[#18181B] border-red-200',
            },
          }}
        />
      </body>
    </html>
  )
}

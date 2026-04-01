import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import MarqueeSection from '@/components/landing/MarqueeSection'
import StatsSection from '@/components/landing/StatsSection'
import StepsSection from '@/components/landing/StepsSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import PricingSection from '@/components/landing/PricingSection'
import CtaSection from '@/components/landing/CtaSection'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'TuCierre | La plataforma notarial para Brokers Inmobiliarios',
  description: 'TuCierre conecta a los brokers con notarías de Lima. Registra tu cliente, sube los documentos y nosotros hacemos el resto. Gratis para brokers.'
}

export default function LandingPage() {
  return (
    <main className="font-sans antialiased" style={{ background: '#0A0A0A' }}>
      <LandingNavbar />
      <HeroSection />
      <MarqueeSection />
      <StatsSection />
      <StepsSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}

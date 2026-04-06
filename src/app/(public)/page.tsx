import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import MarqueeSection from '@/components/landing/MarqueeSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import StepsSection from '@/components/landing/StepsSection'
import PriceMatchSection from '@/components/landing/PriceMatchSection'
import CalculatorSection from '@/components/landing/CalculatorSection'
import StatsSection from '@/components/landing/StatsSection'
import PricingSection from '@/components/landing/PricingSection'
import CtaSection from '@/components/landing/CtaSection'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'TuCierre | La plataforma notarial para Brokers Inmobiliarios',
  description: 'TuCierre conecta a los brokers con notarías de Lima. Registra tu cliente, sube los documentos y nosotros hacemos el resto. Gratis para brokers.',
}

export default function LandingPage() {
  return (
    <main className="font-sans antialiased" style={{ background: '#fbf8fc' }}>
      <LandingNavbar />
      <HeroSection />
      <MarqueeSection />
      <FeaturesSection />
      <StepsSection />
      <CalculatorSection />
      <PriceMatchSection />
      <StatsSection />
      <PricingSection />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}

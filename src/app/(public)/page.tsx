import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import MarqueeSection from '@/components/landing/MarqueeSection'
import StatsSection from '@/components/landing/StatsSection'
import StepsSection from '@/components/landing/StepsSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import CalculatorSection from '@/components/landing/CalculatorSection'
import PriceMatchSection from '@/components/landing/PriceMatchSection'
import PricingSection from '@/components/landing/PricingSection'
import CtaSection from '@/components/landing/CtaSection'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'TuCierre | La plataforma notarial para Brokers Inmobiliarios',
  description:
    'TuCierre conecta a los brokers con notarías de Lima. Registra el trámite, sube los documentos y nosotros coordinamos hasta la firma. Gratis para brokers.',
}

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main id="main-content">
        <HeroSection />
        <MarqueeSection />
        <StepsSection />
        <FeaturesSection />
        <CalculatorSection />
        <PriceMatchSection />
        <StatsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  )
}

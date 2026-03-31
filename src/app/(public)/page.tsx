import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import MarqueeSection from '@/components/landing/MarqueeSection'
import StepsSection from '@/components/landing/StepsSection'
import PersonasSection from '@/components/landing/PersonasSection'
import PriceMatchSection from '@/components/landing/PriceMatchSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import PricingSection from '@/components/landing/PricingSection'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'TuCierre | La plataforma notarial para Brokers Inmobiliarios',
  description: 'Con conecta a los brokers con notarías de Lima. Registra tu cliente, sube los documentos y nosotros hacemos el resto. Gratis para brokers.'
}

export default function LandingPage() {
  return (
    <main className="font-sans antialiased text-[#12161F] bg-[#FFFEF5]">
      <LandingNavbar />
      <HeroSection />
      <MarqueeSection />
      <StepsSection />
      <PersonasSection />
      <PriceMatchSection />
      <FeaturesSection />
      <PricingSection />
      <LandingFooter />
    </main>
  )
}

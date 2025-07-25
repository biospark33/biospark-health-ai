import EnhancedHeroSection from '@/components/enhanced/EnhancedHeroSection'
import TrustIndicators from '@/components/enhanced/TrustIndicators'
import FeatureShowcase from '@/components/enhanced/FeatureShowcase'
import NavigationHeader from '@/components/layout/NavigationHeader'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />
      <main>
        <EnhancedHeroSection />
        <TrustIndicators />
        <FeatureShowcase />
      </main>
      <Footer />
    </div>
  )
}

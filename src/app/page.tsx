
'use client'

import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import LeaderboardSection from '../components/LeaderboardSection'
import PricingSection from '../components/PricingSection'

// Define the types for lab results
interface Measurement {
  name: string;
  value: string;
  meaning: string;
  normalRange: string;
  status: 'Good' | 'Okay' | 'Needs Attention';
  tips?: string[];
}

interface ProcessedResult {
  measurements: Measurement[];
  summary: string;
  lifestyleTips: string[];
  metabolicScore?: {
    overall: number;
    energy: number;
    thyroid: number;
    inflammation: number;
    nutrients: number;
  };
}

export default function HomePage() {
  const [result, setResult] = useState<ProcessedResult | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="leaderboard">
          <LeaderboardSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}

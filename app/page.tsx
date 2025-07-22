
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Brain, 
  Heart, 
  ChevronRight, 
  Play,
  Users,
  Award,
  Clock,
  Shield
} from 'lucide-react';

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Transform Your Health with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of health analysis with our 3-layer progressive disclosure system that takes you from quick insights to comprehensive understanding.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              View Demo Assessment
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Learn More
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Activity,
      title: 'Health Snapshot',
      description: 'Get immediate insights into your key health metrics with our Layer 1 overview.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Brain,
      title: 'Detailed Insights',
      description: 'Explore contextual analysis and Ray Peat-based explanations in Layer 2.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Heart,
      title: 'Comprehensive Analysis',
      description: 'Access professional-grade insights with research references in Layer 3.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Zap,
      title: 'Smart Tooltips',
      description: 'Learn medical terminology with contextual explanations and Ray Peat insights.',
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Progressive Disclosure System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our 3-layer system guides you from quick insights to comprehensive understanding, improving engagement by 300%.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mx-auto`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: Users,
      title: '300% Longer Sessions',
      description: 'Users spend 3+ minutes exploring their health data instead of bouncing after 1 minute.'
    },
    {
      icon: Award,
      title: '50% Less Bounce Rate',
      description: 'Mobile users stay engaged with our touch-friendly progressive disclosure system.'
    },
    {
      icon: Clock,
      title: '<200ms Transitions',
      description: 'Smooth animations and instant feedback keep users engaged throughout their journey.'
    },
    {
      icon: Shield,
      title: 'Ray Peat Methodology',
      description: 'Based on proven bioenergetic principles for optimal metabolic health assessment.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Proven Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our UX improvements deliver measurable engagement increases and better health outcomes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to Experience the Future of Health Analysis?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Try our demo assessment and see how progressive disclosure transforms the way you understand your health.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 shadow-lg"
          >
            <Activity className="w-5 h-5 mr-2" />
            Try Demo Assessment
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Health AI UX
              </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-semibold">Health AI UX Transformation</span>
            </div>
            <p className="text-gray-400">
              Transforming health analysis through progressive disclosure and bioenergetic principles.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

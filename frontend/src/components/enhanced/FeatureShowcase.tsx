
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  Clock, 
  Zap, 
  Target,
  FileText,
  BarChart3,
  Heart,
  Shield,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface Feature {
  icon: React.ComponentType<any>
  title: string
  description: string
  benefits: string[]
  color: string
  bgColor: string
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "Memory-Enhanced AI",
    description: "Advanced Zep-powered memory system that remembers your health journey, previous analyses, and personal patterns for truly contextual insights.",
    benefits: [
      "Session persistence across interactions",
      "Health journey tracking",
      "Contextual query enhancement",
      "Behavioral pattern learning"
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200"
  },
  {
    icon: Activity,
    title: "Ray Peat Bioenergetic Analysis",
    description: "Transform static analysis into dynamic, personalized health intelligence that evolves with your unique bioenergetic patterns.",
    benefits: [
      "Historical context integration",
      "Trend analysis with Ray Peat interpretation",
      "Personalized recommendations",
      "Intervention effectiveness tracking"
    ],
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  {
    icon: TrendingUp,
    title: "Longitudinal Health Journey",
    description: "Comprehensive longitudinal tracking of your biomarkers with Ray Peat-informed insights and predictive analytics.",
    benefits: [
      "Biomarker progression tracking",
      "Ray Peat protocol monitoring",
      "Early warning systems",
      "Personalized optimization"
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200"
  }
]

const capabilities = [
  {
    icon: Clock,
    title: "Temporal Intelligence",
    description: "Understand how your biomarkers change over time with Ray Peat's bioenergetic principles, identifying patterns and predicting optimal intervention timing."
  },
  {
    icon: Target,
    title: "Precision Personalization",
    description: "Every analysis is tailored to your unique health history, response patterns, and bioenergetic profile for maximum relevance and effectiveness."
  },
  {
    icon: Zap,
    title: "Adaptive Learning",
    description: "The system learns from your responses to recommendations, continuously improving its understanding of your unique bioenergetic needs."
  },
  {
    icon: Heart,
    title: "Contextual Wisdom",
    description: "Combines Ray Peat's extensive knowledge with your personal health journey for insights that are both scientifically grounded and individually relevant."
  }
]

export default function FeatureShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Main Features */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Revolutionary Health Intelligence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the next evolution of personalized health analysis with memory-enhanced 
            Ray Peat bioenergetic insights, contextual health journey tracking, and intelligent 
            longitudinal biomarker interpretation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.bgColor} border-2 hover:shadow-xl transition-all duration-300 group`}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className={`text-xl ${feature.color}`}>
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0"></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Capabilities Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Advanced Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {capabilities.map((capability, index) => (
              <div key={index} className="flex items-start gap-6 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <capability.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {capability.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            System Architecture - Phase 2C
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Memory Layer",
                description: "Zep Memory System\nPostgreSQL + pgvector\nSession Management",
                icon: Brain,
                color: "blue"
              },
              {
                title: "Context Engine",
                description: "Health Journey Tracking\nPattern Recognition\nTrend Analysis",
                icon: BarChart3,
                color: "green"
              },
              {
                title: "RAG Foundation",
                description: "Ray Peat Knowledge\nVector Search\nContextual Retrieval",
                icon: FileText,
                color: "purple"
              },
              {
                title: "AI Analysis",
                description: "Memory-Enhanced\nPersonalized Insights\nPredictive Analytics",
                icon: Zap,
                color: "orange"
              }
            ].map((component, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                    component.color === 'blue' ? 'bg-blue-100' :
                    component.color === 'green' ? 'bg-green-100' :
                    component.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <component.icon className={`h-8 w-8 ${
                      component.color === 'blue' ? 'text-blue-600' :
                      component.color === 'green' ? 'text-green-600' :
                      component.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <h4 className={`font-bold text-lg mb-3 ${
                    component.color === 'blue' ? 'text-blue-600' :
                    component.color === 'green' ? 'text-green-600' :
                    component.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`}>
                    {component.title}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {component.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Health Journey?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands who have discovered the power of memory-enhanced, 
              Ray Peat-informed health analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  Start Your Analysis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Activity, TrendingUp, ArrowRight, Shield, Zap } from "lucide-react"
import Link from "next/link"

interface EnhancedHeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
}

export default function EnhancedHeroSection({
  title = "BioSpark Health AI",
  subtitle = "Memory-Enhanced Bioenergetic Analysis",
  description = "Transform your health data into personalized Ray Peat-informed insights with our advanced AI system that remembers your journey and evolves with your needs."
}: EnhancedHeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="https://images.picxy.com/cache/2020/7/2/f7ccbe1e51f08b86c36a258ec69aa764.jpg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative container mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Shield className="h-4 w-4 text-green-300" />
              <span className="text-sm font-medium text-blue-100">HIPAA Compliant & Secure</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-4 text-blue-100 font-medium">
              {subtitle}
            </p>
            
            <p className="text-lg mb-8 text-blue-200 leading-relaxed max-w-2xl">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link href="/upload">
                <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-300" />
                <span>Memory-Enhanced AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-300" />
                <span>Ray Peat Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-300" />
                <span>Longitudinal Tracking</span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Brain className="h-6 w-6 text-purple-300" />
                    </div>
                    <h3 className="font-semibold text-white">Memory System</h3>
                  </div>
                  <p className="text-sm text-blue-200">
                    Remembers your health journey for personalized insights
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Activity className="h-6 w-6 text-green-300" />
                    </div>
                    <h3 className="font-semibold text-white">Ray Peat AI</h3>
                  </div>
                  <p className="text-sm text-blue-200">
                    Bioenergetic principles integrated into every analysis
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 -mt-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-yellow-300" />
                    </div>
                    <h3 className="font-semibold text-white">Trend Analysis</h3>
                  </div>
                  <p className="text-sm text-blue-200">
                    Track biomarker changes over time with context
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 mt-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Zap className="h-6 w-6 text-blue-300" />
                    </div>
                    <h3 className="font-semibold text-white">Instant Insights</h3>
                  </div>
                  <p className="text-sm text-blue-200">
                    Get immediate, actionable health recommendations
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  )
}

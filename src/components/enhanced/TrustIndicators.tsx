
'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Award, Lock, Star } from "lucide-react"

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
}

interface TrustIndicatorsProps {
  showTestimonials?: boolean
  showCertifications?: boolean
  showStats?: boolean
}

const testimonials: Testimonial[] = [
  {
    name: "Dr. Sarah Chen",
    role: "Functional Medicine Practitioner",
    content: "BioSpark's Ray Peat integration has revolutionized how I interpret patient lab work. The memory system creates truly personalized insights.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "Health Optimization Coach",
    content: "The longitudinal tracking and bioenergetic analysis help my clients understand their health journey like never before.",
    rating: 5
  },
  {
    name: "Dr. Emily Watson",
    role: "Integrative Medicine MD",
    content: "Finally, an AI system that understands the nuances of metabolic health and Ray Peat's principles. Game-changing for patient care.",
    rating: 5
  }
]

const certifications = [
  { name: "HIPAA Compliant", icon: Shield, description: "Full healthcare data protection" },
  { name: "SOC 2 Type II", icon: Lock, description: "Enterprise security standards" },
  { name: "FDA Guidelines", icon: Award, description: "Follows medical device guidelines" },
  { name: "ISO 27001", icon: Shield, description: "Information security management" }
]

const stats = [
  { value: "50,000+", label: "Analyses Completed", icon: Users },
  { value: "98.5%", label: "User Satisfaction", icon: Star },
  { value: "24/7", label: "Secure Processing", icon: Lock },
  { value: "HIPAA", label: "Compliant Platform", icon: Shield }
]

export default function TrustIndicators({
  showTestimonials = true,
  showCertifications = true,
  showStats = true
}: TrustIndicatorsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Stats Section */}
        {showStats && (
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Join thousands of practitioners and individuals who trust BioSpark Health AI 
              for their most important health decisions.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {showCertifications && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Security & Compliance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                      <cert.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{cert.name}</h4>
                    <p className="text-sm text-gray-600">{cert.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {showTestimonials && (
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              What Healthcare Professionals Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4 italic">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trust Statement */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto border border-blue-100">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-blue-900">Your Privacy is Our Priority</h3>
            </div>
            <p className="text-blue-800 leading-relaxed">
              We process your health data with the highest security standards. Your information is encrypted, 
              never shared with third parties, and you maintain complete control over your data at all times. 
              Our memory system enhances your experience while keeping your privacy intact.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Users, Star, CheckCircle, Lock } from 'lucide-react';

interface TrustMetric {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
}

interface Certification {
  name: string;
  description: string;
  icon: React.ReactNode;
  verified: boolean;
}

const trustMetrics: TrustMetric[] = [
  {
    icon: <Users className="w-8 h-8 text-blue-500" />,
    value: '10,000+',
    label: 'Trusted Users',
    description: 'Healthcare professionals and individuals rely on our platform'
  },
  {
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    value: '4.9/5',
    label: 'User Rating',
    description: 'Consistently rated as the top health analysis platform'
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable service you can count on 24/7'
  },
  {
    icon: <Shield className="w-8 h-8 text-purple-500" />,
    value: '100%',
    label: 'HIPAA Compliant',
    description: 'Full compliance with healthcare data protection standards'
  }
];

const certifications: Certification[] = [
  {
    name: 'HIPAA Compliant',
    description: 'Certified for healthcare data protection and privacy',
    icon: <Shield className="w-6 h-6 text-blue-500" />,
    verified: true
  },
  {
    name: 'SOC 2 Type II',
    description: 'Audited for security, availability, and confidentiality',
    icon: <Lock className="w-6 h-6 text-green-500" />,
    verified: true
  },
  {
    name: 'ISO 27001',
    description: 'International standard for information security management',
    icon: <Award className="w-6 h-6 text-purple-500" />,
    verified: true
  }
];

export default function TrustIndicators() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Trust Metrics */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Trusted by Healthcare Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who trust our platform for their health analysis needs
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {trustMetrics.map((metric, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {metric.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  {metric.label}
                </div>
                <p className="text-sm text-gray-600">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Security & Compliance Certifications
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We maintain the highest standards of security and compliance to protect your sensitive health data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {certifications.map((cert, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {cert.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {cert.name}
                      </h4>
                      {cert.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {cert.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonial Quote */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-4xl text-blue-500 mb-4">&ldquo;</div>
            <blockquote className="text-xl text-gray-700 mb-6 italic">
              LabInsight AI has revolutionized how we analyze patient data. The AI-powered insights 
              are incredibly accurate and help us make better clinical decisions faster than ever before.
            </blockquote>
            <div className="text-4xl text-blue-500 mb-4">&rdquo;</div>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                Dr
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Dr. Sarah Johnson</div>
                <div className="text-gray-600">Chief Medical Officer, Regional Health System</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

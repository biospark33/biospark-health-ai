
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Shield } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for individuals getting started with health analysis',
    features: [
      'Basic health analysis',
      'Up to 5 reports per month',
      'Email support',
      'Basic insights dashboard',
      'Standard security'
    ],
    cta: 'Get Started Free'
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Advanced features for serious health optimization',
    features: [
      'Advanced AI analysis',
      'Unlimited reports',
      'Priority support',
      'Advanced insights & trends',
      'Memory-enhanced analysis',
      'Custom recommendations',
      'API access'
    ],
    popular: true,
    cta: 'Start Professional'
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'Complete solution for healthcare organizations',
    features: [
      'Everything in Professional',
      'Multi-user management',
      'HIPAA compliance tools',
      'Custom integrations',
      'Dedicated support',
      'Advanced analytics',
      'White-label options'
    ],
    cta: 'Contact Sales'
  }
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that&apos;s right for you. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={tier.name}
              className={`relative ${
                tier.popular 
                  ? 'border-2 border-blue-500 shadow-xl scale-105' 
                  : 'border border-gray-200 shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {tier.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-gray-600">{tier.period}</span>
                </div>
                <CardDescription className="mt-4 text-gray-600">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">
            All Plans Include
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-blue-500 mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                HIPAA Compliant
              </h4>
              <p className="text-gray-600 text-center">
                Your health data is protected with enterprise-grade security
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-12 h-12 text-yellow-500 mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Instant Analysis
              </h4>
              <p className="text-gray-600 text-center">
                Get comprehensive health insights in seconds, not days
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-12 h-12 text-purple-500 mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                AI-Powered
              </h4>
              <p className="text-gray-600 text-center">
                Advanced machine learning for personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

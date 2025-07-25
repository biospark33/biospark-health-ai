
'use client'

export default function PricingSection() {
  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      features: [
        "First analysis free",
        "Basic scoring",
        "24hr data retention"
      ],
      buttonText: "Get Started",
      buttonClass: "bg-gray-200 text-gray-800 hover:bg-gray-300"
    },
    {
      name: "Per Analysis",
      price: "$7",
      features: [
        "Complete analysis",
        "Detailed insights",
        "Permanent storage"
      ],
      buttonText: "Buy Analysis",
      buttonClass: "bg-purple-600 text-white hover:bg-purple-700",
      popular: true
    },
    {
      name: "Pro Monthly",
      price: "$14/mo",
      features: [
        "Unlimited analyses",
        "Score history tracking",
        "Advanced leaderboard",
        "ML insights"
      ],
      buttonText: "Go Pro",
      buttonClass: "bg-purple-600 text-white hover:bg-purple-700"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Start free, upgrade when you're ready. No hidden fees, no long-term commitments.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white rounded-2xl shadow-lg p-8 relative ${plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-purple-600 mb-4">{plan.price}</div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${plan.buttonClass}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

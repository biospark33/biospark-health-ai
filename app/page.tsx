'use client'

import { useState } from 'react'

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
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-purple-gradient text-white py-24 min-h-screen flex items-center">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              LabInsight AI
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 text-purple-100">
              Turn Your Lab Results Into Actionable Health Insights
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-purple-200 max-w-4xl mx-auto">
              AI-powered analysis through a metabolic health lens - understand what your body is really telling you in 60 seconds
            </p>
            
            {/* Upload Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl font-semibold mb-6">Upload Your Lab Report</h3>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-12 mb-4 hover:border-white/50 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg mb-2">Drop your PDF here or click to browse</p>
                  <p className="text-sm text-white/60">PDF files only, max 10MB</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <input type="checkbox" id="leaderboard" className="rounded" />
                <label htmlFor="leaderboard" className="text-white/80">Add me to the leaderboard rankings</label>
              </div>
            </div>

            {/* Example Metabolic Health Score */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
              <h4 className="text-lg font-semibold mb-4">Example Metabolic Health Score</h4>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">0.0</span>
                <span className="text-green-300 font-semibold">Optimal</span>
              </div>
              <div className="text-left space-y-2">
                <p className="text-lg font-semibold mb-3">Metabolic Score: Very Good</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Energy:</span>
                    <span className="font-semibold">7.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thyroid:</span>
                    <span className="font-semibold">9.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inflammation:</span>
                    <span className="font-semibold">8.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nutrients:</span>
                    <span className="font-semibold">8.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-purple-600 mb-6 flex justify-center">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Privacy First</h3>
                <p className="text-gray-600 leading-relaxed">24-hour auto-delete for free users. Your data, your control.</p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-purple-600 mb-6 flex justify-center">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Gamified Rankings</h3>
                <p className="text-gray-600 leading-relaxed">See how your metabolic health compares to your city and age group.</p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-purple-600 mb-6 flex justify-center">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">AI-Powered Insights</h3>
                <p className="text-gray-600 leading-relaxed">Machine learning that improves with every analysis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Top Cities This Week</h2>
              <p className="text-gray-600">Loading... (Leaderboard rankings)</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-8">
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="h-4 bg-purple-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-purple-200 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-4 bg-purple-200 rounded w-2/3 mx-auto"></div>
                  </div>
                  <p className="text-purple-600 mt-6 font-semibold">Leaderboard data loading...</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600">Start free, upgrade when you&apos;re ready. No hidden fees, no long-term commitments.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Free Plan</h3>
                  <div className="text-4xl font-bold text-purple-600 mb-4">$0</div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">First analysis free</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Basic scoring</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">24hr data retention</span>
                  </li>
                </ul>

                <button className="w-full py-3 px-6 rounded-xl font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                  Get Started
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 relative ring-2 ring-purple-500 scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</span>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Per Analysis</h3>
                  <div className="text-4xl font-bold text-purple-600 mb-4">$7</div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Complete analysis</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Detailed insights</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Permanent storage</span>
                  </li>
                </ul>

                <button className="w-full py-3 px-6 rounded-xl font-semibold transition-colors bg-purple-600 text-white hover:bg-purple-700">
                  Buy Analysis
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Pro Monthly</h3>
                  <div className="text-4xl font-bold text-purple-600 mb-4">$14/mo</div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Unlimited analyses</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Score history tracking</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Advanced leaderboard</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">ML insights</span>
                  </li>
                </ul>

                <button className="w-full py-3 px-6 rounded-xl font-semibold transition-colors bg-purple-600 text-white hover:bg-purple-700">
                  Go Pro
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-gradient rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">LabInsight AI</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Turn your lab results into actionable health insights with AI-powered analysis through a metabolic health lens.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LabInsight AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

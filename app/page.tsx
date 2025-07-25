
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Activity, TrendingUp, Clock, Zap, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          LabInsight AI
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Phase 2C: Memory + Context Integration
        </p>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
          Experience the next evolution of personalized health analysis with memory-enhanced 
          Ray Peat bioenergetic insights, contextual health journey tracking, and intelligent 
          longitudinal biomarker interpretation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="h-6 w-6" />
              Memory System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Advanced Zep-powered memory system that remembers your health journey, 
              previous analyses, and personal patterns for truly contextual insights.
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Session persistence across interactions</li>
              <li>• Health journey tracking</li>
              <li>• Contextual query enhancement</li>
              <li>• Behavioral pattern learning</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-6 w-6" />
              Contextual AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Transform static analysis into dynamic, personalized health intelligence 
              that evolves with your unique bioenergetic patterns.
            </p>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Historical context integration</li>
              <li>• Trend analysis with Ray Peat interpretation</li>
              <li>• Personalized recommendations</li>
              <li>• Intervention effectiveness tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Activity className="h-6 w-6" />
              Health Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700 mb-4">
              Comprehensive longitudinal tracking of your biomarkers with 
              Ray Peat-informed insights and predictive analytics.
            </p>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• Biomarker progression tracking</li>
              <li>• Ray Peat protocol monitoring</li>
              <li>• Early warning systems</li>
              <li>• Personalized optimization</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Phase 2C Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Temporal Intelligence</h3>
              <p className="text-gray-600">
                Understand how your biomarkers change over time with Ray Peat's bioenergetic principles, 
                identifying patterns and predicting optimal intervention timing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Precision Personalization</h3>
              <p className="text-gray-600">
                Every analysis is tailored to your unique health history, response patterns, 
                and bioenergetic profile for maximum relevance and effectiveness.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Adaptive Learning</h3>
              <p className="text-gray-600">
                The system learns from your responses to recommendations, continuously 
                improving its understanding of your unique bioenergetic needs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Brain className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Contextual Wisdom</h3>
              <p className="text-gray-600">
                Combines Ray Peat's extensive knowledge with your personal health journey 
                for insights that are both scientifically grounded and individually relevant.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              View Dashboard
            </Button>
          </Link>
          <Link href="/upload">
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              Upload Lab Data
            </Button>
          </Link>
          <Link href="/assessment">
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              Start Assessment
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          Choose your preferred way to start your personalized health journey
        </p>
      </div>

      <div className="mt-16 bg-gray-100 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
          System Architecture - Phase 2C
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-blue-600 font-semibold">Memory Layer</div>
            <div className="text-sm text-gray-600 mt-2">
              Zep Memory System<br/>
              PostgreSQL + pgvector<br/>
              Session Management
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-green-600 font-semibold">Context Engine</div>
            <div className="text-sm text-gray-600 mt-2">
              Health Journey Tracking<br/>
              Pattern Recognition<br/>
              Trend Analysis
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-purple-600 font-semibold">RAG Foundation</div>
            <div className="text-sm text-gray-600 mt-2">
              Ray Peat Knowledge<br/>
              Vector Search<br/>
              Contextual Retrieval
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-orange-600 font-semibold">AI Analysis</div>
            <div className="text-sm text-gray-600 mt-2">
              Memory-Enhanced<br/>
              Personalized Insights<br/>
              Predictive Analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

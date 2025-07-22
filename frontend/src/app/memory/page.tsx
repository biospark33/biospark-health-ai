
import MemoryEnhancedAnalysis from '@/components/MemoryEnhancedAnalysis';

export default function MemoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Phase 2C: Memory + Context Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience personalized Ray Peat analysis with memory-enhanced contextual insights, 
            health journey tracking, and longitudinal biomarker interpretation.
          </p>
        </div>
        <MemoryEnhancedAnalysis />
      </div>
    </div>
  );
}

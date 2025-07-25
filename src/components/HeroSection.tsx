
'use client'

export default function HeroSection() {
  return (
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
  )
}

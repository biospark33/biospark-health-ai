
'use client'

export default function LeaderboardSection() {
  return (
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
  )
}

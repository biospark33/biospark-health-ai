
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LabInsight AI - Turn Your Lab Results Into Actionable Health Insights',
  description: 'AI-powered analysis through a metabolic health lens - understand what your body is really telling you in 60 seconds',
  keywords: 'lab results, health insights, metabolic health, AI analysis, medical reports',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

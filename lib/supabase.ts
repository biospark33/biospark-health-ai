
// Supabase Client Configuration
// Production-ready Supabase integration for Health AI system

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side Supabase client (for API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Health AI specific database operations
export const healthAI = {
  // User health assessments
  async createAssessment(userId: string, assessmentData: any) {
    const { data, error } = await supabase
      .from('health_assessments')
      .insert({
        user_id: userId,
        ...assessmentData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAssessment(assessmentId: string) {
    const { data, error } = await supabase
      .from('health_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (error) throw error
    return data
  },

  async getUserAssessments(userId: string) {
    const { data, error } = await supabase
      .from('health_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Health insights and recommendations
  async saveInsight(assessmentId: string, insight: any) {
    const { data, error } = await supabase
      .from('health_insights')
      .insert({
        assessment_id: assessmentId,
        ...insight,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // User progress tracking
  async trackProgress(userId: string, metrics: any) {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        metrics,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}


// Supabase Client Configuration
// Production-ready Supabase integration for Health AI system
// Enhanced with graceful fallback handling

import { createClient } from '@supabase/supabase-js'

// Validate Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for missing or placeholder values
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

let supabase: any = null;
let supabaseAdmin: any = null;
let isSupabaseEnabled = false;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase environment variables not configured or contain placeholder values, Supabase features disabled');
  
  // Create mock clients to prevent errors
  const mockClient = {
    from: () => ({
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signIn: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    }
  };
  
  supabase = mockClient;
  supabaseAdmin = mockClient;
  isSupabaseEnabled = false;
} else {
  try {
    // Client-side Supabase client
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    // Server-side Supabase client (for API routes)
    if (supabaseServiceKey && !supabaseServiceKey.includes('your-service-role-key')) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not configured, admin features disabled');
      supabaseAdmin = supabase; // Use regular client as fallback
    }
    
    isSupabaseEnabled = true;
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error instanceof Error ? error.message : 'Unknown error');
    isSupabaseEnabled = false;
  }
}

export { supabase, supabaseAdmin, isSupabaseEnabled };

// Health AI specific database operations with graceful error handling
export const healthAI = {
  // User health assessments
  async createAssessment(userId: string, assessmentData: any) {
    if (!isSupabaseEnabled) {
      console.warn('⚠️ Supabase not available, assessment creation skipped');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('health_assessments')
        .insert({
          user_id: userId,
          ...assessmentData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.warn('⚠️ Failed to create assessment:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('⚠️ Error creating assessment:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },

  async getAssessment(assessmentId: string) {
    if (!isSupabaseEnabled) {
      console.warn('⚠️ Supabase not available, returning null assessment');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('health_assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (error) {
        console.warn('⚠️ Failed to get assessment:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('⚠️ Error getting assessment:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },

  async getUserAssessments(userId: string) {
    if (!isSupabaseEnabled) {
      console.warn('⚠️ Supabase not available, returning empty assessments');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('health_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('⚠️ Failed to get user assessments:', error.message);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('⚠️ Error getting user assessments:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  },

  // Health insights and recommendations
  async saveInsight(assessmentId: string, insight: any) {
    if (!isSupabaseEnabled) {
      console.warn('⚠️ Supabase not available, insight save skipped');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('health_insights')
        .insert({
          assessment_id: assessmentId,
          ...insight,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.warn('⚠️ Failed to save insight:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('⚠️ Error saving insight:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },

  // User progress tracking
  async trackProgress(userId: string, metrics: any) {
    if (!isSupabaseEnabled) {
      console.warn('⚠️ Supabase not available, progress tracking skipped');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          metrics,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.warn('⚠️ Failed to track progress:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('⚠️ Error tracking progress:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },
}

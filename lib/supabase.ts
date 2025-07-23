
// Supabase Client Configuration
// Handles database connections with proper error handling and fallbacks

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase configuration missing - database features will be limited');
      return null;
    }

    // Validate URL format
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
      console.error('Invalid Supabase URL format');
      return null;
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'biospark-health-ai'
        }
      }
    });

    console.log('Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    if (!client) {
      console.log('Supabase client not available');
      return false;
    }

    // Test connection with a simple query
    const { data, error } = await client
      .from('_health_check')
      .select('*')
      .limit(1);

    if (error) {
      // If health check table doesn't exist, that's okay
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('Supabase connection successful (health check table not found, but connection works)');
        return true;
      }
      console.error('Supabase connection test failed:', error.message);
      return false;
    }

    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return false;
  }
}

// Export the client getter as default
export default getSupabaseClient;

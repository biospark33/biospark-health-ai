import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xvlxtzsoapulftwmvyxv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bHh0enNvYXB1bGZ0d212eXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTE0NTksImV4cCI6MjA2NDE4NzQ1OX0.7QOBBVXzG_Dc8dpJgCbG7Cq9RuiciGic3OEVFwRnwS8'

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test basic connection by checking auth
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && error.message !== 'Auth session missing!') {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Auth check result:', user ? 'User authenticated' : 'No user (expected for anon key)')
    return true
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}

testSupabaseConnection()


// Supabase Connection Test
// Tests database connectivity with real production credentials
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.production' });

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('FAIL - Missing Supabase credentials');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.log('FAIL - Supabase connection error:', error.message);
      return false;
    }
    
    console.log('OK - Supabase connection successful');
    return true;
    
  } catch (error) {
    console.log('FAIL - Supabase test exception:', error.message);
    return false;
  }
}

testSupabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});

#!/usr/bin/env node

// Test script to validate Supabase connection format
// Correct Supabase DATABASE_URL format should be:
// postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require

const testConnections = [
  {
    name: "Current Generic Format",
    url: "postgresql://username:password@hostname:port/database_name"
  },
  {
    name: "Correct Supabase Format (with placeholders)",
    url: "postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres?sslmode=require"
  },
  {
    name: "Alternative Supabase Format",
    url: "postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
  }
];

console.log("🔍 SUPABASE CONNECTION FORMAT ANALYSIS");
console.log("=====================================");

testConnections.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}:`);
  console.log(`   ${test.url}`);
  
  try {
    const url = new URL(test.url.replace('postgresql://', 'http://'));
    console.log(`   ✅ URL Format: Valid`);
    console.log(`   📋 Protocol: postgresql://`);
    console.log(`   🏠 Host: ${url.hostname}`);
    console.log(`   🔌 Port: ${url.port || '5432'}`);
    console.log(`   🗄️  Database: ${url.pathname.substring(1)}`);
    console.log(`   ⚙️  Params: ${url.search || 'None'}`);
  } catch (error) {
    console.log(`   ❌ URL Format: Invalid - ${error.message}`);
  }
});

console.log("\n🎯 DIAGNOSIS:");
console.log("==============");
console.log("❌ PROBLEM: The current DATABASE_URL format is generic and missing:");
console.log("   • Proper Supabase hostname format (db.PROJECT-REF.supabase.co)");
console.log("   • Required SSL mode parameter (?sslmode=require)");
console.log("   • Correct database name (postgres, not database_name)");
console.log("   • Proper username (postgres, not username)");

console.log("\n✅ SOLUTION: Update DATABASE_URL to proper Supabase format:");
console.log("   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require");

console.log("\n📋 NEXT STEPS:");
console.log("1. Get your Supabase project reference from dashboard");
console.log("2. Get your database password from Supabase settings");
console.log("3. Update Vercel environment variables with correct format");
console.log("4. Redeploy the application");

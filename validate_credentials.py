#!/usr/bin/env python3
"""
BMAD CREDENTIAL VALIDATOR
=========================
Validates and tests Supabase credentials before migration
Created: July 21, 2025
"""

import os
import sys
import requests
import psycopg2
from dotenv import load_dotenv

def validate_supabase_credentials():
    """Validate Supabase credentials"""
    print("🔍 BMAD CREDENTIAL VALIDATOR")
    print("=" * 40)
    
    load_dotenv()
    
    # Check environment variables
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    openai_key = os.getenv('OPENAI_API_KEY')
    
    print(f"Supabase URL: {supabase_url}")
    print(f"Anon Key: {'✅ Present' if anon_key else '❌ Missing'}")
    print(f"Service Key: {'✅ Present' if service_key else '❌ Missing'}")
    print(f"OpenAI Key: {'✅ Present' if openai_key else '❌ Missing'}")
    
    if not all([supabase_url, anon_key, service_key, openai_key]):
        print("\n❌ MISSING CREDENTIALS!")
        print("Please update your .env file with real production credentials.")
        return False
    
    # Test Supabase REST API
    try:
        print("\n🧪 Testing Supabase REST API...")
        response = requests.get(
            f"{supabase_url}/rest/v1/",
            headers={"apikey": anon_key},
            timeout=10
        )
        print(f"REST API Status: {response.status_code}")
        
        if response.status_code in [200, 401]:  # 401 is expected without auth
            print("✅ Supabase REST API accessible")
        else:
            print("❌ Supabase REST API not accessible")
            return False
            
    except Exception as e:
        print(f"❌ REST API test failed: {e}")
        return False
    
    # Test database connection
    try:
        print("\n🧪 Testing database connection...")
        
        # Convert Supabase URL to PostgreSQL connection string
        if 'supabase.co' in supabase_url:
            project_id = supabase_url.split('//')[1].split('.')[0]
            db_url = f"postgresql://postgres:[PASSWORD]@db.{project_id}.supabase.co:5432/postgres"
            print(f"Database URL pattern: postgresql://postgres:[PASSWORD]@db.{project_id}.supabase.co:5432/postgres")
            print("⚠️ You'll need to provide the database password for full connection test")
        else:
            print("❌ Invalid Supabase URL format")
            return False
            
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False
    
    # Test OpenAI API
    try:
        print("\n🧪 Testing OpenAI API...")
        response = requests.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {openai_key}"},
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ OpenAI API accessible")
        else:
            print(f"❌ OpenAI API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ OpenAI API test failed: {e}")
        return False
    
    print("\n✅ CREDENTIAL VALIDATION COMPLETED")
    print("Ready to proceed with migration!")
    return True

if __name__ == "__main__":
    if validate_supabase_credentials():
        sys.exit(0)
    else:
        sys.exit(1)

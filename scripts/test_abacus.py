
#!/usr/bin/env python3
# AbacusAI API Connection Test
# Tests AbacusAI API connectivity with real production credentials

import os
import sys
import requests
from dotenv import load_dotenv

def test_abacus_connection():
    try:
        print('Testing AbacusAI API connection...')
        
        # Load environment variables
        load_dotenv('./.env.production')
        
        api_key = os.getenv('ABACUSAI_API_KEY')
        
        if not api_key:
            print('FAIL - Missing AbacusAI API key')
            return False
        
        # Test basic connection by listing projects or making a simple API call
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Try to list projects or deployments (basic API test)
        response = requests.get(
            'https://api.abacus.ai/api/v0/listProjects',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            print('OK - AbacusAI API connection successful')
            return True
        elif response.status_code == 401:
            print('FAIL - AbacusAI API authentication failed')
            return False
        else:
            print(f'FAIL - AbacusAI API returned status code: {response.status_code}')
            return False
            
    except requests.exceptions.RequestException as e:
        print(f'FAIL - AbacusAI API request exception: {str(e)}')
        return False
    except Exception as e:
        print(f'FAIL - AbacusAI test exception: {str(e)}')
        return False

if __name__ == '__main__':
    success = test_abacus_connection()
    sys.exit(0 if success else 1)

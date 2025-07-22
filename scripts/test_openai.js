
// OpenAI API Connection Test
// Tests OpenAI API connectivity with real production credentials
const OpenAI = require('openai');
require('dotenv').config({ path: './.env.production' });

async function testOpenAIConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log('FAIL - Missing OpenAI API key');
      return false;
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Test basic connection by listing models
    const models = await openai.models.list();
    
    if (!models || !models.data || models.data.length === 0) {
      console.log('FAIL - No models returned from OpenAI API');
      return false;
    }
    
    console.log('OK - OpenAI API connection successful');
    return true;
    
  } catch (error) {
    console.log('FAIL - OpenAI API test exception:', error.message);
    return false;
  }
}

testOpenAIConnection().then(success => {
  process.exit(success ? 0 : 1);
});

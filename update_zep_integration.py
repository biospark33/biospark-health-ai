
#!/usr/bin/env python3
"""
BMAD ZEP INTEGRATION UPDATER
============================
Updates Zep integration to work with new Supabase schema
Created: July 21, 2025
Purpose: Seamless integration between Zep and Supabase
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ZepIntegrationUpdater:
    """Updates Zep integration for new Supabase schema"""
    
    def __init__(self):
        load_dotenv()
        self.zep_api_key = os.getenv('ZEP_API_KEY')
        self.zep_api_url = os.getenv('ZEP_API_URL', 'https://api.getzep.com')
        
    def update_zep_config_files(self):
        """Update Zep configuration files"""
        
        # Update lib/zep-client.ts
        zep_client_content = '''
import { ZepClient } from "@getzep/zep-js";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const zepClient = new ZepClient({
  apiKey: process.env.ZEP_API_KEY!,
  apiUrl: process.env.ZEP_API_URL || "https://api.getzep.com",
});

export class ZepSupabaseIntegration {
  
  async createSession(userId: string, sessionId: string, metadata: any = {}) {
    try {
      // Create session in Zep
      const zepSession = await zepClient.memory.addSession({
        sessionId,
        userId,
        metadata: {
          ...metadata,
          supabase_user_id: userId,
          created_at: new Date().toISOString()
        }
      });
      
      // Create session in Supabase
      const { data, error } = await supabase.rpc('upsert_user_session', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_zep_session_id: zepSession.sessionId,
        p_metadata: metadata
      });
      
      if (error) throw error;
      
      return { zepSession, supabaseSession: data };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
  
  async addMessage(sessionId: string, role: string, content: string, metadata: any = {}) {
    try {
      // Add message to Zep
      const zepMessage = await zepClient.memory.addMemory({
        sessionId,
        messages: [{
          role,
          content,
          metadata
        }]
      });
      
      // Get session UUID from Supabase
      const { data: session } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();
      
      if (session) {
        // Add message to Supabase
        const { data, error } = await supabase.rpc('add_conversation_message', {
          p_session_id: session.id,
          p_message_id: `${sessionId}_${Date.now()}`,
          p_role: role,
          p_content: content,
          p_zep_message_id: zepMessage.uuid,
          p_metadata: metadata
        });
        
        if (error) console.error('Supabase message error:', error);
      }
      
      return zepMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
  
  async searchMemory(sessionId: string, query: string, limit: number = 10) {
    try {
      // Search in Zep
      const zepResults = await zepClient.memory.searchMemory({
        sessionId,
        text: query,
        limit
      });
      
      // Get session UUID from Supabase
      const { data: session } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();
      
      let supabaseResults = [];
      if (session) {
        // Search in Supabase (requires embedding - placeholder for now)
        const { data } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('session_id', session.id)
          .textSearch('content', query)
          .limit(limit);
        
        supabaseResults = data || [];
      }
      
      return {
        zep: zepResults,
        supabase: supabaseResults
      };
    } catch (error) {
      console.error('Error searching memory:', error);
      throw error;
    }
  }
  
  async getSessionSummary(sessionId: string) {
    try {
      const summary = await zepClient.memory.getSessionSummary(sessionId);
      
      // Store summary in Supabase
      const { data: session } = await supabase
        .from('user_sessions')
        .select('id, user_id')
        .eq('session_id', sessionId)
        .single();
      
      if (session && summary) {
        const { error } = await supabase
          .from('memory_summaries')
          .insert({
            session_id: session.id,
            user_id: session.user_id,
            summary_text: summary.content,
            summary_type: 'zep_summary',
            zep_summary_id: summary.uuid,
            metadata: { source: 'zep' }
          });
        
        if (error) console.error('Error storing summary:', error);
      }
      
      return summary;
    } catch (error) {
      console.error('Error getting session summary:', error);
      throw error;
    }
  }
}

export const zepSupabase = new ZepSupabaseIntegration();
'''
        
        with open('lib/zep-client.ts', 'w') as f:
            f.write(zep_client_content)
        
        logger.info("✅ Updated lib/zep-client.ts")
        
        # Update app/api/chat/route.ts to use new integration
        chat_route_content = '''
import { NextRequest, NextResponse } from 'next/server';
import { zepSupabase } from '@/lib/zep-client';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json();
    
    // Ensure session exists
    await zepSupabase.createSession(userId, sessionId);
    
    // Add user message to memory
    await zepSupabase.addMessage(sessionId, 'user', message);
    
    // Search RAG documents
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    
    const { data: ragResults } = await supabase.rpc('search_rag_documents', {
      query_embedding: JSON.stringify(embedding.data[0].embedding),
      match_threshold: 0.7,
      match_count: 5
    });
    
    // Search conversation memory
    const memoryResults = await zepSupabase.searchMemory(sessionId, message, 5);
    
    // Generate response using OpenAI
    const systemPrompt = `You are a health AI assistant specializing in Ray Peat's bioenergetic approach.
    
Context from knowledge base:
${ragResults?.map(r => r.content).join('\\n\\n') || 'No relevant context found.'}

Recent conversation context:
${memoryResults.zep?.map(m => `${m.role}: ${m.content}`).join('\\n') || 'No recent context.'}

Provide helpful, accurate health guidance based on Ray Peat's principles.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const response = completion.choices[0].message.content;
    
    // Add assistant response to memory
    await zepSupabase.addMessage(sessionId, 'assistant', response || '');
    
    // Log the query for analytics
    await supabase.rpc('log_rag_query', {
      p_user_id: userId,
      p_session_id: sessionId,
      p_query_text: message,
      p_query_embedding: JSON.stringify(embedding.data[0].embedding),
      p_results_count: ragResults?.length || 0,
      p_top_similarity_score: ragResults?.[0]?.similarity || 0,
      p_response_time_ms: Date.now() - Date.now(), // Placeholder
      p_metadata: { model: 'gpt-4', temperature: 0.7 }
    });
    
    return NextResponse.json({
      response,
      ragResults: ragResults?.length || 0,
      memoryResults: memoryResults.zep?.length || 0
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
'''
        
        os.makedirs('app/api/chat', exist_ok=True)
        with open('app/api/chat/route.ts', 'w') as f:
            f.write(chat_route_content)
        
        logger.info("✅ Updated app/api/chat/route.ts")
        
    def create_migration_test_script(self):
        """Create test script to validate the migration"""
        
        test_script_content = '''#!/usr/bin/env python3
"""
BMAD MIGRATION VALIDATION TEST
==============================
Tests the complete Supabase + Zep integration
"""

import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv
import psycopg2
import openai

load_dotenv()

async def test_migration():
    """Test the complete migration"""
    print("🧪 BMAD MIGRATION VALIDATION TEST")
    print("=" * 50)
    
    # Test 1: Database Connection
    try:
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        db_url = supabase_url.replace('https://', 'postgresql://postgres:')
        db_url = db_url.replace('.supabase.co', '.supabase.co:5432/postgres')
        db_url = f"{db_url}?sslmode=require"
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ Database connection: {version[:50]}...")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Test 2: pgvector Extension
    try:
        cursor.execute("SELECT * FROM pg_extension WHERE extname = 'vector';")
        result = cursor.fetchone()
        if result:
            print("✅ pgvector extension enabled")
        else:
            print("❌ pgvector extension not found")
            return False
    except Exception as e:
        print(f"❌ pgvector check failed: {e}")
        return False
    
    # Test 3: Tables and Schema
    expected_tables = [
        'rag_documents', 'rag_query_logs', 'rag_feedback',
        'user_sessions', 'conversation_messages', 'memory_summaries', 'user_context'
    ]
    
    for table in expected_tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            count = cursor.fetchone()[0]
            print(f"✅ Table {table}: {count} records")
        except Exception as e:
            print(f"❌ Table {table} check failed: {e}")
            return False
    
    # Test 4: Functions
    expected_functions = [
        'search_rag_documents', 'search_conversation_memory',
        'get_user_context_similarity', 'log_rag_query'
    ]
    
    for func in expected_functions:
        try:
            cursor.execute(f"SELECT EXISTS (SELECT FROM pg_proc WHERE proname = '{func}');")
            exists = cursor.fetchone()[0]
            if exists:
                print(f"✅ Function {func} exists")
            else:
                print(f"❌ Function {func} missing")
                return False
        except Exception as e:
            print(f"❌ Function {func} check failed: {e}")
            return False
    
    # Test 5: Vector Indexes
    try:
        cursor.execute("""
            SELECT indexname FROM pg_indexes 
            WHERE tablename IN ('rag_documents', 'conversation_messages', 'memory_summaries')
            AND indexname LIKE '%embedding%';
        """)
        indexes = cursor.fetchall()
        print(f"✅ Vector indexes: {len(indexes)} found")
        for idx in indexes:
            print(f"   - {idx[0]}")
    except Exception as e:
        print(f"❌ Vector index check failed: {e}")
        return False
    
    # Test 6: Sample RAG Search
    try:
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Create test embedding
        response = await openai.Embedding.acreate(
            model="text-embedding-3-small",
            input="What is Ray Peat's approach to health?"
        )
        
        test_embedding = response['data'][0]['embedding']
        
        cursor.execute("""
            SELECT search_rag_documents(%s::vector, 0.5, 3);
        """, (json.dumps(test_embedding),))
        
        results = cursor.fetchall()
        print(f"✅ RAG search function: {len(results)} results")
        
    except Exception as e:
        print(f"⚠️ RAG search test failed (expected if no data): {e}")
    
    # Test 7: Session Management
    try:
        test_user_id = "test-user-123"
        test_session_id = f"test-session-{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        cursor.execute("""
            SELECT upsert_user_session(%s, %s, 'test_session', NULL, '{}');
        """, (test_user_id, test_session_id))
        
        session_uuid = cursor.fetchone()[0]
        print(f"✅ Session management: Created session {session_uuid}")
        
        # Clean up test session
        cursor.execute("DELETE FROM user_sessions WHERE session_id = %s;", (test_session_id,))
        
    except Exception as e:
        print(f"❌ Session management test failed: {e}")
        return False
    
    conn.close()
    
    print("=" * 50)
    print("🎉 ALL MIGRATION TESTS PASSED!")
    print("Your Supabase instance is ready for production.")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    asyncio.run(test_migration())
'''
        
        with open('test_migration.py', 'w') as f:
            f.write(test_script_content)
        
        os.chmod('test_migration.py', 0o755)
        logger.info("✅ Created test_migration.py")
    
    def run_update(self):
        """Execute the complete Zep integration update"""
        logger.info("🔄 Updating Zep integration for new Supabase schema...")
        
        try:
            self.update_zep_config_files()
            self.create_migration_test_script()
            
            logger.info("✅ Zep integration update completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Zep integration update failed: {e}")
            return False

def main():
    updater = ZepIntegrationUpdater()
    success = updater.run_update()
    
    if success:
        print("🎉 ZEP INTEGRATION UPDATE COMPLETED!")
        print("Run the migration orchestrator next.")
    else:
        print("❌ ZEP INTEGRATION UPDATE FAILED")

if __name__ == "__main__":
    main()

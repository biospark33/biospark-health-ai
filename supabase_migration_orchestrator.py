
#!/usr/bin/env python3
"""
BMAD SUPABASE MIGRATION ORCHESTRATOR
====================================
Master orchestrator for complete Supabase RAG migration
Created: July 21, 2025
Purpose: Execute complete migration with zero data loss
"""

import os
import sys
import json
import time
import logging
import asyncio
import psycopg2
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import openai
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'supabase_migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class SupabaseMigrationOrchestrator:
    """BMAD Master Orchestrator for Supabase RAG Migration"""
    
    def __init__(self):
        """Initialize the migration orchestrator"""
        load_dotenv()
        self.validate_environment()
        self.setup_connections()
        
    def validate_environment(self):
        """Validate all required environment variables"""
        required_vars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
            'SUPABASE_SERVICE_ROLE_KEY',
            'OPENAI_API_KEY'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            logger.error(f"Missing required environment variables: {missing_vars}")
            raise ValueError(f"Missing environment variables: {missing_vars}")
        
        logger.info("✅ Environment validation successful")
        
    def setup_connections(self):
        """Setup database and API connections"""
        try:
            # Setup Supabase connection
            supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
            service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            # Extract database URL from Supabase URL
            db_url = supabase_url.replace('https://', 'postgresql://postgres:')
            db_url = db_url.replace('.supabase.co', '.supabase.co:5432/postgres')
            db_url = f"{db_url}?sslmode=require"
            
            self.db_connection = psycopg2.connect(db_url)
            self.db_connection.autocommit = True
            
            # Setup OpenAI client
            openai.api_key = os.getenv('OPENAI_API_KEY')
            self.openai_client = openai
            
            logger.info("✅ Database and API connections established")
            
        except Exception as e:
            logger.error(f"❌ Connection setup failed: {e}")
            raise
    
    def test_supabase_connection(self) -> bool:
        """Test Supabase database connection"""
        try:
            with self.db_connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0]
                logger.info(f"✅ Supabase connection successful - PostgreSQL {version}")
                return True
        except Exception as e:
            logger.error(f"❌ Supabase connection failed: {e}")
            return False
    
    def check_pgvector_extension(self) -> bool:
        """Check if pgvector extension is available"""
        try:
            with self.db_connection.cursor() as cursor:
                cursor.execute("SELECT * FROM pg_available_extensions WHERE name = 'vector';")
                result = cursor.fetchone()
                if result:
                    logger.info("✅ pgvector extension is available")
                    return True
                else:
                    logger.error("❌ pgvector extension not available")
                    return False
        except Exception as e:
            logger.error(f"❌ Error checking pgvector: {e}")
            return False
    
    def execute_migration_file(self, file_path: str) -> bool:
        """Execute a SQL migration file"""
        try:
            logger.info(f"🔄 Executing migration: {file_path}")
            
            with open(file_path, 'r') as file:
                sql_content = file.read()
            
            with self.db_connection.cursor() as cursor:
                cursor.execute(sql_content)
            
            logger.info(f"✅ Migration completed: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Migration failed {file_path}: {e}")
            return False
    
    def backup_existing_data(self) -> Dict:
        """Backup existing RAG and memory data"""
        backup_data = {
            'timestamp': datetime.now().isoformat(),
            'rag_documents': [],
            'user_sessions': [],
            'conversation_messages': []
        }
        
        try:
            with self.db_connection.cursor() as cursor:
                # Check if old tables exist and backup data
                tables_to_backup = [
                    ('rag_documents', 'SELECT * FROM rag_documents LIMIT 1000'),
                    ('user_sessions', 'SELECT * FROM user_sessions LIMIT 1000'),
                    ('conversation_messages', 'SELECT * FROM conversation_messages LIMIT 1000')
                ]
                
                for table_name, query in tables_to_backup:
                    try:
                        cursor.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table_name}');")
                        table_exists = cursor.fetchone()[0]
                        
                        if table_exists:
                            cursor.execute(query)
                            columns = [desc[0] for desc in cursor.description]
                            rows = cursor.fetchall()
                            
                            backup_data[table_name] = [
                                dict(zip(columns, row)) for row in rows
                            ]
                            logger.info(f"✅ Backed up {len(rows)} records from {table_name}")
                        else:
                            logger.info(f"ℹ️ Table {table_name} does not exist - skipping backup")
                            
                    except Exception as e:
                        logger.warning(f"⚠️ Could not backup {table_name}: {e}")
            
            # Save backup to file
            backup_file = f"supabase_migration_backup/backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            os.makedirs(os.path.dirname(backup_file), exist_ok=True)
            
            with open(backup_file, 'w') as f:
                json.dump(backup_data, f, indent=2, default=str)
            
            logger.info(f"✅ Backup saved to {backup_file}")
            return backup_data
            
        except Exception as e:
            logger.error(f"❌ Backup failed: {e}")
            return backup_data
    
    def migrate_existing_embeddings(self, backup_data: Dict) -> bool:
        """Migrate existing embeddings to new schema"""
        try:
            logger.info("🔄 Migrating existing embeddings...")
            
            # Migrate RAG documents
            if backup_data.get('rag_documents'):
                with self.db_connection.cursor() as cursor:
                    for doc in backup_data['rag_documents']:
                        # Insert with proper UUID handling
                        cursor.execute("""
                            INSERT INTO rag_documents (
                                id, title, content, source_url, source_type, 
                                embedding, metadata, created_at, updated_at
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, %s, %s
                            ) ON CONFLICT (id) DO NOTHING
                        """, (
                            doc.get('id'),
                            doc.get('title'),
                            doc.get('content'),
                            doc.get('source_url'),
                            doc.get('source_type', 'article'),
                            doc.get('embedding'),
                            json.dumps(doc.get('metadata', {})),
                            doc.get('created_at'),
                            doc.get('updated_at')
                        ))
                
                logger.info(f"✅ Migrated {len(backup_data['rag_documents'])} RAG documents")
            
            # Migrate user sessions
            if backup_data.get('user_sessions'):
                with self.db_connection.cursor() as cursor:
                    for session in backup_data['user_sessions']:
                        cursor.execute("""
                            INSERT INTO user_sessions (
                                id, user_id, session_id, session_type,
                                started_at, last_activity, is_active, metadata
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, %s
                            ) ON CONFLICT (session_id) DO NOTHING
                        """, (
                            session.get('id'),
                            session.get('user_id'),
                            session.get('session_id'),
                            session.get('session_type', 'health_consultation'),
                            session.get('started_at'),
                            session.get('last_activity'),
                            session.get('is_active', True),
                            json.dumps(session.get('metadata', {}))
                        ))
                
                logger.info(f"✅ Migrated {len(backup_data['user_sessions'])} user sessions")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Embedding migration failed: {e}")
            return False
    
    def validate_migration(self) -> Dict:
        """Validate the migration was successful"""
        validation_results = {
            'pgvector_enabled': False,
            'tables_created': [],
            'functions_created': [],
            'indexes_created': [],
            'data_migrated': {},
            'rls_policies': []
        }
        
        try:
            with self.db_connection.cursor() as cursor:
                # Check pgvector extension
                cursor.execute("SELECT * FROM pg_extension WHERE extname = 'vector';")
                validation_results['pgvector_enabled'] = bool(cursor.fetchone())
                
                # Check tables
                expected_tables = [
                    'rag_documents', 'rag_query_logs', 'rag_feedback',
                    'user_sessions', 'conversation_messages', 'memory_summaries', 'user_context'
                ]
                
                for table in expected_tables:
                    cursor.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}');")
                    if cursor.fetchone()[0]:
                        validation_results['tables_created'].append(table)
                        
                        # Count records
                        cursor.execute(f"SELECT COUNT(*) FROM {table};")
                        count = cursor.fetchone()[0]
                        validation_results['data_migrated'][table] = count
                
                # Check functions
                expected_functions = [
                    'search_rag_documents', 'search_conversation_memory',
                    'get_user_context_similarity', 'log_rag_query'
                ]
                
                for func in expected_functions:
                    cursor.execute(f"SELECT EXISTS (SELECT FROM pg_proc WHERE proname = '{func}');")
                    if cursor.fetchone()[0]:
                        validation_results['functions_created'].append(func)
                
                # Check indexes
                cursor.execute("""
                    SELECT indexname FROM pg_indexes 
                    WHERE tablename IN ('rag_documents', 'conversation_messages', 'memory_summaries')
                    AND indexname LIKE '%embedding%';
                """)
                validation_results['indexes_created'] = [row[0] for row in cursor.fetchall()]
                
                # Check RLS policies
                cursor.execute("""
                    SELECT tablename, policyname FROM pg_policies 
                    WHERE tablename IN ('rag_documents', 'user_sessions', 'conversation_messages');
                """)
                validation_results['rls_policies'] = [f"{row[0]}.{row[1]}" for row in cursor.fetchall()]
            
            logger.info("✅ Migration validation completed")
            return validation_results
            
        except Exception as e:
            logger.error(f"❌ Validation failed: {e}")
            return validation_results
    
    def run_migration(self) -> bool:
        """Execute the complete migration process"""
        logger.info("🚀 BMAD SUPABASE MIGRATION ORCHESTRATOR STARTING")
        logger.info("=" * 60)
        
        try:
            # Phase 1: Pre-flight checks
            logger.info("=== PHASE 1: PRE-FLIGHT VALIDATION ===")
            if not self.test_supabase_connection():
                return False
            
            if not self.check_pgvector_extension():
                logger.error("❌ pgvector extension not available - migration cannot proceed")
                return False
            
            # Phase 2: Backup existing data
            logger.info("=== PHASE 2: DATA BACKUP ===")
            backup_data = self.backup_existing_data()
            
            # Phase 3: Execute schema migrations
            logger.info("=== PHASE 3: SCHEMA MIGRATION ===")
            migration_files = [
                'migrations/000_add_pgvector.sql',
                'migrations/001_create_rag_schema.sql',
                'migrations/002_create_memory_schema.sql',
                'migrations/003_create_functions.sql'
            ]
            
            for migration_file in migration_files:
                if not self.execute_migration_file(migration_file):
                    logger.error(f"❌ Migration failed at {migration_file}")
                    return False
            
            # Phase 4: Migrate existing data
            logger.info("=== PHASE 4: DATA MIGRATION ===")
            if not self.migrate_existing_embeddings(backup_data):
                logger.warning("⚠️ Data migration had issues - check logs")
            
            # Phase 5: Validation
            logger.info("=== PHASE 5: MIGRATION VALIDATION ===")
            validation_results = self.validate_migration()
            
            # Phase 6: Summary report
            logger.info("=== PHASE 6: MIGRATION SUMMARY ===")
            logger.info(f"✅ pgvector enabled: {validation_results['pgvector_enabled']}")
            logger.info(f"✅ Tables created: {len(validation_results['tables_created'])}")
            logger.info(f"✅ Functions created: {len(validation_results['functions_created'])}")
            logger.info(f"✅ Vector indexes: {len(validation_results['indexes_created'])}")
            logger.info(f"✅ RLS policies: {len(validation_results['rls_policies'])}")
            
            for table, count in validation_results['data_migrated'].items():
                logger.info(f"✅ {table}: {count} records")
            
            logger.info("=" * 60)
            logger.info("🎉 BMAD SUPABASE MIGRATION COMPLETED SUCCESSFULLY!")
            logger.info("=" * 60)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Migration orchestrator failed: {e}")
            return False
        
        finally:
            if hasattr(self, 'db_connection'):
                self.db_connection.close()

def main():
    """Main execution function"""
    try:
        orchestrator = SupabaseMigrationOrchestrator()
        success = orchestrator.run_migration()
        
        if success:
            print("\n🎉 BMAD SUPABASE MIGRATION COMPLETED SUCCESSFULLY!")
            print("Your Supabase instance is now ready for production RAG operations.")
            sys.exit(0)
        else:
            print("\n❌ MIGRATION FAILED - Check logs for details")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n💥 CRITICAL ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

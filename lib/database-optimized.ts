import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export function getDatabaseConnection(): PrismaClient {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL or SUPABASE_DATABASE_URL environment variable is required');
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });

    // Connection event handlers
    prisma.$connect()
      .then(() => {
        console.log('✅ Database connection established successfully');
      })
      .catch((error) => {
        console.error('❌ Unable to connect to database:', error);
        // Don't throw during build time
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Database error in development - continuing without database');
        }
      });
  }

  return prisma;
}

// Safe database operations
export async function safeDatabaseQuery(query: string, values?: any[]): Promise<any> {
  try {
    const db = getDatabaseConnection();
    return await db.$queryRawUnsafe(query, ...(values || []));
  } catch (error) {
    console.error('Database query failed:', error);
    return null;
  }
}

// Connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = getDatabaseConnection();
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  if (prisma) {
    try {
      await prisma.$disconnect();
      prisma = null;
      console.log('✅ Database connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }
}

// Batch operations to prevent connection pool exhaustion
export async function batchedPromiseAll<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(item => fn(item)));
    results.push(...batchResults);
    
    // Small delay between batches to prevent overwhelming the pool
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// Transaction wrapper with retry logic
export async function safeTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
  maxRetries: number = 3
): Promise<T | null> {
  const db = getDatabaseConnection();
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        return await callback(tx as PrismaClient);
      });
    } catch (error) {
      lastError = error as Error;
      console.warn(`Transaction attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All transaction attempts failed:', lastError);
  return null;
}

export default getDatabaseConnection;

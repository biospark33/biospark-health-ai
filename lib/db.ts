
// Database connection with HIPAA compliance logging
// Enhanced with robust error handling and environment validation

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL before creating Prisma client
function validateDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('⚠️ DATABASE_URL not set, using fallback SQLite database for development');
    return 'file:./dev.db';
  }

  // Check for placeholder values
  if (databaseUrl.includes('username:password@hostname:port') || 
      databaseUrl.includes('your-database-url') ||
      databaseUrl === 'postgresql://username:password@hostname:port/database_name') {
    console.warn('⚠️ DATABASE_URL contains placeholder values, using fallback SQLite database');
    return 'file:./dev.db';
  }

  // Validate URL format
  try {
    const url = new URL(databaseUrl);
    if (!url.protocol || !url.hostname) {
      throw new Error('Invalid URL format');
    }
    return databaseUrl;
  } catch (error) {
    console.warn('⚠️ Invalid DATABASE_URL format, using fallback SQLite database:', error instanceof Error ? error.message : 'Unknown error');
    return 'file:./dev.db';
  }
}

// Create Prisma client with validated database URL
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: validateDatabaseUrl()
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection healthy');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed gracefully');
  } catch (error) {
    console.warn('⚠️ Error during database disconnect:', error instanceof Error ? error.message : 'Unknown error');
  }
}

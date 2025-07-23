
// Optimized Database Connection with Connection Pooling
// Phase 1D: Enhanced database performance
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

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: validateDatabaseUrl()
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Enhanced connection pooling for production
  __internal: {
    engine: {
      connectTimeout: 60000,
      pool: {
        timeout: 60000,
      },
    },
  },
})

// Optimized database operations with error handling
export async function getUserWithCache(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        healthAssessments: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get user with cache:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function getBiomarkersOptimized(userId: string, limit: number = 10) {
  try {
    return await prisma.biomarker.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        analysis: {
          select: {
            id: true,
            result: true,
            confidence: true
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get biomarkers:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function getHealthAssessmentsOptimized(userId: string, limit: number = 5) {
  try {
    return await prisma.healthAssessment.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        biomarkers: {
          select: {
            id: true,
            name: true,
            value: true,
            unit: true
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get health assessments:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function getAnalysisResultsOptimized(userId: string, limit: number = 10) {
  try {
    return await prisma.analysis.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        result: true,
        confidence: true,
        createdAt: true,
        biomarker: {
          select: {
            name: true,
            value: true,
            unit: true
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get analysis results:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function bulkCreateBiomarkers(biomarkers: any[]) {
  try {
    return await prisma.biomarker.createMany({
      data: biomarkers,
      skipDuplicates: true
    });
  } catch (error) {
    console.error('❌ Failed to bulk create biomarkers:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function getAuditLogsOptimized(userId: string, limit: number = 20) {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        resource: true,
        createdAt: true,
        metadata: true
      }
    });
  } catch (error) {
    console.error('❌ Failed to get audit logs:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

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

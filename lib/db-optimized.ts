
// Optimized Database Connection with Connection Pooling
// Phase 1D: Enhanced database performance

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pooling optimization
  __internal: {
    engine: {
      // Connection pool settings for better performance
      connectionLimit: 20,
      poolTimeout: 10000,
      transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
      }
    }
  }
})

// Optimized query helpers with caching integration
export class OptimizedQueries {
  
  // Optimized user lookup with caching
  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        userStats: true,
        // Only include recent assessments for performance
        healthAssessments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            assessmentType: true,
            overallScore: true,
            createdAt: true,
            status: true
          }
        }
      }
    });
  }

  // Optimized biomarker queries with pagination
  static async getUserBiomarkers(userId: string, limit: number = 50, offset: number = 0) {
    return await prisma.biomarker.findMany({
      where: { userId },
      orderBy: { testDate: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        value: true,
        unit: true,
        category: true,
        status: true,
        testDate: true,
        optimalMin: true,
        optimalMax: true
      }
    });
  }

  // Optimized health assessment queries
  static async getUserHealthAssessments(userId: string, limit: number = 10) {
    return await prisma.healthAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        assessmentType: true,
        overallScore: true,
        energyLevel: true,
        metabolicHealth: true,
        status: true,
        createdAt: true,
        keyFindings: true
      }
    });
  }

  // Optimized analysis queries with minimal data
  static async getRecentAnalyses(userId: string, limit: number = 5) {
    return await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        summary: true
      }
    });
  }

  // Batch operations for better performance
  static async createBiomarkersBatch(biomarkers: any[]) {
    return await prisma.biomarker.createMany({
      data: biomarkers,
      skipDuplicates: true
    });
  }

  // Optimized audit log queries with pagination
  static async getAuditLogs(userId?: string, limit: number = 100, offset: number = 0) {
    const where = userId ? { userId } : {};
    
    return await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        eventType: true,
        resource: true,
        action: true,
        timestamp: true,
        success: true,
        riskLevel: true
      }
    });
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Connection health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
}

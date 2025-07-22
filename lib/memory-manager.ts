import { zepClient, LabInsightZepClient } from './zep-client';
import { prisma } from './prisma';

export interface HealthAnalysisMemory {
  sessionId: string;
  userId: string;
  timestamp: Date;
  analysisType: 'lab_results' | 'symptoms' | 'general_health';
  inputData: {
    labResults?: any;
    symptoms?: string[];
    userQuery?: string;
  };
  analysisResult: {
    insights: string[];
    recommendations: string[];
    riskFactors: string[];
    followUpSuggestions: string[];
  };
  context: {
    previousAnalyses: string[];
    userPreferences: any;
    healthGoals: string[];
  };
  metadata: {
    confidence: number;
    sources: string[];
    processingTime: number;
  };
}

export interface MemoryContext {
  relevantAnalyses: HealthAnalysisMemory[];
  conversationHistory: any[];
  userPreferences: any;
  healthGoals: string[];
  riskFactors: string[];
}

export class MemoryManager {
  private zepClient: LabInsightZepClient;

  constructor(zepClientInstance?: LabInsightZepClient) {
    this.zepClient = zepClientInstance || zepClient;
  }

  /**
   * Store health analysis in memory with HIPAA compliance
   */
  async storeHealthAnalysis(analysis: HealthAnalysisMemory): Promise<void> {
    try {
      // Validate HIPAA compliance
      await this.validateHIPAACompliance(analysis);
      
      // Store in Zep memory
      await this.zepClient.storeHealthAnalysisMemory(
        analysis.sessionId,
        analysis,
        {
          analysisType: analysis.analysisType,
          timestamp: analysis.timestamp.toISOString(),
          confidence: analysis.metadata.confidence
        }
      );

      // Store session reference in database
      await this.storeSessionReference(analysis);

      // Log for audit trail
      await this.auditLog('store_health_analysis', analysis);

      console.log(`✅ Health analysis stored in memory: ${analysis.sessionId}`);
    } catch (error) {
      console.error("❌ Failed to store health analysis:", error);
      throw new Error(`Failed to store health analysis: ${error}`);
    }
  }

  /**
   * Retrieve relevant memory context for health analysis
   */
  async getRelevantContext(
    sessionId: string,
    query: string,
    userId: string
  ): Promise<MemoryContext> {
    try {
      // Get relevant memories from Zep
      const relevantMemories = await this.zepClient.getRelevantContext(
        sessionId,
        query,
        5
      );

      // Get conversation history
      const conversationHistory = await this.zepClient.getConversationHistory(sessionId);

      // Get user preferences from database
      const userPreferences = await this.getUserPreferences(userId);

      // Build comprehensive context
      const context: MemoryContext = {
        relevantAnalyses: relevantMemories.map(memory => memory.decryptedData).filter(Boolean),
        conversationHistory,
        userPreferences,
        healthGoals: userPreferences?.healthGoals || [],
        riskFactors: this.extractRiskFactors(relevantMemories)
      };

      console.log(`✅ Memory context retrieved for session: ${sessionId}`);
      return context;
    } catch (error) {
      console.error("❌ Failed to get memory context:", error);
      throw new Error(`Failed to get memory context: ${error}`);
    }
  }

  /**
   * Create or get user session
   */
  async createOrGetUserSession(userId: string): Promise<string> {
    try {
      // Check for existing active session
      const existingSession = await prisma.zepSession.findFirst({
        where: {
          userId,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existingSession) {
        console.log(`✅ Using existing session: ${existingSession.sessionId}`);
        return existingSession.sessionId;
      }

      // Create new Zep session
      const sessionId = await this.zepClient.createUserSession(userId);

      // Store session in database
      await prisma.zepSession.create({
        data: {
          userId,
          sessionId,
          zepUserId: sessionId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          metadata: {
            platform: 'labinsight-ai',
            createdAt: new Date().toISOString()
          }
        }
      });

      console.log(`✅ New session created: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error("❌ Failed to create/get user session:", error);
      throw new Error(`Failed to create/get user session: ${error}`);
    }
  }

  /**
   * Update user preferences in memory
   */
  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      // Get active session
      const sessionId = await this.createOrGetUserSession(userId);

      // Update session metadata with preferences
      await this.zepClient.updateSessionMetadata(sessionId, {
        userPreferences: preferences,
        lastPreferenceUpdate: new Date().toISOString()
      });

      // Update database
      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: preferences,
          updatedAt: new Date()
        }
      });

      console.log(`✅ User preferences updated: ${userId}`);
    } catch (error) {
      console.error("❌ Failed to update user preferences:", error);
      throw new Error(`Failed to update user preferences: ${error}`);
    }
  }

  /**
   * Get user health journey from memory
   */
  async getUserHealthJourney(userId: string): Promise<HealthAnalysisMemory[]> {
    try {
      const sessionId = await this.createOrGetUserSession(userId);
      
      // Get all health analysis memories for user
      const memories = await this.zepClient.getRelevantContext(
        sessionId,
        "health analysis history journey",
        20
      );

      const healthJourney = memories
        .map(memory => memory.decryptedData)
        .filter(Boolean)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      console.log(`✅ Health journey retrieved: ${healthJourney.length} analyses`);
      return healthJourney;
    } catch (error) {
      console.error("❌ Failed to get health journey:", error);
      throw new Error(`Failed to get health journey: ${error}`);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Get expired sessions from database
      const expiredSessions = await prisma.zepSession.findMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });

      // Delete from Zep and database
      for (const session of expiredSessions) {
        try {
          await this.zepClient.deleteUserSession(session.sessionId);
        } catch (error) {
          console.warn(`⚠️ Failed to delete Zep session ${session.sessionId}:`, error);
        }

        await prisma.zepSession.delete({
          where: { id: session.id }
        });
      }

      console.log(`✅ Cleaned up ${expiredSessions.length} expired sessions`);
    } catch (error) {
      console.error("❌ Failed to cleanup expired sessions:", error);
      throw new Error(`Failed to cleanup expired sessions: ${error}`);
    }
  }

  /**
   * Validate HIPAA compliance for memory operations
   */
  private async validateHIPAACompliance(data: any): Promise<void> {
    // Implement HIPAA validation logic
    if (!data.sessionId || !data.userId) {
      throw new Error("HIPAA Violation: Missing required identifiers");
    }

    // Check for PHI in data
    const hasPHI = this.detectPHI(data);
    if (hasPHI && !data.metadata?.hipaaCompliant) {
      throw new Error("HIPAA Violation: PHI detected without compliance flag");
    }
  }

  /**
   * Detect Protected Health Information (PHI)
   */
  private detectPHI(data: any): boolean {
    const phiPatterns = [
      /\d{3}-\d{2}-\d{4}/, // SSN
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/, // Email
      /\d{3}-\d{3}-\d{4}/, // Phone
      /\d{1,2}\/\d{1,2}\/\d{4}/ // Date
    ];

    const dataString = JSON.stringify(data);
    return phiPatterns.some(pattern => pattern.test(dataString));
  }

  /**
   * Store session reference in database
   */
  private async storeSessionReference(analysis: HealthAnalysisMemory): Promise<void> {
    try {
      await prisma.zepSession.upsert({
        where: { sessionId: analysis.sessionId },
        update: {
          updatedAt: new Date(),
          metadata: {
            lastAnalysis: analysis.timestamp.toISOString(),
            analysisCount: { increment: 1 }
          }
        },
        create: {
          userId: analysis.userId,
          sessionId: analysis.sessionId,
          zepUserId: analysis.sessionId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: {
            firstAnalysis: analysis.timestamp.toISOString(),
            analysisCount: 1
          }
        }
      });
    } catch (error) {
      console.warn("⚠️ Failed to store session reference:", error);
    }
  }

  /**
   * Get user preferences from database
   */
  private async getUserPreferences(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true }
      });
      return user?.preferences || {};
    } catch (error) {
      console.warn("⚠️ Failed to get user preferences:", error);
      return {};
    }
  }

  /**
   * Extract risk factors from memory data
   */
  private extractRiskFactors(memories: any[]): string[] {
    const riskFactors = new Set<string>();
    
    memories.forEach(memory => {
      if (memory.decryptedData?.analysisResult?.riskFactors) {
        memory.decryptedData.analysisResult.riskFactors.forEach((factor: string) => {
          riskFactors.add(factor);
        });
      }
    });

    return Array.from(riskFactors);
  }

  /**
   * Audit log for HIPAA compliance
   */
  private async auditLog(action: string, data: any): Promise<void> {
    try {
      await prisma.memoryAuditLog.create({
        data: {
          sessionId: data.sessionId,
          operation: action,
          dataType: 'health_analysis',
          userId: data.userId,
          timestamp: new Date(),
          metadata: {
            analysisType: data.analysisType,
            confidence: data.metadata?.confidence
          }
        }
      });
    } catch (error) {
      console.warn("⚠️ Failed to create audit log:", error);
    }
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

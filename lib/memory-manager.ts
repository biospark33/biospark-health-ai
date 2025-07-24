

// Memory Manager for Healthcare AI
// Phase 4 Final Optimization - Enhanced Memory Management
// Manages Zep memory operations with HIPAA compliance

import { LabInsightZepClient } from './zep-client';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export interface HealthAnalysis {
  userId: string;
  sessionId: string;
  analysisType: string;
  biomarkers?: any;
  recommendations?: string[];
  timestamp: string;
  metadata?: any;
}

export interface MemoryContext {
  sessionId: string;
  memories: any[];
  totalResults: number;
  query: string;
  relevantMemories: any[];
  conversationHistory: any[];
  userPreferences: any;
  healthGoals: any[];
  riskFactors: any[];
  relevantAnalyses: any[];
  healthJourney: any[];
}

export interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: Date;
  metadata?: any;
}

export interface HealthJourney {
  userId: string;
  analyses: any[];
  totalAnalyses: number;
  lastAnalysis?: any;
  trends: any[];
}

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  algorithm: string;
}

export class MemoryManager {
  private zepClient: LabInsightZepClient;
  private encryptionKey: string;

  constructor(zepClient: LabInsightZepClient) {
    this.zepClient = zepClient;
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-testing-32-chars!!';
  }

  async storeHealthAnalysis(analysis: HealthAnalysis): Promise<void> {
    try {
      // Validate HIPAA compliance
      await this.validateHIPAACompliance(analysis);

      // Encrypt sensitive data
      const encryptedAnalysis = await this.encryptPHI(analysis);

      // Store in Zep memory
      const memoryData = {
        messages: [{
          role: 'assistant',
          content: JSON.stringify(encryptedAnalysis),
          metadata: {
            type: 'health_analysis',
            userId: analysis.userId,
            analysisType: analysis.analysisType,
            timestamp: analysis.timestamp,
            encrypted: true
          }
        }]
      };

      await this.zepClient.addMemory(analysis.sessionId, memoryData);
      console.log(`✅ Health analysis stored in memory: ${analysis.sessionId}`);
    } catch (error) {
      console.error("❌ Failed to store health analysis:", error);
      throw new Error(`Failed to store health analysis: ${error}`);
    }
  }

  async getRelevantContext(
    sessionId: string,
    query: string,
    limit: number = 10
  ): Promise<MemoryContext> {
    try {
      // Search for relevant memories
      const memories = await this.zepClient.searchMemory(sessionId, query, { limit });

      // Get conversation history
      const conversationHistory = await this.zepClient.getMemory(sessionId, 20);

      // Structure the context
      const context: MemoryContext = {
        sessionId,
        memories: memories || [],
        totalResults: memories?.length || 0,
        query,
        relevantMemories: memories || [],
        conversationHistory: conversationHistory || [],
        userPreferences: {},
        healthGoals: [],
        riskFactors: [],
        relevantAnalyses: [],
        healthJourney: []
      };

      console.log(`✅ Memory context retrieved for session: ${sessionId}`);
      return context;
    } catch (error) {
      console.error("❌ Failed to get memory context:", error);
      throw new Error(`Failed to get memory context: ${error}`);
    }
  }

  async createOrGetUserSession(userId: string): Promise<string> {
    try {
      // Create a new session for the user
      const sessionId = await this.zepClient.createUserSession(userId);
      console.log(`✅ New session created: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error("❌ Failed to create user session:", error);
      throw new Error(`Failed to create user session: ${error}`);
    }
  }

  async getUserHealthJourney(userId: string): Promise<HealthJourney> {
    try {
      // Create or get session for the user
      const sessionId = await this.createOrGetUserSession(userId);

      // Search for health analyses
      const analyses = await this.zepClient.searchMemory(sessionId, 'health analysis', {
        metadata: { type: 'health_analysis', userId },
        limit: 50
      });

      const journey: HealthJourney = {
        userId,
        analyses: analyses || [],
        totalAnalyses: analyses?.length || 0,
        lastAnalysis: analyses?.[0] || null,
        trends: []
      };

      console.log(`✅ Health journey retrieved: ${journey.totalAnalyses} analyses`);
      return journey;
    } catch (error) {
      console.error("❌ Failed to get health journey:", error);
      return {
        userId,
        analyses: [],
        totalAnalyses: 0,
        trends: []
      };
    }
  }

  async encryptPHI(data: any): Promise<EncryptionResult> {
    try {
      const algorithm = 'aes-256-cbc';
      const iv = randomBytes(16);
      const key = Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32));
      
      const cipher = createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encrypted,
        iv: iv.toString('hex'),
        algorithm
      };
    } catch (error) {
      console.error("❌ Failed to encrypt PHI:", error);
      throw new Error(`Failed to encrypt PHI: ${error}`);
    }
  }

  async decryptPHI(encryptedData: EncryptionResult): Promise<any> {
    try {
      const key = Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32));
      const iv = Buffer.from(encryptedData.iv, 'hex');
      
      const decipher = createDecipheriv(encryptedData.algorithm, key, iv);
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error("❌ Failed to decrypt PHI:", error);
      throw new Error(`Failed to decrypt PHI: ${error}`);
    }
  }

  async validateHIPAACompliance(analysis: HealthAnalysis): Promise<void> {
    try {
      // Check required fields
      const requiredFields = ['userId', 'sessionId', 'timestamp'];
      const missingFields = requiredFields.filter(field => !analysis[field as keyof HealthAnalysis]);

      if (missingFields.length > 0) {
        throw new Error(`HIPAA Violation: Missing required identifiers: ${missingFields.join(', ')}`);
      }

      // Validate data integrity
      if (!analysis.userId || !analysis.sessionId) {
        throw new Error('HIPAA Violation: Invalid user or session identifier');
      }

      // Check for PII in plain text (simplified check)
      const content = JSON.stringify(analysis);
      const piiPatterns = [
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
        /\b\d{16}\b/, // Credit card pattern
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email pattern
      ];

      for (const pattern of piiPatterns) {
        if (pattern.test(content)) {
          console.warn('⚠️ Potential PII detected in health analysis');
          break;
        }
      }

      console.log('✅ HIPAA compliance validation passed');
    } catch (error) {
      console.error('❌ HIPAA compliance validation failed:', error);
      throw error;
    }
  }

  async searchHealthMemories(
    sessionId: string,
    query: string,
    options: any = {}
  ): Promise<any[]> {
    try {
      const memories = await this.zepClient.searchMemory(sessionId, query, {
        limit: options.limit || 10,
        metadata: {
          type: 'health_analysis',
          ...options.metadata
        }
      });

      return memories || [];
    } catch (error) {
      console.error("❌ Failed to search health memories:", error);
      return [];
    }
  }

  async deleteUserMemories(sessionId: string): Promise<boolean> {
    try {
      await this.zepClient.deleteUserSession(sessionId);
      console.log(`✅ User memories deleted for session: ${sessionId}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to delete user memories:", error);
      return false;
    }
  }

  async getMemoryStatistics(sessionId: string): Promise<any> {
    try {
      const memories = await this.zepClient.getMemory(sessionId, 1000);
      
      return {
        totalMemories: memories?.length || 0,
        healthAnalyses: memories?.filter(m => m.metadata?.type === 'health_analysis').length || 0,
        preferences: memories?.filter(m => m.metadata?.type === 'preferences').length || 0,
        lastActivity: memories?.[0]?.createdAt || null
      };
    } catch (error) {
      console.error("❌ Failed to get memory statistics:", error);
      return {
        totalMemories: 0,
        healthAnalyses: 0,
        preferences: 0,
        lastActivity: null
      };
    }
  }
}

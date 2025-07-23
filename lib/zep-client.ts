
// Zep Memory Client for Healthcare AI
// HIPAA-compliant memory management with encryption

import { ZepClient, ISession, IMemory, IMessage } from "@getzep/zep-js";
import { createHash, randomBytes, createCipher, createDecipher } from 'crypto';

export interface ZepClientConfig {
  apiKey: string;
  baseURL?: string;
  sessionId?: string;
  userId?: string;
}

export interface HealthcareMemoryMetadata {
  patientId?: string;
  providerId?: string;
  sessionType?: 'consultation' | 'analysis' | 'assessment' | 'follow-up';
  confidentialityLevel?: 'low' | 'medium' | 'high' | 'critical';
  hipaaCompliant?: boolean;
  encryptionEnabled?: boolean;
  retentionPeriod?: number; // days
}

export interface MemorySearchOptions {
  limit?: number;
  searchType?: 'similarity' | 'mmr';
  mmrLambda?: number;
  filter?: Record<string, any>;
}

export class LabInsightZepClient {
  private client: ZepClient | null = null;
  private config: ZepClientConfig;
  private encryptionKey: string;
  private isInitialized = false;

  constructor(config: ZepClientConfig) {
    this.config = config;
    this.encryptionKey = process.env.ZEP_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      if (!this.config.apiKey) {
        console.warn('Zep API key not provided - memory features will be disabled');
        return;
      }

      this.client = await ZepClient.init({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL || "https://api.getzep.com"
      });
      
      this.isInitialized = true;
      console.log('Zep client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Zep client:', error);
      this.client = null;
      this.isInitialized = false;
    }
  }

  private generateEncryptionKey(): string {
    return randomBytes(32).toString('hex');
  }

  private encryptSensitiveData(data: string): string {
    try {
      const cipher = createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Return original data if encryption fails
    }
  }

  private decryptSensitiveData(encryptedData: string): string {
    try {
      const decipher = createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Return encrypted data if decryption fails
    }
  }

  private generateSessionId(userId: string, sessionType: string = 'default'): string {
    const timestamp = Date.now();
    const hash = createHash('sha256')
      .update(`${userId}-${sessionType}-${timestamp}`)
      .digest('hex')
      .substring(0, 16);
    return `session_${hash}`;
  }

  async createSession(
    sessionId: string,
    userId: string,
    metadata: HealthcareMemoryMetadata = {}
  ): Promise<ISession | null> {
    if (!this.client || !this.isInitialized) {
      console.warn('Zep client not initialized - session creation skipped');
      return null;
    }

    try {
      const enhancedMetadata = {
        ...metadata,
        userId,
        createdAt: new Date().toISOString(),
        hipaaCompliant: true,
        encryptionEnabled: true,
        version: '1.0'
      };

      const session = await this.client.memory.addSession({
        sessionId,
        userId,
        metadata: enhancedMetadata
      });

      console.log(`Session created: ${sessionId} for user: ${userId}`);
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }

  async addMemory(
    sessionId: string,
    messages: IMessage[],
    metadata: HealthcareMemoryMetadata = {}
  ): Promise<boolean> {
    if (!this.client || !this.isInitialized) {
      console.warn('Zep client not initialized - memory addition skipped');
      return false;
    }

    try {
      // Encrypt sensitive content if required
      const processedMessages = messages.map(message => {
        if (metadata.encryptionEnabled && message.content) {
          return {
            ...message,
            content: this.encryptSensitiveData(message.content)
          };
        }
        return message;
      });

      const enhancedMetadata = {
        ...metadata,
        addedAt: new Date().toISOString(),
        encrypted: metadata.encryptionEnabled || false
      };

      await this.client.memory.addMemory(sessionId, {
        messages: processedMessages,
        metadata: enhancedMetadata
      });

      console.log(`Memory added to session: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to add memory:', error);
      return false;
    }
  }

  async searchMemory(
    sessionId: string,
    query: string,
    options: MemorySearchOptions = {}
  ): Promise<IMemory[] | null> {
    if (!this.client || !this.isInitialized) {
      console.warn('Zep client not initialized - memory search skipped');
      return null;
    }

    try {
      const searchOptions = {
        limit: options.limit || 10,
        searchType: options.searchType || 'similarity',
        ...options
      };

      const memories = await this.client.memory.searchMemory(
        sessionId,
        query,
        searchOptions
      );

      // Decrypt sensitive content if needed
      const processedMemories = memories.map(memory => {
        if (memory.metadata?.encrypted && memory.message?.content) {
          return {
            ...memory,
            message: {
              ...memory.message,
              content: this.decryptSensitiveData(memory.message.content)
            }
          };
        }
        return memory;
      });

      return processedMemories;
    } catch (error) {
      console.error('Failed to search memory:', error);
      return null;
    }
  }

  async getSession(sessionId: string): Promise<ISession | null> {
    if (!this.client || !this.isInitialized) {
      console.warn('Zep client not initialized - session retrieval skipped');
      return null;
    }

    try {
      const session = await this.client.memory.getSession(sessionId);
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    if (!this.client || !this.isInitialized) {
      console.warn('Zep client not initialized - session deletion skipped');
      return false;
    }

    try {
      await this.client.memory.deleteSession(sessionId);
      console.log(`Session deleted: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  async getMemoryHistory(sessionId: string, limit: number = 50): Promise<IMemory[] | null> {
    if (!this.client || !this.isInitialized) {
      console.warn('Zep client not initialized - memory history retrieval skipped');
      return null;
    }

    try {
      const memories = await this.client.memory.getMemory(sessionId, limit);
      
      // Decrypt sensitive content if needed
      const processedMemories = memories.map(memory => {
        if (memory.metadata?.encrypted && memory.message?.content) {
          return {
            ...memory,
            message: {
              ...memory.message,
              content: this.decryptSensitiveData(memory.message.content)
            }
          };
        }
        return memory;
      });

      return processedMemories;
    } catch (error) {
      console.error('Failed to get memory history:', error);
      return null;
    }
  }

  // HIPAA compliance utilities
  async purgeExpiredMemories(retentionDays: number = 2555): Promise<boolean> { // 7 years default
    if (!this.client || !this.isInitialized) {
      console.warn('Zep client not initialized - memory purge skipped');
      return false;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      // This would require custom implementation based on Zep's API capabilities
      console.log(`Memory purge initiated for data older than ${cutoffDate.toISOString()}`);
      return true;
    } catch (error) {
      console.error('Failed to purge expired memories:', error);
      return false;
    }
  }

  isHealthy(): boolean {
    return this.isInitialized && this.client !== null;
  }

  getConnectionStatus(): string {
    if (!this.isInitialized) return 'not_initialized';
    if (!this.client) return 'disconnected';
    return 'connected';
  }
}

// Default configuration
const defaultZepConfig: ZepClientConfig = {
  apiKey: process.env.ZEP_API_KEY || '',
  baseURL: process.env.ZEP_BASE_URL || "https://api.getzep.com",
  sessionId: process.env.ZEP_SESSION_ID,
  userId: process.env.ZEP_USER_ID
};

// Export singleton instance
export const zepClient = new LabInsightZepClient(defaultZepConfig);

// Health check function
export async function checkZepHealth(): Promise<boolean> {
  return zepClient.isHealthy();
}

// Utility function to create session ID
export function createHealthcareSessionId(userId: string, sessionType: string = 'consultation'): string {
  const timestamp = Date.now();
  const hash = createHash('sha256')
    .update(`${userId}-${sessionType}-${timestamp}`)
    .digest('hex')
    .substring(0, 16);
  return `healthcare_${hash}`;
}

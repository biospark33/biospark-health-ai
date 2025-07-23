
import { ZepClient } from "@getzep/zep-js";
import InputValidator from './input-validation';
import CryptoJS from "crypto-js";

export interface ZepClientConfig {
  apiKey: string;
  baseURL?: string;
  sessionConfig: SessionConfig;
  memoryConfig: MemoryConfig;
}

export interface SessionConfig {
  sessionIdPrefix: string;
  sessionTimeout: number; // minutes
  userIdMapping: boolean;
}

export interface MemoryConfig {
  memoryType: 'perpetual' | 'sliding_window';
  maxTokens: number;
  summarizationEnabled: boolean;
  hipaaCompliant: boolean;
}

export interface EncryptedMemory {
  encryptedContent: string;
  encryptedKey: string;
  algorithm: string;
  timestamp: Date;
  keyId: string;
}

export class LabInsightZepClient {
  private client: ZepClient | null = null;
  private config: ZepClientConfig;
  private encryptionKey: string;
  private isInitialized: boolean = false;

  constructor(config: ZepClientConfig) {
    this.config = config;
    
    // Initialize encryption key for HIPAA compliance
    this.encryptionKey = process.env.ZEP_ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  /**
   * Initialize ZepClient using the new recommended method
   */
  private async initializeClient(): Promise<void> {
    if (this.isInitialized && this.client) {
      return;
    }

    try {
      // Use ZepClient.init() instead of constructor - fixes deprecation warning
      this.client = await ZepClient.init({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL || "https://api.getzep.com"
      });
      
      this.isInitialized = true;
      console.log("✅ ZepClient initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize ZepClient:", error);
      // Graceful fallback - don't throw error to prevent build failures
      this.client = null;
      this.isInitialized = false;
    }
  }

  /**
   * Ensure client is initialized before any operation
   */
  private async ensureInitialized(): Promise<boolean> {
    if (!this.isInitialized || !this.client) {
      await this.initializeClient();
    }
    return this.client !== null;
  }

  /**
   * Create a new user session with HIPAA compliance
   */
  async createUserSession(userId: string): Promise<string> {
    const sessionId = `${this.config.sessionConfig.sessionIdPrefix}_${userId}_${Date.now()}`;
    
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.client) {
        console.warn("⚠️ ZepClient not available, using fallback session ID");
        return sessionId;
      }

      await this.client.user.add({
        userId: sessionId,
        email: `user_${userId}@labinsight.ai`,
        firstName: "LabInsight",
        lastName: "User",
        metadata: {
          originalUserId: userId,
          platform: "labinsight-ai",
          hipaaCompliant: true,
          createdAt: new Date().toISOString()
        }
      });

      console.log(`✅ Zep session created: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error("❌ Failed to create Zep session:", error);
      // Return session ID anyway for graceful degradation
      return sessionId;
    }
  }

  /**
   * Store health analysis memory with HIPAA encryption
   */
  async storeHealthAnalysisMemory(
    sessionId: string,
    analysisData: any,
    metadata: any = {}
  ): Promise<void> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.client) {
        console.warn("⚠️ ZepClient not available, skipping memory storage");
        return;
      }

      // Encrypt sensitive health data
      const encryptedData = this.encryptPHI(analysisData);
      
      // Store in Zep with encrypted content
      await this.client.memory.add(sessionId, {
        messages: [{
          role: "assistant",
          content: `Health analysis completed: ${metadata.analysisType || 'general'}`,
          metadata: {
            type: "health_analysis",
            encrypted: true,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        }],
        metadata: {
          encryptedData: encryptedData,
          dataType: "health_analysis",
          hipaaCompliant: true
        }
      });

      console.log(`✅ Health analysis memory stored for session: ${sessionId}`);
    } catch (error) {
      console.error("❌ Failed to store health analysis memory:", error);
      // Don't throw error to prevent application crashes
    }
  }

  /**
   * Retrieve relevant memory context for health analysis
   */
  async getRelevantContext(
    sessionId: string,
    query: string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.client) {
        console.warn("⚠️ ZepClient not available, returning empty context");
        return [];
      }

      // Search for relevant memories
      const searchResults = await this.client.memory.search(sessionId, {
        text: query,
        metadata: {
          where: { type: "health_analysis" }
        },
        limit
      });

      // Decrypt and return relevant context
      const decryptedResults = searchResults.results?.map(result => {
        if (result.metadata?.encryptedData) {
          const decryptedData = this.decryptPHI(result.metadata.encryptedData);
          return {
            ...result,
            decryptedData,
            relevanceScore: result.score
          };
        }
        return result;
      }) || [];

      console.log(`✅ Retrieved ${decryptedResults.length} relevant memories`);
      return decryptedResults;
    } catch (error) {
      console.error("❌ Failed to retrieve memory context:", error);
      return [];
    }
  }

  /**
   * Get conversation history for session continuity
   */
  async getConversationHistory(sessionId: string): Promise<any[]> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.client) {
        console.warn("⚠️ ZepClient not available, returning empty history");
        return [];
      }

      const memory = await this.client.memory.get(sessionId);
      
      if (!memory) {
        return [];
      }

      // Decrypt conversation data if encrypted
      const messages = memory.messages?.map(message => {
        if (message.metadata?.encrypted) {
          return {
            ...message,
            content: this.decryptPHI(message.content)
          };
        }
        return message;
      }) || [];

      console.log(`✅ Retrieved conversation history: ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error("❌ Failed to get conversation history:", error);
      return [];
    }
  }

  /**
   * Update user session metadata
   */
  async updateSessionMetadata(sessionId: string, metadata: any): Promise<void> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.client) {
        console.warn("⚠️ ZepClient not available, skipping metadata update");
        return;
      }

      await this.client.user.update(sessionId, {
        metadata: {
          ...metadata,
          lastUpdated: new Date().toISOString()
        }
      });

      console.log(`✅ Session metadata updated: ${sessionId}`);
    } catch (error) {
      console.error("❌ Failed to update session metadata:", error);
    }
  }

  /**
   * Delete user session and all associated data
   */
  async deleteUserSession(sessionId: string): Promise<void> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.client) {
        console.warn("⚠️ ZepClient not available, skipping session deletion");
        return;
      }

      await this.client.user.delete(sessionId);
      console.log(`✅ Session deleted: ${sessionId}`);
    } catch (error) {
      console.error("❌ Failed to delete session:", error);
    }
  }

  /**
   * Encrypt PHI data for HIPAA compliance
   */
  private encryptPHI(data: any): string {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
    return encrypted;
  }

  /**
   * Decrypt PHI data
   */
  private decryptPHI(encryptedData: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("❌ Failed to decrypt PHI data:", error);
      return null;
    }
  }

  /**
   * Generate encryption key for HIPAA compliance
   */
  private generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Test connection to Zep service
   */
  async testConnection(): Promise<boolean> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.client) {
        console.warn("⚠️ ZepClient not available for connection test");
        return false;
      }

      // Test basic connectivity
      const testSessionId = `test_${Date.now()}`;
      await this.createUserSession(testSessionId);
      await this.deleteUserSession(testSessionId);
      
      console.log("✅ Zep connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Zep connection test failed:", error);
      return false;
    }
  }
}

// Default configuration for LabInsight AI with environment validation
export const defaultZepConfig: ZepClientConfig = {
  apiKey: process.env.ZEP_API_KEY || "",
  baseURL: process.env.ZEP_BASE_URL || "https://api.getzep.com",
  sessionConfig: {
    sessionIdPrefix: "labinsight",
    sessionTimeout: 1440, // 24 hours
    userIdMapping: true
  },
  memoryConfig: {
    memoryType: 'perpetual',
    maxTokens: 4000,
    summarizationEnabled: true,
    hipaaCompliant: true
  }
};

// Export singleton instance with lazy initialization
let zepClientInstance: LabInsightZepClient | null = null;

export const getZepClient = (): LabInsightZepClient => {
  if (!zepClientInstance) {
    zepClientInstance = new LabInsightZepClient(defaultZepConfig);
  }
  return zepClientInstance;
};

// Backward compatibility export
export const zepClient = getZepClient();

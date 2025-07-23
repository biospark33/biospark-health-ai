
// Environment Variable Validator
// Comprehensive validation and fallback handling for all environment variables

interface EnvironmentConfig {
  database: {
    url: string;
    isValid: boolean;
    usingFallback: boolean;
  };
  redis: {
    url: string | null;
    isValid: boolean;
    enabled: boolean;
  };
  sentry: {
    dsn: string | null;
    publicDsn: string | null;
    isValid: boolean;
    enabled: boolean;
  };
  zep: {
    apiKey: string | null;
    baseUrl: string;
    encryptionKey: string;
    isValid: boolean;
    enabled: boolean;
  };
  security: {
    nextAuthSecret: string;
    encryptionKey: string;
    jwtSecret: string;
    phiEncryptionKey: string;
    isValid: boolean;
  };
}

class EnvironmentValidator {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.validateEnvironment();
  }

  private validateEnvironment(): EnvironmentConfig {
    return {
      database: this.validateDatabase(),
      redis: this.validateRedis(),
      sentry: this.validateSentry(),
      zep: this.validateZep(),
      security: this.validateSecurity()
    };
  }

  private validateDatabase() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.warn('⚠️ DATABASE_URL not set, using SQLite fallback');
      return {
        url: 'file:./dev.db',
        isValid: false,
        usingFallback: true
      };
    }

    // Check for placeholder values
    if (databaseUrl.includes('username:password@hostname:port') || 
        databaseUrl.includes('your-database-url') ||
        databaseUrl === 'postgresql://username:password@hostname:port/database_name') {
      console.warn('⚠️ DATABASE_URL contains placeholder values, using SQLite fallback');
      return {
        url: 'file:./dev.db',
        isValid: false,
        usingFallback: true
      };
    }

    // Validate URL format
    try {
      const url = new URL(databaseUrl);
      if (!url.protocol || !url.hostname) {
        throw new Error('Invalid URL format');
      }
      
      console.log('✅ DATABASE_URL validated successfully');
      return {
        url: databaseUrl,
        isValid: true,
        usingFallback: false
      };
    } catch (error) {
      console.warn('⚠️ Invalid DATABASE_URL format, using SQLite fallback:', error instanceof Error ? error.message : 'Unknown error');
      return {
        url: 'file:./dev.db',
        isValid: false,
        usingFallback: true
      };
    }
  }

  private validateRedis() {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.warn('⚠️ REDIS_URL not set, caching disabled');
      return {
        url: null,
        isValid: false,
        enabled: false
      };
    }

    // Check for placeholder values
    if (redisUrl.includes('username:password@hostname') || 
        redisUrl.includes('your-redis-url') ||
        redisUrl === 'redis://username:password@hostname:port') {
      console.warn('⚠️ REDIS_URL contains placeholder values, caching disabled');
      return {
        url: null,
        isValid: false,
        enabled: false
      };
    }

    // Validate URL format
    try {
      const url = new URL(redisUrl);
      if (!url.protocol.startsWith('redis')) {
        throw new Error('Invalid Redis URL protocol');
      }
      
      console.log('✅ REDIS_URL validated successfully');
      return {
        url: redisUrl,
        isValid: true,
        enabled: true
      };
    } catch (error) {
      console.warn('⚠️ Invalid REDIS_URL format, caching disabled:', error instanceof Error ? error.message : 'Unknown error');
      return {
        url: null,
        isValid: false,
        enabled: false
      };
    }
  }

  private validateSentry() {
    const sentryDsn = process.env.SENTRY_DSN;
    const publicSentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    
    const validateDsn = (dsn: string | undefined, name: string): string | null => {
      if (!dsn) {
        console.warn(`⚠️ ${name} not set, Sentry monitoring disabled`);
        return null;
      }

      // Check for placeholder values
      if (dsn.includes('your-sentry-dsn') || 
          dsn.includes('project-id') ||
          dsn === 'https://your-sentry-dsn@sentry.io/project-id') {
        console.warn(`⚠️ ${name} contains placeholder values, Sentry monitoring disabled`);
        return null;
      }

      // Validate DSN format
      try {
        const url = new URL(dsn);
        if (!url.hostname.includes('sentry.io')) {
          throw new Error('Invalid Sentry DSN hostname');
        }
        
        console.log(`✅ ${name} validated successfully`);
        return dsn;
      } catch (error) {
        console.warn(`⚠️ Invalid ${name} format, Sentry monitoring disabled:`, error instanceof Error ? error.message : 'Unknown error');
        return null;
      }
    };

    const validatedDsn = validateDsn(sentryDsn, 'SENTRY_DSN');
    const validatedPublicDsn = validateDsn(publicSentryDsn, 'NEXT_PUBLIC_SENTRY_DSN');

    return {
      dsn: validatedDsn,
      publicDsn: validatedPublicDsn,
      isValid: validatedDsn !== null || validatedPublicDsn !== null,
      enabled: validatedDsn !== null || validatedPublicDsn !== null
    };
  }

  private validateZep() {
    const zepApiKey = process.env.ZEP_API_KEY;
    const zepBaseUrl = process.env.ZEP_BASE_URL || 'https://api.getzep.com';
    const zepEncryptionKey = process.env.ZEP_ENCRYPTION_KEY || this.generateSecureKey();
    
    if (!zepApiKey || zepApiKey === 'your-zep-api-key') {
      console.warn('⚠️ ZEP_API_KEY not set or contains placeholder, Zep memory features disabled');
      return {
        apiKey: null,
        baseUrl: zepBaseUrl,
        encryptionKey: zepEncryptionKey,
        isValid: false,
        enabled: false
      };
    }

    console.log('✅ ZEP configuration validated successfully');
    return {
      apiKey: zepApiKey,
      baseUrl: zepBaseUrl,
      encryptionKey: zepEncryptionKey,
      isValid: true,
      enabled: true
    };
  }

  private validateSecurity() {
    const nextAuthSecret = process.env.NEXTAUTH_SECRET || this.generateSecureKey();
    const encryptionKey = process.env.ENCRYPTION_KEY || this.generateSecureKey();
    const jwtSecret = process.env.JWT_SECRET || this.generateSecureKey();
    const phiEncryptionKey = process.env.PHI_ENCRYPTION_KEY || this.generateSecureKey();

    // Warn about missing security keys
    if (!process.env.NEXTAUTH_SECRET) {
      console.warn('⚠️ NEXTAUTH_SECRET not set, using generated key (not recommended for production)');
    }
    if (!process.env.ENCRYPTION_KEY) {
      console.warn('⚠️ ENCRYPTION_KEY not set, using generated key (not recommended for production)');
    }
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not set, using generated key (not recommended for production)');
    }
    if (!process.env.PHI_ENCRYPTION_KEY) {
      console.warn('⚠️ PHI_ENCRYPTION_KEY not set, using generated key (not recommended for production)');
    }

    return {
      nextAuthSecret,
      encryptionKey,
      jwtSecret,
      phiEncryptionKey,
      isValid: true
    };
  }

  private generateSecureKey(): string {
    // Generate a secure random key for development
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  public isDatabaseReady(): boolean {
    return this.config.database.isValid || this.config.database.usingFallback;
  }

  public isRedisEnabled(): boolean {
    return this.config.redis.enabled;
  }

  public isSentryEnabled(): boolean {
    return this.config.sentry.enabled;
  }

  public isZepEnabled(): boolean {
    return this.config.zep.enabled;
  }

  public printStatus(): void {
    console.log('\n🔍 ENVIRONMENT VALIDATION SUMMARY');
    console.log('=====================================');
    console.log(`Database: ${this.config.database.isValid ? '✅ Valid' : (this.config.database.usingFallback ? '⚠️ Using SQLite fallback' : '❌ Invalid')}`);
    console.log(`Redis: ${this.config.redis.enabled ? '✅ Enabled' : '⚠️ Disabled'}`);
    console.log(`Sentry: ${this.config.sentry.enabled ? '✅ Enabled' : '⚠️ Disabled'}`);
    console.log(`Zep: ${this.config.zep.enabled ? '✅ Enabled' : '⚠️ Disabled'}`);
    console.log(`Security: ${this.config.security.isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log('=====================================\n');
  }
}

// Export singleton instance
export const environmentValidator = new EnvironmentValidator();
export default environmentValidator;

// Export configuration for use in other modules
export const envConfig = environmentValidator.getConfig();

/**
 * Environment Validation Utility
 * Validates all required environment variables with detailed error reporting
 */

interface EnvironmentConfig {
  // Database
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // Redis
  REDIS_URL?: string;
  
  // Sentry
  SENTRY_DSN?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;
  SENTRY_AUTH_TOKEN?: string;
  
  // ZepAI
  ZEP_API_KEY?: string;
  ZEP_API_URL?: string;
  
  // OpenAI
  OPENAI_API_KEY?: string;
  
  // NextAuth
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private validationCache: ValidationResult | null = null;

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  /**
   * Validate all environment variables
   */
  validate(): ValidationResult {
    if (this.validationCache) {
      return this.validationCache;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const config: EnvironmentConfig = {};

    // Critical environment variables
    const critical = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET'
    ];

    // Optional but recommended
    const recommended = [
      'REDIS_URL',
      'SENTRY_DSN',
      'ZEP_API_KEY',
      'OPENAI_API_KEY'
    ];

    // Check critical variables
    critical.forEach(key => {
      const value = process.env[key];
      if (!value || value.trim() === '') {
        errors.push(`Missing critical environment variable: ${key}`);
      } else {
        config[key as keyof EnvironmentConfig] = value;
      }
    });

    // Check recommended variables
    recommended.forEach(key => {
      const value = process.env[key];
      if (!value || value.trim() === '') {
        warnings.push(`Missing recommended environment variable: ${key}`);
      } else {
        config[key as keyof EnvironmentConfig] = value;
      }
    });

    // Validate URL formats
    this.validateUrls(config, errors, warnings);

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      config
    };

    this.validationCache = result;
    return result;
  }

  private validateUrls(config: EnvironmentConfig, errors: string[], warnings: string[]): void {
    const urlFields = [
      'DATABASE_URL',
      'DIRECT_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'REDIS_URL',
      'ZEP_API_URL',
      'NEXTAUTH_URL'
    ];

    urlFields.forEach(field => {
      const value = config[field as keyof EnvironmentConfig];
      if (value && !this.isValidUrl(value)) {
        errors.push(`Invalid URL format for ${field}: ${value}`);
      }
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get environment variable with fallback
   */
  getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Get safe environment info for logging
   */
  getSafeEnvInfo(): Record<string, any> {
    const validation = this.validate();
    return {
      nodeEnv: process.env.NODE_ENV,
      hasDatabase: !!validation.config.DATABASE_URL,
      hasSupabase: !!validation.config.NEXT_PUBLIC_SUPABASE_URL,
      hasRedis: !!validation.config.REDIS_URL,
      hasSentry: !!validation.config.SENTRY_DSN,
      hasZep: !!validation.config.ZEP_API_KEY,
      hasOpenAI: !!validation.config.OPENAI_API_KEY,
      validationErrors: validation.errors.length,
      validationWarnings: validation.warnings.length
    };
  }
}

// Export singleton instance
export const envValidator = EnvironmentValidator.getInstance();

// Export validation function for immediate use
export function validateEnvironment(): ValidationResult {
  return envValidator.validate();
}


// Environment Configuration Validator
// Validates required environment variables for different deployment stages

export interface EnvironmentConfig {
  // Database
  DATABASE_URL?: string;
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // Authentication
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  
  // Google OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  
  // OpenAI
  OPENAI_API_KEY?: string;
  
  // Zep Memory
  ZEP_API_KEY?: string;
  ZEP_ENCRYPTION_KEY?: string;
  
  // Application
  NODE_ENV?: string;
  VERCEL_ENV?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
  stage: 'development' | 'preview' | 'production';
}

export class EnvironmentValidator {
  private config: EnvironmentConfig;
  
  constructor() {
    this.config = this.loadEnvironmentConfig();
  }
  
  private loadEnvironmentConfig(): EnvironmentConfig {
    return {
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ZEP_API_KEY: process.env.ZEP_API_KEY,
      ZEP_ENCRYPTION_KEY: process.env.ZEP_ENCRYPTION_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };
  }
  
  private getDeploymentStage(): 'development' | 'preview' | 'production' {
    if (process.env.VERCEL_ENV === 'production') return 'production';
    if (process.env.VERCEL_ENV === 'preview') return 'preview';
    if (process.env.NODE_ENV === 'production') return 'production';
    return 'development';
  }
  
  private getRequiredVariables(stage: string): string[] {
    const base = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
    ];
    
    const production = [
      ...base,
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
    ];
    
    const optional = [
      'ZEP_API_KEY',
      'ZEP_ENCRYPTION_KEY',
    ];
    
    switch (stage) {
      case 'production':
        return production;
      case 'preview':
        return production;
      case 'development':
        return base;
      default:
        return base;
    }
  }
  
  private getOptionalVariables(): string[] {
    return [
      'ZEP_API_KEY',
      'ZEP_ENCRYPTION_KEY',
      'NEXTAUTH_URL',
    ];
  }
  
  public validate(): ValidationResult {
    const stage = this.getDeploymentStage();
    const requiredVars = this.getRequiredVariables(stage);
    const optionalVars = this.getOptionalVariables();
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check required variables
    for (const varName of requiredVars) {
      const value = this.config[varName as keyof EnvironmentConfig];
      if (!value || value.trim() === '') {
        errors.push(`Missing required environment variable: ${varName}`);
      } else if (value.includes('your-') || value.includes('YOUR-') || value.includes('placeholder')) {
        errors.push(`Environment variable ${varName} contains placeholder value: ${value}`);
      }
    }
    
    // Check optional variables
    for (const varName of optionalVars) {
      const value = this.config[varName as keyof EnvironmentConfig];
      if (!value || value.trim() === '') {
        warnings.push(`Optional environment variable not set: ${varName}`);
      } else if (value.includes('your-') || value.includes('YOUR-') || value.includes('placeholder')) {
        warnings.push(`Environment variable ${varName} contains placeholder value: ${value}`);
      }
    }
    
    // Validate specific formats
    this.validateDatabaseUrl(errors, warnings);
    this.validateSupabaseConfig(errors, warnings);
    this.validateAuthConfig(errors, warnings);
    
    const isValid = errors.length === 0;
    
    return {
      isValid,
      errors,
      warnings,
      config: this.config,
      stage
    };
  }
  
  private validateDatabaseUrl(errors: string[], warnings: string[]): void {
    const dbUrl = this.config.DATABASE_URL;
    if (dbUrl) {
      if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
        errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
      }
      
      // Check for Supabase format
      if (dbUrl.includes('supabase.co') && !dbUrl.includes('sslmode=require')) {
        warnings.push('Supabase DATABASE_URL should include sslmode=require parameter');
      }
    }
  }
  
  private validateSupabaseConfig(errors: string[], warnings: string[]): void {
    const supabaseUrl = this.config.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
    }
    
    if (supabaseUrl && supabaseKey) {
      if (!supabaseUrl.includes('supabase.co')) {
        warnings.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a Supabase URL');
      }
    }
  }
  
  private validateAuthConfig(errors: string[], warnings: string[]): void {
    const authSecret = this.config.NEXTAUTH_SECRET;
    if (authSecret && authSecret.length < 32) {
      warnings.push('NEXTAUTH_SECRET should be at least 32 characters long for security');
    }
  }
  
  public getConfigSummary(): Record<string, any> {
    const validation = this.validate();
    
    return {
      stage: validation.stage,
      isValid: validation.isValid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      hasDatabase: !!validation.config.DATABASE_URL,
      hasSupabase: !!validation.config.NEXT_PUBLIC_SUPABASE_URL,
      hasAuth: !!validation.config.NEXTAUTH_SECRET,
      hasOpenAI: !!validation.config.OPENAI_API_KEY,
      hasZep: !!validation.config.ZEP_API_KEY,
      timestamp: new Date().toISOString()
    };
  }
  
  public printValidationReport(): void {
    const validation = this.validate();
    
    console.log('\n🔍 Environment Configuration Validation Report');
    console.log('================================================');
    console.log(`Stage: ${validation.stage.toUpperCase()}`);
    console.log(`Status: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Errors: ${validation.errors.length}`);
    console.log(`Warnings: ${validation.warnings.length}`);
    
    if (validation.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      validation.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      validation.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    const summary = this.getConfigSummary();
    console.log('\n📊 Configuration Summary:');
    console.log(`  • Database: ${summary.hasDatabase ? '✅' : '❌'}`);
    console.log(`  • Supabase: ${summary.hasSupabase ? '✅' : '❌'}`);
    console.log(`  • Authentication: ${summary.hasAuth ? '✅' : '❌'}`);
    console.log(`  • OpenAI: ${summary.hasOpenAI ? '✅' : '❌'}`);
    console.log(`  • Zep Memory: ${summary.hasZep ? '✅' : '⚠️  Optional'}`);
    
    console.log('\n================================================\n');
  }
}

// Export singleton instance
export const environmentValidator = new EnvironmentValidator();

// Utility functions
export function validateEnvironment(): ValidationResult {
  return environmentValidator.validate();
}

export function printEnvironmentReport(): void {
  environmentValidator.printValidationReport();
}

export function isProductionReady(): boolean {
  const validation = environmentValidator.validate();
  return validation.isValid && validation.stage === 'production';
}

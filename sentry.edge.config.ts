
// Sentry Edge Runtime Configuration with Environment Validation
import * as Sentry from "@sentry/nextjs";

// Validate Sentry DSN before initialization
function validateSentryDsn(): string | undefined {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('⚠️ SENTRY_DSN not set, Sentry edge monitoring disabled');
    return undefined;
  }

  // Check for placeholder values
  if (dsn.includes('your-sentry-dsn') || 
      dsn.includes('project-id') ||
      dsn === 'https://your-sentry-dsn@sentry.io/project-id') {
    console.warn('⚠️ SENTRY_DSN contains placeholder values, Sentry edge monitoring disabled');
    return undefined;
  }

  // Validate DSN format
  try {
    const url = new URL(dsn);
    if (!url.hostname.includes('sentry.io')) {
      throw new Error('Invalid Sentry DSN hostname');
    }
    return dsn;
  } catch (error) {
    console.warn('⚠️ Invalid SENTRY_DSN format, Sentry edge monitoring disabled:', error instanceof Error ? error.message : 'Unknown error');
    return undefined;
  }
}

const validatedDsn = validateSentryDsn();

if (validatedDsn) {
  Sentry.init({
    dsn: validatedDsn,
    // Performance Monitoring (reduced for edge runtime)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
    // Environment
    environment: process.env.NODE_ENV || 'development',
    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    // Enhanced error filtering for healthcare compliance
    beforeSend(event) {
      // Filter out sensitive health data from error reports
      if (event.exception) {
        event.exception.values?.forEach(exception => {
          if (exception.stacktrace?.frames) {
            exception.stacktrace.frames.forEach(frame => {
              // Remove sensitive data from stack traces
              if (frame.vars) {
                Object.keys(frame.vars).forEach(key => {
                  if (key.toLowerCase().includes('phi') || 
                      key.toLowerCase().includes('health') ||
                      key.toLowerCase().includes('medical') ||
                      key.toLowerCase().includes('patient')) {
                    frame.vars![key] = '[Filtered]';
                  }
                });
              }
            });
          }
        });
      }
      return event;
    }
  });
  
  console.log('✅ Sentry edge monitoring initialized');
} else {
  console.log('ℹ️ Sentry edge monitoring disabled (DSN not configured)');
}

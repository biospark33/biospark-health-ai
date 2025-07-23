
// Sentry Server Configuration with Environment Validation
import * as Sentry from "@sentry/nextjs";

// Validate Sentry DSN before initialization
function validateSentryDsn(): string | undefined {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('⚠️ SENTRY_DSN not set, Sentry server monitoring disabled');
    return undefined;
  }

  // Check for placeholder values
  if (dsn.includes('your-sentry-dsn') || 
      dsn.includes('project-id') ||
      dsn === 'https://your-sentry-dsn@sentry.io/project-id') {
    console.warn('⚠️ SENTRY_DSN contains placeholder values, Sentry server monitoring disabled');
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
    console.warn('⚠️ Invalid SENTRY_DSN format, Sentry server monitoring disabled:', error instanceof Error ? error.message : 'Unknown error');
    return undefined;
  }
}

const validatedDsn = validateSentryDsn();

if (validatedDsn) {
  Sentry.init({
    dsn: validatedDsn,
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
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
      
      // Filter sensitive data from request context
      if (event.request) {
        if (event.request.data) {
          event.request.data = '[Filtered for HIPAA compliance]';
        }
        if (event.request.headers) {
          Object.keys(event.request.headers).forEach(key => {
            if (key.toLowerCase().includes('authorization') ||
                key.toLowerCase().includes('cookie') ||
                key.toLowerCase().includes('session')) {
              event.request!.headers![key] = '[Filtered]';
            }
          });
        }
      }
      
      return event;
    }
  });
  
  console.log('✅ Sentry server monitoring initialized');
} else {
  console.log('ℹ️ Sentry server monitoring disabled (DSN not configured)');
}

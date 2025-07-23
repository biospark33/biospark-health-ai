
// Sentry Client Configuration with Environment Validation
import * as Sentry from "@sentry/nextjs";

// Validate Sentry DSN before initialization
function validateSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('⚠️ NEXT_PUBLIC_SENTRY_DSN not set, Sentry client monitoring disabled');
    return undefined;
  }

  // Check for placeholder values
  if (dsn.includes('your-sentry-dsn') || 
      dsn.includes('project-id') ||
      dsn === 'https://your-sentry-dsn@sentry.io/project-id') {
    console.warn('⚠️ NEXT_PUBLIC_SENTRY_DSN contains placeholder values, Sentry client monitoring disabled');
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
    console.warn('⚠️ Invalid NEXT_PUBLIC_SENTRY_DSN format, Sentry client monitoring disabled:', error instanceof Error ? error.message : 'Unknown error');
    return undefined;
  }
}

const validatedDsn = validateSentryDsn();

if (validatedDsn) {
  Sentry.init({
    dsn: validatedDsn,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
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
                      key.toLowerCase().includes('medical')) {
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
  
  console.log('✅ Sentry client monitoring initialized');
} else {
  console.log('ℹ️ Sentry client monitoring disabled (DSN not configured)');
}

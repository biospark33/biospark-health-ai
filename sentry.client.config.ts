

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided and valid
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && dsn !== "https://your-sentry-dsn@sentry.io/project-id" && dsn.startsWith("https://")) {
  Sentry.init({
    dsn: dsn,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    environment: process.env.NODE_ENV || 'development',
  });
} else {
  console.log('Sentry client initialization skipped - no valid DSN provided');
}

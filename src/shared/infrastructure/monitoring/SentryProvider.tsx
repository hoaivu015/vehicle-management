import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN || '';
  
  if (!dsn) {
    console.log('ℹ️  Sentry DSN is not provided. Monitoring is disabled in this environment.');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      if (event.extra) {
        delete event.extra.financialData;
        delete event.extra.partnerDetails;
      }
      return event;
    },
  });
}

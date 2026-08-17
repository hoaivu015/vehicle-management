export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN || '';
  
  if (!dsn) {
    return;
  }

  try {
    const Sentry = await import('@sentry/react');
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
  } catch (err) {
    console.warn('Failed to initialize Sentry:', err);
  }
}

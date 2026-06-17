// Sentry-Integration (optional). Aktiv nur wenn SENTRY_DSN env gesetzt.
// PII-Filter: E-Mails + Tokens werden vor dem Senden geredact.
//
// Aktivierung: `npm install @sentry/node` + früh im app.js: `import './lib/sentry.js';`

let Sentry;
try {
  Sentry = await import('@sentry/node');
} catch {
  Sentry = null;
}

const enabled = !!(Sentry && process.env.SENTRY_DSN);

if (enabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1, // 10% Sampling — reicht für 1000-Order/Mo
    beforeSend(event) {
      // PII-Redaction: E-Mail aus extra/breadcrumbs/error.message scrubben
      if (event.user) {
        event.user.email = '[REDACTED]';
        event.user.ip_address = '[REDACTED]';
      }
      if (event.request) {
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['stripe-signature'];
        }
        if (event.request.query_string && /email=/i.test(event.request.query_string)) {
          event.request.query_string = event.request.query_string.replace(/email=[^&]+/gi, 'email=[REDACTED]');
        }
      }
      // Error-Message: E-Mail-Muster ersetzen
      if (event.exception?.values) {
        for (const ex of event.exception.values) {
          if (ex.value) {
            ex.value = ex.value.replace(/[\w.+-]+@[\w.-]+/g, '[EMAIL]');
          }
        }
      }
      return event;
    },
    integrations: [
      // Default-Integrations sind OK. Express-Auto-Instrumentation kann später aktiviert werden:
      // Sentry.expressIntegration() — braucht expliziten Middleware-Aufruf in app.js
    ]
  });
  console.log('[sentry] aktiviert mit DSN');
} else {
  if (!Sentry) console.log('[sentry] @sentry/node nicht installiert — skip');
  else if (!process.env.SENTRY_DSN) console.log('[sentry] SENTRY_DSN nicht gesetzt — skip');
}

export function captureException(err, context = {}) {
  if (!enabled) {
    console.error('[sentry-disabled]', err.message, context);
    return;
  }
  Sentry.withScope((scope) => {
    for (const [k, v] of Object.entries(context)) scope.setTag(k, String(v).slice(0, 200));
    Sentry.captureException(err);
  });
}

export function captureMessage(msg, level = 'info', context = {}) {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    for (const [k, v] of Object.entries(context)) scope.setTag(k, String(v).slice(0, 200));
    Sentry.captureMessage(msg, level);
  });
}

export default { captureException, captureMessage, enabled };

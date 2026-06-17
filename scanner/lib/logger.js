// Structured Logger (Pino, optional installiert).
// Drop-in für console.log/error in app.js + lib/*. Falls Pino nicht installiert
// (ältere Deploys, lokale Dev ohne npm install): fällt auf console zurück.
//
// Aktivierung: `npm install pino pino-http pino-pretty` + import { logger } in app.js
// In Produktion: JSON-Logs auf stdout (Docker-Logs sammeln das ein).
// In Dev: pretty-formatiert mit Farben.

let pino;
try {
  pino = (await import('pino')).default;
} catch {
  pino = null;
}

let httpLogger;
try {
  httpLogger = (await import('pino-http')).default;
} catch {
  httpLogger = null;
}

function fallbackLogger() {
  // Console-Fallback, gleiche API wie pino-Logger (nur die genutzten Methoden).
  const fmt = (level, msg, obj) => {
    const ts = new Date().toISOString();
    const objStr = obj && Object.keys(obj).length ? ' ' + JSON.stringify(obj) : '';
    return `${ts} [${level}] ${msg}${objStr}`;
  };
  return {
    info: (objOrMsg, maybeMsg) => {
      if (typeof objOrMsg === 'string') console.log(fmt('INFO', objOrMsg));
      else console.log(fmt('INFO', maybeMsg || '', objOrMsg));
    },
    warn: (objOrMsg, maybeMsg) => {
      if (typeof objOrMsg === 'string') console.warn(fmt('WARN', objOrMsg));
      else console.warn(fmt('WARN', maybeMsg || '', objOrMsg));
    },
    error: (objOrMsg, maybeMsg) => {
      if (typeof objOrMsg === 'string') console.error(fmt('ERROR', objOrMsg));
      else console.error(fmt('ERROR', maybeMsg || '', objOrMsg));
    },
    debug: (objOrMsg, maybeMsg) => {
      if (process.env.LOG_LEVEL === 'debug') {
        if (typeof objOrMsg === 'string') console.log(fmt('DEBUG', objOrMsg));
        else console.log(fmt('DEBUG', maybeMsg || '', objOrMsg));
      }
    },
    child: () => fallbackLogger()
  };
}

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino
  ? pino({
      level: process.env.LOG_LEVEL || 'info',
      // PII-Redaction: E-Mail/Token-Header NICHT in Logs.
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["stripe-signature"]',
          '*.email',
          '*.STRIPE_SECRET_KEY',
          '*.STRIPE_WEBHOOK_SECRET',
          '*.SMTP_PASS',
          '*.ADMIN_TOKEN'
        ],
        censor: '[REDACTED]'
      },
      transport: isProd
        ? undefined
        : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } }
    })
  : fallbackLogger();

// Express-Middleware. In app.js verwenden: `app.use(httpLog());`
export function httpLog() {
  if (httpLogger) {
    return httpLogger({
      logger,
      autoLogging: { ignore: (req) => req.url === '/health' }, // /health-Spam vermeiden
      serializers: {
        // Eigene Serializer, um PII rauszuhalten
        req: (req) => ({
          method: req.method,
          url: req.url.replace(/email=[^&]+/i, 'email=[REDACTED]'),
          remoteAddr: req.headers['x-forwarded-for'] || req.socket?.remoteAddress
        })
      }
    });
  }
  // Fallback: no-op middleware
  return (req, res, next) => next();
}

export default logger;

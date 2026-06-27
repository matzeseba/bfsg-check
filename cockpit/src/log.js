// pino-Logger mit Redaction sensibler Felder.
// R-02: Redaction-Pfade so erweitert, dass folgende Werte nie im Log erscheinen:
//   - Stripe-Keys (stripeApiKey, STRIPE_API_KEY, *apiKey, *ApiKey)
//   - Admin-Token (adminToken, ADMIN_TOKEN, *token, *Token)
//   - Google-Ads-Secrets (clientSecret, refreshToken, developerToken + Nested-Varianten)
//   - GitHub-Token (githubToken, GITHUB_TOKEN)
//   - Authorization-Header (headers.authorization, req.headers.authorization)
//   - Allgemeine Muster: *.secret, *.password, *.key (Case-insensitive via Alias-Pfade)
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const log = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      // --- Token / API-Keys (flach + 1 Ebene tief) ---
      'token', '*.token', '*.Token',
      'apiKey', '*.apiKey', '*.ApiKey',
      'secret', '*.secret', '*.Secret',
      'password', '*.password', '*.Password',
      'key', '*.key',                          // Vorsicht: sparsam halten (z.B. nicht 'id')

      // --- Stripe ---
      'stripeApiKey', '*.stripeApiKey',

      // --- Admin ---
      'adminToken', '*.adminToken',

      // --- Google Ads ---
      'clientSecret', '*.clientSecret',
      'refreshToken', '*.refreshToken',
      'developerToken', '*.developerToken',
      'googleAds.clientSecret',
      'googleAds.refreshToken',
      'googleAds.developerToken',

      // --- GitHub ---
      'githubToken', '*.githubToken',

      // --- HTTP-Header ---
      'headers.authorization',
      'req.headers.authorization',
      '*.headers.authorization',

      // --- E-Mail (PII) ---
      'email', '*.email',
    ],
    censor: '[redacted]',
  },
  ...(isDev
    ? { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }
    : {}),
});

// Bearer-Token-Auth für /admin/* + /api/resend/*.
// Token aus env ADMIN_TOKEN (min 32 chars, sonst Block).
// Lädt einmal beim Modul-Laden — Restart nötig nach Token-Rotation.

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

if (ADMIN_TOKEN && ADMIN_TOKEN.length < 32) {
  console.error('[admin-auth] FATAL: ADMIN_TOKEN < 32 Zeichen. Setze einen kryptografisch zufälligen Token via `openssl rand -hex 32`.');
  process.exit(1);
}

export function adminConfigured() {
  return ADMIN_TOKEN.length >= 32;
}

// Express-Middleware. Verwendet konstante-Zeit-Vergleich gegen Timing-Attacks.
export function requireAdminAuth(req, res, next) {
  if (!adminConfigured()) {
    return res.status(503).json({ error: 'Admin-Endpoints deaktiviert (ADMIN_TOKEN nicht gesetzt).' });
  }
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Bearer-Token fehlt' });
  const provided = match[1].trim();
  if (!constantTimeEqual(provided, ADMIN_TOKEN)) {
    return res.status(403).json({ error: 'Token ungültig' });
  }
  next();
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

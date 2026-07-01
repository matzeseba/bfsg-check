// Signierter 1-Klick-Freigabe-Token für die Owner-Release-Mail (PR5).
//
// Der Owner bekommt pro Report eine Mail mit „Freigeben & senden"-Link auf
// GET /api/release/:sessionId?token=<hmac>. Der Token ist eine HMAC-SHA256 über die
// sessionId — nur wer das Secret kennt, kann einen gültigen Link erzeugen. Da die Mail
// ausschließlich an ADMIN_EMAIL geht, verhindert die Signatur v. a. Enumeration/Raten
// fremder sessionIds. Kein Ablauf nötig: der Job ist ohnehin nach Auto-Release terminal.
//
// Secret: RELEASE_TOKEN_SECRET, Fallback ADMIN_TOKEN (existiert bereits als /api/admin-
// Schutz). Ohne beides → Feature meldet sich als nicht konfiguriert (kein unsicherer
// Default-Token).

import { createHmac, timingSafeEqual } from 'node:crypto';

function secret(env = process.env) {
  return env.RELEASE_TOKEN_SECRET || env.ADMIN_TOKEN || '';
}

export function releaseTokenConfigured(env = process.env) {
  return secret(env).length >= 16;
}

/** HMAC-SHA256(sessionId) hex. Leerer String, wenn kein Secret gesetzt ist. */
export function signRelease(sessionId, env = process.env) {
  const key = secret(env);
  if (!key) return '';
  return createHmac('sha256', key).update(String(sessionId)).digest('hex');
}

/** Konstante-Zeit-Vergleich; false bei fehlendem Secret/Token oder Mismatch. */
export function verifyRelease(sessionId, token, env = process.env) {
  const expected = signRelease(sessionId, env);
  if (!expected || !token) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(token), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

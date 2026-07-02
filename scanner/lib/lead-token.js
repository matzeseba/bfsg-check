// Signierter Bestätigungs-Token für den DOI-gegateten Gratis-Report (02.07.).
//
// Nach POST /api/lead wird der Gratis-Report NICHT sofort gemailt, sondern durabel
// eingequeut (lead-queue.js). Der Brevo-Double-Opt-in-Bestätigungslink redirectet
// auf GET /api/lead/confirm?id=<id>&token=<hmac> — erst dieser Klick löst den
// Versand aus. Der Token ist eine HMAC-SHA256 über die (zufällige) Lead-ID: nur wer
// das Secret kennt, kann einen gültigen Link erzeugen → kein Fremd-Confirm, keine
// ID-Enumeration. Die 7-Tage-Gültigkeit prüft der Endpoint über expiresAt am
// Queue-Record (der Payload muss ohnehin existieren, um versenden zu können).
//
// Secret: LEAD_TOKEN_SECRET, Fallback RELEASE_TOKEN_SECRET, dann ADMIN_TOKEN (in Prod
// gesetzt). Ohne Secret meldet sich das Gating als nicht konfiguriert (kein unsicherer
// Default-Token) — /api/lead fällt dann auf den alten, ungegateten Redirect zurück.

import { createHmac, timingSafeEqual } from 'node:crypto';

function secret(env = process.env) {
  return env.LEAD_TOKEN_SECRET || env.RELEASE_TOKEN_SECRET || env.ADMIN_TOKEN || '';
}

export function leadTokenConfigured(env = process.env) {
  return secret(env).length >= 16;
}

/** HMAC-SHA256(id) hex. Leerer String, wenn kein Secret gesetzt ist. */
export function signLead(id, env = process.env) {
  const key = secret(env);
  if (!key) return '';
  return createHmac('sha256', key).update(String(id)).digest('hex');
}

/** Konstante-Zeit-Vergleich; false bei fehlendem Secret/Token oder Mismatch. */
export function verifyLead(id, token, env = process.env) {
  const expected = signLead(id, env);
  if (!expected || !token) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(token), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

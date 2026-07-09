/**
 * Session-Cookie-Verifikation (Edge-Runtime, Web-Crypto).
 *
 * ============================================================================
 * VEREINBARTES COOKIE-FORMAT (mit Team Beta / Backend abgestimmt)
 * ============================================================================
 * Das Backend signiert Session-Cookies normalerweise mit `itsdangerous`.
 * itsdangerous-Signaturen sind in der Edge-Runtime (Web-Crypto) jedoch nur
 * schwer 1:1 nachzubauen. Daher wurde ein bewusst einfaches, in beiden Welten
 * identisch implementierbares HMAC-Format vereinbart:
 *
 *   aos_session = base64url(payload_json) + "." + base64url(hmac_sha256(payload_b64, secret))
 *
 *   payload_json = JSON.stringify({ "exp": <unix_timestamp_sekunden> })
 *   secret       = process.env.AOS_SESSION_SECRET
 *
 * Signiert wird der base64url-String des Payloads (NICHT das rohe JSON), damit
 * beide Seiten exakt denselben Byte-Input hashen. Verifikation:
 *   1. Cookie an "." splitten -> [payloadB64, sigB64]
 *   2. HMAC-SHA256 ueber die UTF-8-Bytes von payloadB64 mit dem Secret pruefen
 *   3. payload.exp muss in der Zukunft liegen
 *
 * Das Backend (app/auth.py) implementiert exakt dasselbe Format.
 * ============================================================================
 */

export const SESSION_COOKIE = "aos_session";

/** base64url -> Uint8Array (Edge-kompatibel via atob) */
function base64urlToBytes(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** base64url -> UTF-8-String (fuer den JSON-Payload) */
function base64urlToUtf8(input: string): string {
  const bytes = base64urlToBytes(input);
  return new TextDecoder().decode(bytes);
}

/**
 * Verifiziert ein aos_session-Cookie gegen das Secret.
 * Gibt true zurueck, wenn Signatur gueltig UND nicht abgelaufen.
 */
export async function verifySession(
  cookieValue: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!cookieValue || !secret) return false;

  const dot = cookieValue.indexOf(".");
  if (dot <= 0 || dot >= cookieValue.length - 1) return false;

  const payloadB64 = cookieValue.slice(0, dot);
  const sigB64 = cookieValue.slice(dot + 1);

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = base64urlToBytes(sigB64);
  } catch {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const data = new TextEncoder().encode(payloadB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      data,
    );
    if (!valid) return false;
  } catch {
    return false;
  }

  // Signatur ok -> Ablauf pruefen
  try {
    const payload = JSON.parse(base64urlToUtf8(payloadB64)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp > nowSec;
  } catch {
    return false;
  }
}

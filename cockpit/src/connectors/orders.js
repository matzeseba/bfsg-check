/**
 * Orders-Connector: bezieht Bestellungen vom Prod-Admin-Endpoint.
 *
 * PII-Schutz: E-Mail-Adressen werden zu Domain-Namen anonymisiert.
 *   "name@example.de" → "example.de"
 *   Kein Klartext-E-Mail verlässt diesen Connector.
 *
 * Feldnormalisierung:
 *   - amount: immer in EUR (Cents /100)
 *   - status: uppercase normalisiert (PAID / FULFILLED / FAILED / UNKNOWN)
 *   - ts: ISO-8601-String; Fallback auf created-Feld oder aktuelle Zeit
 *   - pkg: lowercase normalisiert
 *
 * Funnel-Metrik "Kauf-Count": Anzahl der Einträge mit status PAID oder FULFILLED.
 *
 * Ohne ADMIN_TOKEN: {configured:false, orders:[], kaufCount:0}
 */
import { config } from '../config.js';

// ── PII-Schutz ────────────────────────────────────────────────────────────────

/**
 * Extrahiert die Domain aus einer E-Mail.
 * Bei ungültigem Format wird '—' zurückgegeben.
 */
function emailToDomain(email) {
  if (typeof email !== 'string') return '—';
  const at = email.indexOf('@');
  if (at < 0) return '—';
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain || '—';
}

// ── Feldnormalisierung ────────────────────────────────────────────────────────

const STATUS_MAP = {
  paid: 'PAID',
  fulfilled: 'FULFILLED',
  failed: 'FAILED',
  refunded: 'REFUNDED',
  pending: 'PENDING',
};

function normalizeStatus(raw) {
  if (typeof raw !== 'string') return 'UNKNOWN';
  return STATUS_MAP[raw.toLowerCase()] || raw.toUpperCase();
}

function normalizePkg(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return 'unbekannt';
  return raw.trim().toLowerCase();
}

function normalizeAmount(raw) {
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  // Heuristik: Werte > 500 sind vermutlich in Cents (Stripe), sonst bereits EUR
  return n > 500 ? Math.round((n / 100) * 100) / 100 : Math.round(n * 100) / 100;
}

function normalizeTs(o) {
  // Präferenz: ts → created → createdAt → jetzt
  const raw = o.ts || o.created || o.createdAt;
  if (!raw) return new Date().toISOString();
  const d = new Date(typeof raw === 'number' ? raw * 1000 : raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function normalizeOrder(o) {
  return {
    domain: emailToDomain(o.email),
    pkg: normalizePkg(o.pkg || o.package),
    amount: normalizeAmount(o.amount),
    status: normalizeStatus(o.status),
    ts: normalizeTs(o),
  };
}

// ── Haupt-Export ──────────────────────────────────────────────────────────────

export async function fetchOrders() {
  if (!config.adminToken) {
    return { configured: false, orders: [], kaufCount: 0 };
  }

  try {
    const res = await fetch(`${config.prodBaseUrl}/admin/orders`, {
      headers: {
        authorization: `Bearer ${config.adminToken}`,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return {
        configured: true,
        orders: [],
        kaufCount: 0,
        error: `Admin-Endpoint HTTP ${res.status}`,
      };
    }

    let raw;
    try {
      raw = await res.json();
    } catch {
      return { configured: true, orders: [], kaufCount: 0, error: 'JSON-Parse-Fehler' };
    }

    const arr = Array.isArray(raw) ? raw : (raw?.orders ?? raw?.data ?? []);
    if (!Array.isArray(arr)) {
      return { configured: true, orders: [], kaufCount: 0, error: 'Unbekanntes Response-Format' };
    }

    const orders = arr.map(normalizeOrder);

    // Funnel "Kauf"-Count: alle bezahlten und erfüllten Orders
    const kaufCount = orders.filter(
      (o) => o.status === 'PAID' || o.status === 'FULFILLED',
    ).length;

    return { configured: true, orders, kaufCount };
  } catch (e) {
    return {
      configured: true,
      orders: [],
      kaufCount: 0,
      error: String(e.message || e),
    };
  }
}

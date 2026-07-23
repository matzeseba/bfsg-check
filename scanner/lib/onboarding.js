// Onboarding- & Dunning-Sequenz-Engine (agent-09, PR feat/onboarding-dunning-mails).
// ---------------------------------------------------------------------------
// Persistenter Sendeplan für zeitgesteuerte Kunden-Mails — gleiches Muster wie
// orders.js/subscriptions.js: Append-only JSONL + In-Memory-Spiegel. Kein
// externer Dienst, kein Cron — ein Intervall-Ticker in app.js (analog zum
// Jahres-Abo-Ticker) ruft processDue().
//
// Tracks:
//   A = Report-Käufer (basis/profi/startpaket-*)  — Anker: Report-Auslieferung
//   B = Re-Check-Abo-Kunden                       — Anker: Abo-Start (Checkout)
//   D = Dunning bei Zahlungsausfall (past_due)    — Anker: Statuswechsel-Event
//
// Idempotenz (kein Doppelversand):
//   1. scheduleTrack ist pro id idempotent (gleiche Bestellung/Subscription/
//      Dunning-Episode wird nicht doppelt eingeplant).
//   2. claimStep schreibt den Anspruch DURABEL (status CLAIMED) BEVOR gemailt
//      wird — ein Neustart/Redeploy zwischen zwei Ticks lädt die Claims aus
//      der Datei (ensureLoaded) und versendet nichts doppelt. Ein Crash mitten
//      im Versand hinterlässt CLAIMED (in-doubt) → beim nächsten Tick wird
//      der Step NICHT erneut versendet, sondern bleibt sichtbar (Owner kann
//      manuell nachliefern) — bewusst kein Auto-Zweitversand (Prinzip wie
//      recoverInDoubt im Release-Scheduler).
//   3. Transiente Versandfehler lösen den Claim wieder (status PENDING,
//      attempts+1) → nächster Tick versucht erneut, bis MAX_ATTEMPTS erreicht
//      ist; danach FAILED + Owner-Alarm.
//
// Dunning-Guard: D2/D3 werden NUR versendet, wenn die Subscription weiterhin
// PAST_DUE ist (deps.isDunningActive). Bei Recovery/Kündigung wird die
// D-Sequenz abgebrochen (cancelRecord).

import { appendFile, mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = process.env.ONBOARDING_FILE || path.join(__dirname, '..', 'out', 'onboarding.jsonl');

const DAY_MS = 24 * 3600_000;

// Sendeplan in Tagen nach Track-Anker (agent-09: A Tag 1/4/7/14/30,
// B Tag 0/3/7/14/25, D Tag 0/3/10 — D3-Text sagt „seit zehn Tagen").
export const SCHEDULE = {
  A: [['A1', 1], ['A2', 4], ['A3', 7], ['A4', 14], ['A5', 30]],
  B: [['B1', 0], ['B2', 3], ['B3', 7], ['B4', 14], ['B5', 25]],
  D: [['D1', 0], ['D2', 3], ['D3', 10]]
};

const MAX_ATTEMPTS = 3;

const records = new Map(); // id -> letzter Stand
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  if (!existsSync(FILE)) return;
  try {
    const txt = await readFile(FILE, 'utf8');
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { continue; }
      apply(rec);
    }
  } catch {
    /* defekte Datei ignorieren — Ticker läuft weiter */
  }
}

// Wendet eine JSONL-Zeile auf den In-Memory-Stand an (letzte Zeile gewinnt).
function apply(rec) {
  if (rec.type === 'schedule') {
    if (!records.has(rec.id)) {
      records.set(rec.id, {
        id: rec.id, track: rec.track, email: rec.email, company: rec.company || '',
        sourceId: rec.sourceId, cycleKey: rec.cycleKey || '', startedAt: rec.startedAt,
        abbuchungsZeile: rec.abbuchungsZeile || '', cancelled: false, steps: {}
      });
    }
  } else if (rec.type === 'step') {
    const r = records.get(rec.id);
    if (r) r.steps[rec.step] = { status: rec.status, attempts: rec.attempts || 0, ts: rec.ts };
  } else if (rec.type === 'cancel') {
    const r = records.get(rec.id);
    if (r) r.cancelled = true;
  }
}

async function write(rec) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, JSON.stringify({ ...rec, ts: new Date().toISOString() }) + '\n');
}

// Sendeplan anlegen. Idempotent pro id: Standard-id = `${track}:${sourceId}`;
// für Dunning-Episoden `${track}:${sourceId}:${cycleKey}` (cycleKey enthält den
// Statuswechsel-Zeitstempel → eine NEUE past_due-Episode nach Recovery bekommt
// einen neuen Plan, die alte bleibt abgeschlossen).
export async function scheduleTrack({ track, email, company = '', sourceId, cycleKey = '', startedAt = null, abbuchungsZeile = '' }) {
  await ensureLoaded();
  if (!SCHEDULE[track]) throw new Error('Unbekannter Track: ' + track);
  const id = cycleKey ? `${track}:${sourceId}:${cycleKey}` : `${track}:${sourceId}`;
  const existing = records.get(id);
  if (existing) return { id, scheduled: false, record: existing };
  const rec = {
    type: 'schedule', id, track, email, company, sourceId, cycleKey,
    startedAt: startedAt || new Date().toISOString(), abbuchungsZeile
  };
  await write(rec);
  apply({ ...rec, ts: new Date().toISOString() });
  return { id, scheduled: true, record: records.get(id) };
}

// Bricht alle offenen Sequenzen einer Quelle ab (z. B. Subscription gekündigt/
// gelöscht → keine weiteren Onboarding-/Dunning-Mails an diesen Kunden).
export async function cancelBySource(sourceId, reason = 'source-closed') {
  await ensureLoaded();
  let n = 0;
  for (const r of records.values()) {
    if (r.sourceId === sourceId && !r.cancelled) {
      await write({ type: 'cancel', id: r.id, reason });
      r.cancelled = true;
      n += 1;
    }
  }
  return n;
}

// Durabler Step-Claim VOR dem Versand (check-then-act synchron = atomar im
// Event-Loop, analog orders.js#claimEvent). true = dieser Aufruf darf senden.
async function claimStep(id, step) {
  const r = records.get(id);
  const cur = r.steps[step];
  if (cur && (cur.status === 'CLAIMED' || cur.status === 'SENT' || cur.status === 'FAILED')) return false;
  const attempts = (cur?.attempts || 0) + 1;
  const line = { type: 'step', id, step, status: 'CLAIMED', attempts };
  r.steps[step] = { status: 'CLAIMED', attempts, ts: new Date().toISOString() };
  await write(line); // durabel, bevor gemailt wird
  return true;
}

async function resolveStep(id, step, status, attempts) {
  const line = { type: 'step', id, step, status, attempts };
  await write(line);
  apply({ ...line, ts: new Date().toISOString() });
}

/**
 * Ein Ticker-Durchlauf: versendet alle fälligen Steps.
 * @param {object} deps
 *   sendStep({ record, step })        — Versand (mailer.sendSequenceStep)
 *   isDunningActive(record)           — async Guard für Track D (weiterhin past_due?)
 *   werbung()                         — aktueller Werbungs-Flag (Default: AUS)
 *   sendAlert(subject, body), logger  — optional
 * @param {number} now  — steuerbar für Tests
 */
export async function processDue(deps, now = Date.now()) {
  await ensureLoaded();
  let sent = 0;
  let skipped = 0;
  for (const r of [...records.values()]) {
    if (r.cancelled) continue;
    const startMs = Date.parse(r.startedAt || '');
    if (Number.isNaN(startMs)) continue;
    for (const [step, day] of SCHEDULE[r.track]) {
      if (now - startMs < day * DAY_MS) continue; // noch nicht fällig
      const state = r.steps[step];
      if (state && (state.status === 'CLAIMED' || state.status === 'SENT' || state.status === 'FAILED')) continue;

      // Dunning-Guard: D2/D3 (D1 wird sofort nach scheduleTrack angestoßen) nur,
      // wenn die Subscription weiterhin im Zahlungsausfall steht. Sonst Sequenz
      // abbrechen — der Kunde hat bezahlt oder gekündigt, keine Mahnung mehr.
      if (r.track === 'D' && step !== 'D1' && deps.isDunningActive) {
        const active = await deps.isDunningActive(r);
        if (!active) {
          await write({ type: 'cancel', id: r.id, reason: 'dunning-recovered' });
          r.cancelled = true;
          break;
        }
      }

      const attempts = (state?.attempts || 0) + 1;
      if (!(await claimStep(r.id, step))) continue;
      try {
        const res = await deps.sendStep({ record: r, step });
        if (res && res.skipped === 'werbung-disabled') {
          // Werblicher Step (A5) bei Werbungs-Flag AUS: als erledigt markieren,
          // ohne zu senden — kein Retry-Stau, kein Alarm.
          await resolveStep(r.id, step, 'SENT', attempts);
          skipped += 1;
          continue;
        }
        await resolveStep(r.id, step, 'SENT', attempts);
        sent += 1;
      } catch (err) {
        if (attempts >= MAX_ATTEMPTS) {
          await resolveStep(r.id, step, 'FAILED', attempts);
          await deps.sendAlert?.(
            `Sequenz-Mail endgültig fehlgeschlagen: ${step} an ${r.email}`,
            `Sequenz: ${r.id}\nStep: ${step}\nVersuche: ${attempts}\nFehler: ${err.message}\n\n` +
            `Der Step wird NICHT automatisch erneut versendet. Bei Bedarf manuell nachliefern.`
          );
          deps.logger?.error?.({ id: r.id, step, attempts, err: err.message }, 'Sequenz-Step endgültig fehlgeschlagen');
        } else {
          // Claim wieder freigeben → nächster Tick versucht erneut (transient).
          await resolveStep(r.id, step, 'PENDING', attempts);
          deps.logger?.warn?.({ id: r.id, step, attempts, err: err.message }, 'Sequenz-Step transient fehlgeschlagen — Retry im nächsten Tick');
        }
      }
    }
  }
  return { sent, skipped };
}

const DEFAULT_TICK_MS = Math.max(60_000, Number(process.env.ONBOARDING_TICK_MS) || 6 * 3600_000);

// Ticker starten (sofortiger Tick fängt nach Redeploy überfällige Steps →
// crash-safe; danach im Intervall). Gibt stop() zurück (Tests/Shutdown).
export function startOnboardingTicker(deps, { intervalMs = DEFAULT_TICK_MS } = {}) {
  const tick = () =>
    processDue(deps).catch((err) => deps.logger?.error?.({ err: err.message }, 'Onboarding-Tick fehlgeschlagen (läuft weiter)'));
  tick();
  const handle = setInterval(tick, intervalMs);
  if (handle.unref) handle.unref();
  return () => clearInterval(handle);
}

// --- DSGVO Art. 17: echte PII-Redaction (analog orders.js#redactOrdersByEmail) --
// Redigiert E-Mail/Firma in allen schedule-Zeilen der passenden Records (Datei-
// Rewrite tmp+rename + In-Memory-Map). Step-/Cancel-Zeilen enthalten keine PII.
// AUSNAHME: offene (nicht abgebrochene) Dunning-Sequenzen werden zusätzlich
// CANCELLed — ohne E-Mail kann nicht mehr versendet werden.
const PII_REDACTED = '[geloescht-dsgvo]';

export async function redactOnboardingByEmail(email, emailHash) {
  await ensureLoaded();
  const norm = String(email).toLowerCase().trim();
  const matches = (rec) => String(rec.email || '').toLowerCase().trim() === norm;
  const hitIds = new Set();
  for (const r of records.values()) if (matches(r)) hitIds.add(r.id);
  if (!hitIds.size) return 0;
  if (existsSync(FILE)) {
    const txt = await readFile(FILE, 'utf8');
    const outLines = [];
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { outLines.push(line); continue; }
      if (rec.type === 'schedule' && hitIds.has(rec.id)) {
        rec = { ...rec, email: PII_REDACTED, company: PII_REDACTED, emailHash, piiRedactedAt: new Date().toISOString() };
      }
      outLines.push(JSON.stringify(rec));
    }
    // Offene Sequenzen der betroffenen Records durabel abbrechen.
    for (const id of hitIds) {
      const r = records.get(id);
      if (r && !r.cancelled) outLines.push(JSON.stringify({ type: 'cancel', id, reason: 'dsgvo-redacted', ts: new Date().toISOString() }));
    }
    const tmp = FILE + '.redact.tmp';
    await writeFile(tmp, outLines.join('\n') + '\n');
    await rename(tmp, FILE);
  }
  for (const id of hitIds) {
    const r = records.get(id);
    if (r) {
      r.email = PII_REDACTED;
      r.company = PII_REDACTED;
      r.cancelled = true;
    }
  }
  return hitIds.size;
}

// Test-/Admin-Inspektion: alle Records (letzter Stand).
export async function listOnboarding() {
  await ensureLoaded();
  return [...records.values()];
}

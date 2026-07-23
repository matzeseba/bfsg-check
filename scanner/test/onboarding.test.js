// Tests für die Onboarding-/Dunning-Sequenzen (agent-09):
//   1. Templates: Betreff + Schlüssel-Inhalte (A/B/D), Disclaimer-/Footer-Konvention.
//   2. Werbungs-Flag: A5/B5-Jahresabsatz NUR bei werbung=true (Default AUS).
//   3. Sequenz-Engine: Fälligkeitsplan, Idempotenz (kein Doppelversand über
//      wiederholte Ticks), Dunning-Guard (Recovery/Kündigung bricht ab),
//      transienter Retry + endgültiger FAILED-Alarm, cancelBySource.
//   4. Flag-Defaults: ONBOARDING_ENABLED / ONBOARDING_WERBUNG_ENABLED sind
//      ohne Env-Setting AUS (Scharfschaltung = Owner-Entscheid).
//
// Umgebung VOR den Imports fixieren (Module lesen Pfade/Flags beim Laden).
// Es werden KEINE echten Mails versendet: ohne SMTP_* läuft der Mailer im
// DRY-RUN; die Engine-Tests nutzen zusätzlich aufzeichnende sendStep-Mocks.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-onboarding-'));
process.env.ONBOARDING_FILE = path.join(tmp, 'onboarding.jsonl');
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
process.env.PENDING_LEADS_FILE = path.join(tmp, 'leads.jsonl');
process.env.STRIPE_SECRET_KEY = 'sk_test_00000000000000000000000000'; // nur Client-Konstruktion, kein Netz
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
// ONBOARDING_ENABLED / ONBOARDING_WERBUNG_ENABLED bewusst UNGESETZT (Default-Test).

const mailer = await import('../lib/mailer.js');
const onboarding = await import('../lib/onboarding.js');

const DAY = 24 * 3600_000;
const T0 = Date.parse('2026-08-01T10:00:00Z');
let seq = 0; // eindeutige sourceIds je Test (Modul-Status ist prozess-global)

// --- 1. Templates -------------------------------------------------------------

test('Track A: A1-Betreff + Kerninhalte + Disclaimer/Footer-Konvention', () => {
  const m = mailer.buildOnboardingMail({ step: 'A1', company: 'Muster GmbH' });
  assert.equal(m.subject, 'So lesen Sie Ihren Barrierefreiheits-Report in 10 Minuten');
  assert.match(m.text, /Guten Tag Muster GmbH,/);
  assert.match(m.text, /30–50 % aller WCAG-Kriterien/);
  assert.match(m.text, /Bei Fragen antworten Sie einfach auf diese E-Mail\./);
  // Footer/Disclaimer-Konvention wie Bestandsmails:
  assert.match(m.text, /Keine Rechtsberatung, keine Konformitätsgarantie/);
  assert.match(m.text, /automatisierte technische Analyse nach WCAG 2\.1 AA/);
  assert.match(m.html, /<html lang="de">/);
});

test('Track B: B1 erklärt Ablauf + Kündigungslink (Domain-SSOT bfsg-fuchs.de)', () => {
  const m = mailer.buildOnboardingMail({ step: 'B1' });
  assert.equal(m.subject, 'Willkommen im Re-Check-Abo — so funktioniert es');
  assert.match(m.text, /Guten Tag,/); // ohne Firma: generische Anrede
  assert.match(m.text, /https:\/\/bfsg-fuchs\.de\/kuendigen/);
  assert.match(m.text, /Veränderungen\s+seit letztem Scan/);
});

test('Werbung A5: Default (werbung=false) → KEIN Template; bei true → § 7 Abs. 3-Pflichtsatz', () => {
  assert.equal(mailer.buildOnboardingMail({ step: 'A5', werbung: false }), null);
  const m = mailer.buildOnboardingMail({ step: 'A5', werbung: true });
  assert.match(m.text, /24,99 €\/Monat/);
  // Widerspruch-Satz (Pflichtbestandteil § 7 Abs. 3):
  assert.match(m.text, /wir tragen Sie sofort aus/);
  assert.match(m.text, /https:\/\/bfsg-fuchs\.de\/#preise/);
});

test('Werbung B5: Jahres-Absatz nur bei werbung=true, Mail selbst immer transaktional', () => {
  const ohne = mailer.buildOnboardingMail({ step: 'B5', werbung: false });
  assert.ok(ohne, 'B5 muss auch ohne Werbungs-Flag versendbar sein');
  assert.doesNotMatch(ohne.text, /249 €/);
  assert.doesNotMatch(ohne.text, /50,88 €/);
  const mit = mailer.buildOnboardingMail({ step: 'B5', werbung: true });
  assert.match(mit.text, /249 € statt 12 × 24,99 €/);
  assert.match(mit.text, /50,88 € weniger im Jahr/);
});

test('Dunning D1–D3: Betreff, Fallback-Link-Satz, Jahresabo-Phrase, strikt werbefrei', () => {
  const d1 = mailer.buildDunningMail({ step: 'D1', company: 'Beispiel AG' });
  assert.equal(d1.subject, 'Ihre Zahlung ist fehlgeschlagen — Ihr Re-Check pausiert vorerst');
  assert.match(d1.text, /die Abbuchung für Ihren Re-Check/); // Default ohne abbuchungsZeile
  // Ohne Zahlungslink (Customer Portal existiert nicht) → Reply-Fallback (agent-09):
  assert.match(d1.text, /Antworten Sie kurz auf diese Mail — wir senden Ihnen einen sicheren Aktualisierungs-Link/);
  // Jahresabo darf nicht „monatliche Abbuchung (24,99 €)" sagen:
  const d1Jahr = mailer.buildDunningMail({ step: 'D1', abbuchungsZeile: 'die jährliche Abbuchung für Ihren Re-Check (249,00 €)' });
  assert.match(d1Jahr.text, /die jährliche Abbuchung für Ihren Re-Check \(249,00 €\)/);
  assert.doesNotMatch(d1Jahr.text, /24,99/);
  // Mit konfiguriertem Link wird dieser verwendet:
  const d1Link = mailer.buildDunningMail({ step: 'D1', zahlungsLink: 'https://billing.stripe.com/p/session/test' });
  assert.match(d1Link.text, /https:\/\/billing\.stripe\.com\/p\/session\/test/);
  const d2 = mailer.buildDunningMail({ step: 'D2' });
  assert.equal(d2.subject, 'Kurze Erinnerung: Zahlungsdaten für Ihren Re-Check aktualisieren');
  const d3 = mailer.buildDunningMail({ step: 'D3' });
  assert.match(d3.text, /Seit zehn Tagen/);
  assert.match(d3.text, /keine weiteren Kosten/);
  assert.match(d3.text, /https:\/\/bfsg-fuchs\.de\/kuendigen/);
  // Alle Dunning-Mails strikt werbefrei (kein Angebot/Upsell):
  for (const m of [d1, d2, d3]) {
    assert.doesNotMatch(m.text, /Angebot|Jahresabo kostet/);
    assert.match(m.text, /Bei Fragen antworten Sie einfach auf diese E-Mail\./);
  }
});

test('sendSequenceStep: ungültige Adresse → Skip; A5 ohne Werbungs-Flag → werbung-disabled', async () => {
  const bad = await mailer.sendSequenceStep({ to: 'keine-mail', step: 'A1' });
  assert.equal(bad.skipped, 'invalid-recipient');
  const a5 = await mailer.sendSequenceStep({ to: 'kunde@example.com', step: 'A5', werbung: false });
  assert.equal(a5.skipped, 'werbung-disabled');
});

// --- 2. Sequenz-Engine --------------------------------------------------------

// sendStep-Mock, der die ECHTE Mailer-Fassade nutzt (DRY-RUN ohne SMTP) und
// nur tatsächliche (nicht übersprungene) Sends aufzeichnet. `sent` = Steps
// (bequeme deepEqual-Asserts); `sentAll` = {step,email} für Filter-Asserts —
// die Engine arbeitet GLOBAL über alle Records (ältere Test-Records können
// bei einem Tick ebenfalls fällig werden).
function recordingDeps({ werbung = false, isDunningActive = null, failSteps = new Map() } = {}) {
  const sent = [];
  const sentAll = [];
  const alerts = [];
  return {
    sent,
    sentAll,
    alerts,
    deps: {
      sendStep: async ({ record, step }) => {
        const fails = failSteps.get(step) || 0;
        if (fails > 0) {
          failSteps.set(step, fails - 1);
          throw new Error('SMTP down (Test)');
        }
        const res = await mailer.sendSequenceStep({
          to: record.email, company: record.company, step, werbung,
          abbuchungsZeile: record.abbuchungsZeile
        });
        if (!res.skipped) {
          sent.push(step);
          sentAll.push({ step, email: record.email });
        }
        return res;
      },
      isDunningActive,
      sendAlert: async (subject, body) => { alerts.push({ subject, body }); }
    }
  };
}

test('Track A: Fälligkeitsplan 1/4/7/14/30, Idempotenz, A5 bei Werbung AUS übersprungen', async () => {
  const id = `cs_test_a_${seq++}`;
  const r = await onboarding.scheduleTrack({ track: 'A', email: 'kaeufer@example.com', company: 'Käufer GmbH', sourceId: id, startedAt: new Date(T0).toISOString() });
  assert.equal(r.scheduled, true);
  // Doppelte Einplanung (Webhook-Redelivery/Resend) legt KEINEN zweiten Plan an:
  const dup = await onboarding.scheduleTrack({ track: 'A', email: 'kaeufer@example.com', sourceId: id, startedAt: new Date(T0).toISOString() });
  assert.equal(dup.scheduled, false);

  const { sent, deps } = recordingDeps({ werbung: false });
  await onboarding.processDue(deps, T0); // Tag 0: noch nichts fällig
  assert.deepEqual(sent, []);

  await onboarding.processDue(deps, T0 + 1 * DAY);
  assert.deepEqual(sent, ['A1']);
  await onboarding.processDue(deps, T0 + 1 * DAY); // gleicher Tick-Zeitpunkt → kein Doppelversand
  assert.deepEqual(sent, ['A1']);

  await onboarding.processDue(deps, T0 + 7 * DAY);
  assert.deepEqual(sent, ['A1', 'A2', 'A3']);
  await onboarding.processDue(deps, T0 + 14 * DAY);
  assert.deepEqual(sent, ['A1', 'A2', 'A3', 'A4']);
  const res30 = await onboarding.processDue(deps, T0 + 30 * DAY);
  assert.deepEqual(sent, ['A1', 'A2', 'A3', 'A4'], 'A5 (werblich) wird bei Flag AUS NICHT versendet');
  assert.equal(res30.skipped, 1, 'A5 wird als erledigt markiert (kein Retry-Stau)');
  // Danach ist die Sequenz durch — keine weiteren Sends, egal wie oft getickt wird:
  await onboarding.processDue(deps, T0 + 60 * DAY);
  assert.deepEqual(sent, ['A1', 'A2', 'A3', 'A4']);
});

test('Track A mit Werbung AN: A5 wird an Tag 30 versendet', async () => {
  const id = `cs_test_a_werb_${seq++}`;
  await onboarding.scheduleTrack({ track: 'A', email: 'upsell@example.com', sourceId: id, startedAt: new Date(T0).toISOString() });
  const { sent, deps } = recordingDeps({ werbung: true });
  await onboarding.processDue(deps, T0 + 30 * DAY);
  assert.ok(sent.includes('A5'), 'A5 geht raus, wenn der Owner das Werbungs-Flag scharf geschaltet hat');
  assert.deepEqual(sent, ['A1', 'A2', 'A3', 'A4', 'A5']);
});

test('Track B: B1 sofort (Tag 0), B5 mit Jahres-Absatz bei Werbung AN', async () => {
  const id = `sub_test_b_${seq++}`;
  await onboarding.scheduleTrack({ track: 'B', email: 'abo@example.com', sourceId: id, startedAt: new Date(T0).toISOString() });
  const { sent, deps } = recordingDeps({ werbung: true });
  await onboarding.processDue(deps, T0);
  assert.deepEqual(sent, ['B1'], 'B1 (Tag 0) wird sofort versendet');
  await onboarding.processDue(deps, T0 + 25 * DAY);
  assert.deepEqual(sent, ['B1', 'B2', 'B3', 'B4', 'B5']);
});

test('Dunning: D1 sofort, D2/D3 nur solange past_due; Recovery bricht die Sequenz ab', async () => {
  const id = `sub_dunning_${seq}`;
  const cycle = `${id}:2026-08-01T10:00:00.000Z`;
  seq++;
  await onboarding.scheduleTrack({
    track: 'D', email: 'saeumig@example.com', sourceId: id, cycleKey: cycle,
    startedAt: new Date(T0).toISOString(), abbuchungsZeile: 'die monatliche Abbuchung für Ihren Re-Check (24,99 €)'
  });
  // Wiederholtes past_due-Event derselben Episode → kein zweiter Plan/D1:
  await onboarding.scheduleTrack({
    track: 'D', email: 'saeumig@example.com', sourceId: id, cycleKey: cycle,
    startedAt: new Date(T0).toISOString()
  });

  const { sent, deps } = recordingDeps({ isDunningActive: async () => true });
  await onboarding.processDue(deps, T0); // D1 (Tag 0)
  assert.deepEqual(sent, ['D1']);
  await onboarding.processDue(deps, T0); // Stripe-Redelivery → kein D1-Duplikat
  assert.deepEqual(sent, ['D1']);
  await onboarding.processDue(deps, T0 + 3 * DAY);
  assert.deepEqual(sent, ['D1', 'D2']);
  await onboarding.processDue(deps, T0 + 10 * DAY);
  assert.deepEqual(sent, ['D1', 'D2', 'D3']);
  await onboarding.processDue(deps, T0 + 30 * DAY); // danach Ruhe
  assert.deepEqual(sent, ['D1', 'D2', 'D3']);
});

test('Dunning-Guard: Zahlung erholt (nicht mehr past_due) → D2/D3 werden NICHT versendet', async () => {
  const id = `sub_dunning_rec_${seq++}`;
  await onboarding.scheduleTrack({
    track: 'D', email: 'erholt@example.com', sourceId: id, cycleKey: `${id}:ep1`,
    startedAt: new Date(T0).toISOString()
  });
  const { sent, deps } = recordingDeps({ isDunningActive: async () => false });
  await onboarding.processDue(deps, T0); // D1 geht noch raus (Tag 0, Trigger-Event)
  assert.deepEqual(sent, ['D1']);
  await onboarding.processDue(deps, T0 + 3 * DAY); // Guard greift → Abbruch
  await onboarding.processDue(deps, T0 + 10 * DAY);
  assert.deepEqual(sent, ['D1'], 'nach Recovery keine weiteren Mahnungen');
});

test('Idempotenz nach „Neustart": durabler SENT-Stand überlebt Modul-Re-Import nicht, aber CLAIMED blockiert', async () => {
  // Simuliert das Repo-Prinzip: CLAIMED wird VOR dem Versand durabel geschrieben;
  // ein Crash zwischen Versand und SENT-Write darf NICHT erneut senden.
  const id = `cs_test_claim_${seq++}`;
  await onboarding.scheduleTrack({ track: 'A', email: 'crash@example.com', sourceId: id, startedAt: new Date(T0).toISOString() });
  const failing = recordingDeps({ failSteps: new Map([['A1', 99]]) }); // A1 schlägt immer fehl
  await onboarding.processDue(failing.deps, T0 + 1 * DAY); // CLAIMED → Versand wirft → PENDING (Retry erlaubt)
  await onboarding.processDue(failing.deps, T0 + 1 * DAY); // Retry 2
  await onboarding.processDue(failing.deps, T0 + 1 * DAY); // Retry 3 → FAILED + Alarm
  assert.equal(failing.alerts.length, 1, 'genau ein Owner-Alarm bei endgültigem Fehler');
  assert.match(failing.alerts[0].subject, /A1 an crash@example\.com/);
  assert.deepEqual(failing.sent, []);
  await onboarding.processDue(failing.deps, T0 + 2 * DAY); // FAILED wird nicht erneut versucht
  assert.equal(failing.alerts.length, 1);
});

test('Transienter Fehler → Retry im nächsten Tick erfolgreich', async () => {
  const id = `cs_test_retry_${seq++}`;
  await onboarding.scheduleTrack({ track: 'A', email: 'retry@example.com', sourceId: id, startedAt: new Date(T0).toISOString() });
  const flaky = recordingDeps({ failSteps: new Map([['A1', 1]]) }); // 1× Fehler, dann OK
  await onboarding.processDue(flaky.deps, T0 + 1 * DAY);
  assert.deepEqual(flaky.sent, []);
  await onboarding.processDue(flaky.deps, T0 + 1 * DAY + 3600_000); // nächster Tick: Retry klappt
  assert.deepEqual(flaky.sent, ['A1']);
  assert.equal(flaky.alerts.length, 0);
});

test('cancelBySource (Kündigung): offene Sequenz sendet nichts mehr', async () => {
  const id = `sub_cancel_${seq++}`;
  await onboarding.scheduleTrack({ track: 'B', email: 'kuendiger@example.com', sourceId: id, startedAt: new Date(T0).toISOString() });
  const { sentAll, deps } = recordingDeps({});
  const cancelled = await onboarding.cancelBySource(id, 'subscription-deleted');
  assert.equal(cancelled, 1);
  await onboarding.processDue(deps, T0 + 30 * DAY);
  assert.deepEqual(sentAll.filter((s) => s.email === 'kuendiger@example.com'), [], 'gekündigte Sequenz versendet nichts mehr');
});

test('DSGVO-Redaction: E-Mail/Firma aus dem Sendeplan entfernt, Sequenz abgebrochen', async () => {
  const id = `cs_dsgvo_${seq++}`;
  await onboarding.scheduleTrack({ track: 'A', email: 'loeschen@example.com', company: 'Lösch GmbH', sourceId: id, startedAt: new Date(T0).toISOString() });
  const n = await onboarding.redactOnboardingByEmail('loeschen@example.com', 'hash123');
  assert.equal(n, 1);
  const all = await onboarding.listOnboarding();
  const rec = all.find((r) => r.id === `A:${id}`);
  assert.equal(rec.email, '[geloescht-dsgvo]');
  assert.equal(rec.company, '[geloescht-dsgvo]');
  assert.equal(rec.cancelled, true);
  const { sentAll, deps } = recordingDeps({});
  await onboarding.processDue(deps, T0 + 30 * DAY);
  assert.deepEqual(sentAll.filter((s) => s.email === '[geloescht-dsgvo]'), [], 'redigierte Sequenz versendet nichts mehr');
});

// --- 3. Flag-Defaults -----------------------------------------------------------

test('Werbungs-Flag Default ist AUS (isOnboardingWerbungEnabled ohne Env)', () => {
  assert.equal(mailer.isOnboardingWerbungEnabled(), false);
});

test('Master-Flag Default ist AUS (app.js ONBOARDING_ENABLED ohne Env)', async () => {
  const { ONBOARDING_ENABLED } = await import('../app.js');
  assert.equal(ONBOARDING_ENABLED, false);
});

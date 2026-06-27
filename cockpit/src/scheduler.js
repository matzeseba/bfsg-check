/**
 * BFSG-OS Cockpit — Lokaler Scheduler (KEIN externer Cron-Daemon).
 *
 * Läuft NUR, wenn der PC an ist (kein 24/7-Versprechen).
 * Catch-up-Logik: Verpasster Tagescheck wird beim nächsten Start einmalig nachgeholt.
 * Schedules per ENV überschreibbar (SCHEDULER_DAILY_HOUR, SCHEDULER_WEEKLY_DAY, etc.).
 *
 * Exportiert: startScheduler()
 * Persistiert letzte Läufe nach: cockpit/out/scheduler.jsonl
 */

import fs from 'node:fs';
import path from 'node:path';
import { config, OUT_DIR } from './config.js';
import { log } from './log.js';
import { getAction } from './actions/registry.js';
import { createJob } from './engine/jobQueue.js';

// ── Konfig ────────────────────────────────────────────────────────────────────

const SCHEDULER_LOG = path.join(OUT_DIR, 'scheduler.jsonl');

// Stunde (0–23) für den täglichen Tagescheck (Standard: 8 Uhr)
const DAILY_HOUR = Math.max(0, Math.min(23,
  parseInt(process.env.SCHEDULER_DAILY_HOUR ?? '8', 10) || 8,
));

// Wochentag (0=So … 6=Sa) für den Wochenreport (Standard: 1 = Montag)
const WEEKLY_DAY = Math.max(0, Math.min(6,
  parseInt(process.env.SCHEDULER_WEEKLY_DAY ?? '1', 10) || 1,
));

// Stunde für den Wochenreport (Standard: 9 Uhr)
const WEEKLY_HOUR = Math.max(0, Math.min(23,
  parseInt(process.env.SCHEDULER_WEEKLY_HOUR ?? '9', 10) || 9,
));

// Maximale Catch-up-Periode in Stunden (Standard: 16 h — nur innerhalb desselben Arbeitstages)
const CATCHUP_MAX_HOURS = Math.max(1,
  parseInt(process.env.SCHEDULER_CATCHUP_MAX_HOURS ?? '16', 10) || 16,
);

// Tick-Intervall in Millisekunden (Standard: 60 s — jede Minute prüfen)
const TICK_MS = Math.max(10_000,
  parseInt(process.env.SCHEDULER_TICK_MS ?? '60000', 10) || 60_000,
);

// ── Persistenz ────────────────────────────────────────────────────────────────

/**
 * Liest die letzte Lauf-Zeit für einen Job-Typ aus scheduler.jsonl.
 * @param {string} jobType z.B. 'daily-check' | 'weekly-report'
 * @returns {Date|null} Letzter Lauf oder null
 */
function readLastRun(jobType) {
  try {
    if (!fs.existsSync(SCHEDULER_LOG)) return null;
    const lines = fs.readFileSync(SCHEDULER_LOG, 'utf8').trim().split('\n');
    // Vom Ende lesen — letzter Eintrag gewinnt
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.jobType === jobType && entry.ts) {
          return new Date(entry.ts);
        }
      } catch { /* Zeile beschädigt, überspringen */ }
    }
  } catch { /* Datei nicht lesbar */ }
  return null;
}

/**
 * Schreibt einen Lauf-Eintrag in scheduler.jsonl (append-only).
 * @param {string} jobType
 * @param {string} jobId UUID aus der Job-Queue
 * @param {'scheduled'|'catchup'} trigger
 */
function writeLastRun(jobType, jobId, trigger = 'scheduled') {
  const entry = { ts: new Date().toISOString(), jobType, jobId, trigger };
  try {
    fs.appendFileSync(SCHEDULER_LOG, JSON.stringify(entry) + '\n', 'utf8');
  } catch (e) {
    log.warn(e, '[scheduler] Konnte Lauf nicht persistieren');
  }
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

/** Gibt true zurück, wenn zwei Date-Objekte denselben Kalendertag teilen. */
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Gibt true zurück, wenn zwei Date-Objekte dieselbe ISO-Woche teilen. */
function isSameIsoWeek(a, b) {
  const getMonday = (d) => {
    const copy = new Date(d);
    const day = copy.getDay(); // 0=So
    const diff = (day === 0 ? -6 : 1 - day);
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };
  return getMonday(a).getTime() === getMonday(b).getTime();
}

/**
 * Versucht, eine Action sicher zu starten.
 * Gibt die Job-ID oder null zurück.
 * @param {string} actionId z.B. 'A01'
 * @param {Record<string,unknown>} args
 * @returns {string|null}
 */
function launchAction(actionId, args = {}) {
  const def = getAction(actionId);
  if (!def) {
    log.error(`[scheduler] Unbekannte Action-ID: ${actionId}`);
    return null;
  }
  try {
    const job = createJob(def, args);
    log.info(`[scheduler] Job gestartet: ${def.label} (${job.id})`);
    return job.id;
  } catch (e) {
    log.error(e, `[scheduler] Fehler beim Starten von ${actionId}`);
    return null;
  }
}

// ── Täglicher Tagescheck (A01) ────────────────────────────────────────────────

/**
 * Prüft, ob der Tagescheck heute schon gelaufen ist.
 * Falls nicht und die aktuelle Stunde ≥ DAILY_HOUR (und max. CATCHUP_MAX_HOURS verpasst):
 * → Catchup-Lauf.
 * Falls aktuelle Stunde === DAILY_HOUR (im aktuellen Tick-Fenster): → regulärer Lauf.
 * @param {Date} now
 */
function tickDailyCheck(now) {
  const lastRun = readLastRun('daily-check');

  // Heute schon gelaufen → nichts tun
  if (lastRun && isSameDay(lastRun, now)) return;

  const currentHour = now.getHours();

  // Catch-up: PC war aus, der reguläre Slot wurde verpasst, aber wir sind noch im Arbeitstag-Fenster
  if (currentHour > DAILY_HOUR && currentHour <= DAILY_HOUR + CATCHUP_MAX_HOURS) {
    log.info(`[scheduler] Catch-up Tagescheck (${currentHour}h ≥ ${DAILY_HOUR}h, nicht ausgeführt heute)`);
    const jobId = launchAction('A01');
    if (jobId) writeLastRun('daily-check', jobId, 'catchup');
    return;
  }

  // Regulär: genau zur Zielstunde auslösen
  if (currentHour === DAILY_HOUR) {
    log.info(`[scheduler] Regulärer Tagescheck (${DAILY_HOUR}:xx Uhr)`);
    const jobId = launchAction('A01');
    if (jobId) writeLastRun('daily-check', jobId, 'scheduled');
  }
}

// ── Wöchentlicher KPI-Report (A02) ───────────────────────────────────────────

/**
 * Prüft, ob der Wochenreport diese Woche schon gelaufen ist.
 * Catch-up: gleiche Woche, Ziel-Wochentag überschritten, aber noch nicht zu alt (CATCHUP_MAX_HOURS).
 * @param {Date} now
 */
function tickWeeklyReport(now) {
  const lastRun = readLastRun('weekly-report');

  // Diese Woche schon gelaufen → nichts tun
  if (lastRun && isSameIsoWeek(lastRun, now)) return;

  const currentDay = now.getDay();
  const currentHour = now.getHours();

  // Catch-up: gleiche Woche, Ziel-Tag schon vorbei oder heute nach dem Slot
  const dayDiff = (currentDay - WEEKLY_DAY + 7) % 7;
  if (
    dayDiff === 0 && currentHour > WEEKLY_HOUR && currentHour <= WEEKLY_HOUR + CATCHUP_MAX_HOURS
  ) {
    log.info(`[scheduler] Catch-up Wochenreport (${currentHour}h, Slot war ${WEEKLY_HOUR}h)`);
    const jobId = launchAction('A02');
    if (jobId) writeLastRun('weekly-report', jobId, 'catchup');
    return;
  }

  // Regulär: exakt am Ziel-Wochentag zur Ziel-Stunde
  if (currentDay === WEEKLY_DAY && currentHour === WEEKLY_HOUR) {
    log.info(`[scheduler] Regulärer Wochenreport (Wochentag ${WEEKLY_DAY}, ${WEEKLY_HOUR}:xx Uhr)`);
    const jobId = launchAction('A02');
    if (jobId) writeLastRun('weekly-report', jobId, 'scheduled');
  }
}

// ── Tick-Loop ─────────────────────────────────────────────────────────────────

let tickInterval = null;

function tick() {
  const now = new Date();
  try {
    tickDailyCheck(now);
    tickWeeklyReport(now);
  } catch (e) {
    log.error(e, '[scheduler] Unerwarteter Fehler im Tick');
  }
}

/**
 * Startet den lokalen Scheduler.
 * Aufruf: einmal im server.listen-Callback.
 * Sicher gegen Mehrfach-Aufruf (idempotent).
 */
export function startScheduler() {
  if (tickInterval) {
    log.warn('[scheduler] startScheduler() wurde bereits aufgerufen — ignoriert');
    return;
  }
  log.info(
    `[scheduler] Gestartet. Tagescheck: ${DAILY_HOUR}:00 Uhr | ` +
    `Wochenreport: Wochentag ${WEEKLY_DAY}, ${WEEKLY_HOUR}:00 Uhr | ` +
    `Tick: alle ${TICK_MS / 1000}s | Catch-up-Fenster: ${CATCHUP_MAX_HOURS}h`,
  );

  // Sofort einen ersten Tick ausführen (Catch-up beim Start)
  tick();

  tickInterval = setInterval(tick, TICK_MS);
}

/**
 * Stoppt den Scheduler (für sauberes Shutdown / Tests).
 */
export function stopScheduler() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
    log.info('[scheduler] Gestoppt');
  }
}

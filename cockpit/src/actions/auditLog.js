// Append-only Audit-Trail aller Cockpit-Aktionen (GoBD-tauglich).
//
// R-04: Automatische Rotation bei Überschreiten von AUDIT_MAX_BYTES (Standard: 5 MB).
// Rotation benennt die aktuelle Datei in .1 um (ältere Rotation .1 → .2 usw., max. 3).
// Die Rotation läuft synchron und greift ausschließlich beim Schreiben — die append-only-
// Semantik bleibt gewahrt (kein Inhalt wird gelöscht, nur Dateien umbenannt).
import fs from 'node:fs';
import { config } from '../config.js';
import { log } from '../log.js';

/** Maximale Dateigröße des Audit-Logs vor Rotation (Bytes). Standard: 5 MB. */
const AUDIT_MAX_BYTES = Number(process.env.AUDIT_MAX_BYTES) || 5 * 1024 * 1024;

/** Anzahl aufbewahrter Rotations-Dateien (z.B. 3 → .1 .2 .3). */
const AUDIT_MAX_ROTATIONS = 3;

/**
 * Rotiert das Audit-Log, falls es die Größengrenze überschreitet.
 * Läuft synchron, damit appendAudit() atomar bleibt.
 *
 * Strategie: .jsonl → .jsonl.1 → .jsonl.2 → ... → .jsonl.N (älteste wird verworfen)
 */
function maybeRotate(filePath) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    // Datei existiert noch nicht — keine Rotation nötig
    return;
  }

  if (stat.size < AUDIT_MAX_BYTES) return;

  log.info(
    { path: filePath, sizeBytes: stat.size, maxBytes: AUDIT_MAX_BYTES },
    'AuditLog: Größenlimit erreicht — Rotation starten',
  );

  // Älteste Rotation verwerfen, dann shift: .2 → .3, .1 → .2, aktiv → .1
  for (let i = AUDIT_MAX_ROTATIONS; i >= 1; i--) {
    const older = `${filePath}.${i}`;
    const newer = `${filePath}.${i - 1 === 0 ? '' : i - 1}`;
    const src = i === 1 ? filePath : `${filePath}.${i - 1}`;
    const dst = older;
    try {
      if (fs.existsSync(src)) fs.renameSync(src, dst);
    } catch (e) {
      log.warn({ err: e.message, src, dst }, 'AuditLog: Rotations-Umbenennung fehlgeschlagen');
    }
  }

  log.info({ path: filePath }, 'AuditLog: Rotation abgeschlossen, neue Datei beginnt');
}

export function appendAudit(entry) {
  const filePath = config.paths.auditLog;
  // Rotation prüfen, bevor neuer Eintrag angehängt wird
  maybeRotate(filePath);
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
  fs.appendFileSync(filePath, line, 'utf8');
}

export function readAudit(limit = 200) {
  try {
    const raw = fs.readFileSync(config.paths.auditLog, 'utf8').trim();
    if (!raw) return [];
    return raw.split('\n').slice(-limit).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch {
    return [];
  }
}

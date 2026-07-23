#!/usr/bin/env node
// Preis-Sync-Check: vergleicht die Paket-/Preis-Konfiguration zwischen
// scanner/app.js (PACKAGES — Checkout-Abrechnung) und
// landingpage-next/lib/config.ts (PACKAGES + ABO_ANNUAL + COOKIE_PACKAGES +
// RECHECK_* + STARTPAKET_* — Anzeige).
// Schlägt mit Exit 1 fehl, wenn Paket-IDs, Cent-Beträge oder available-Flags
// auseinanderlaufen — sonst zeigt die Landingpage andere Preise als der Checkout
// berechnet. Läuft in der PR-CI (Job price-sync). Nur Node-Stdlib, keine Deps.
//
// Erweiterung Abo-Tiers (agent-01, 23.07.2026):
//  - Bedingte Backend-Blöcke werden GRUPPENWEISE erkannt (z. B. "ENABLE_ABO" für
//    abo/abo-jahr, "ENABLE_ABO && ABO_TIERS_ENABLED" für die neuen Tier-/
//    Startpaket-Pakete). Pro Gruppe gilt: Frontend muss available explizit
//    setzen und alle Pakete der Gruppe tragen denselben Wert (sie hängen am
//    selben Server-Flag).
//  - Doppelte Frontend-IDs (z. B. 'abo' als Legacy-Karte in PACKAGES und als
//    Starter-Karte in RECHECK_PACKAGES) sind erlaubt, müssen aber in Preis und
//    available-Flag übereinstimmen — sonst zeigt die Seite zwei Wahrheiten.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP_JS = join(root, 'scanner', 'app.js');
const CONFIG_TS = join(root, 'landingpage-next', 'lib', 'config.ts');

const errors = [];

// --- scanner/app.js: PACKAGES-Block extrahieren (klammerbalanciert) ---
function parseBackendPackages(src) {
  const startMarker = 'const PACKAGES = {';
  const start = src.indexOf(startMarker);
  if (start === -1) {
    errors.push('scanner/app.js: "const PACKAGES = {" nicht gefunden.');
    return new Map();
  }
  let depth = 0;
  let end = -1;
  const bodyStart = start + startMarker.length - 1; // Position der öffnenden {
  for (let i = bodyStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) {
    errors.push('scanner/app.js: PACKAGES-Block nicht klammerbalanciert.');
    return new Map();
  }
  const block = src.slice(bodyStart, end + 1);

  // Bedingte Spread-Blöcke erfassen: „...(ENABLE_ABO ? {" oder
  // „...(ENABLE_ABO && ABO_TIERS_ENABLED ? {". Pro Marker Position + normalisierte
  // Bedingung merken; ein Paket-Eintrag gehört zur Gruppe des LETZTEN Markers
  // vor ihm (Einträge vor dem ersten Marker = unkonditional, immer aktiv).
  const markers = [];
  const markerRe = /\.\.\.\(\s*([A-Z_]+(?:\s*&&\s*[A-Z_]+)*)\s*\?/g;
  let mm;
  while ((mm = markerRe.exec(block)) !== null) {
    markers.push({ index: mm.index, condition: mm[1].replace(/\s+/g, ' ') });
  }

  const pkgs = new Map();
  const entryRe = /(?:'([^']+)'|([A-Za-z][\w-]*))\s*:\s*\{([^}]*)\}/g;
  let m;
  while ((m = entryRe.exec(block)) !== null) {
    const id = m[1] || m[2];
    const body = m[3];
    const amountMatch = body.match(/amount:\s*(\d+)/);
    if (!amountMatch) continue; // kein Preis-Eintrag (defensiv)
    let condition = null;
    for (const mk of markers) {
      if (mk.index < m.index) condition = mk.condition;
      else break;
    }
    pkgs.set(id, {
      amountCents: Number(amountMatch[1]),
      conditional: condition // null = immer aktiv; sonst Flag-Gruppe (z. B. 'ENABLE_ABO')
    });
  }
  return pkgs;
}

// --- landingpage-next/lib/config.ts: Paket-Einträge über id:"..." finden ---
// Liefert ALLE Vorkommen je ID (Duplikate werden danach auf Konsistenz geprüft).
function parseFrontendPackages(src) {
  const occurrences = new Map(); // id -> [{ amountCents, available }]
  const idRe = /\bid:\s*"([^"]+)"/g;
  let m;
  while ((m = idRe.exec(src)) !== null) {
    const id = m[1];
    // Fenster bis zum nächsten id:-Eintrag (oder Dateiende) nach amountCents/available scannen.
    idRe.lastIndex = m.index + m[0].length;
    const nextId = src.indexOf('id:', idRe.lastIndex);
    const windowEnd = nextId === -1 ? src.length : nextId;
    const win = src.slice(m.index, windowEnd);
    const amountMatch = win.match(/amountCents:\s*(\d+)/);
    const availableMatch = win.match(/available:\s*(true|false)/);
    if (!amountMatch) continue; // id ohne Preis (z. B. annualId-Verweis) — kein Paket-Eintrag
    if (!occurrences.has(id)) occurrences.set(id, []);
    occurrences.get(id).push({
      amountCents: Number(amountMatch[1]),
      available: availableMatch ? availableMatch[1] === 'true' : null // null = nicht gesetzt (Default true)
    });
  }
  // Duplikat-Konsistenz + Merge auf einen Wert je ID.
  const pkgs = new Map();
  for (const [id, list] of occurrences) {
    const first = list[0];
    for (const occ of list.slice(1)) {
      if (occ.amountCents !== first.amountCents) {
        errors.push(
          `Doppelter Eintrag "${id}" in landingpage-next/lib/config.ts mit abweichenden Preisen ` +
          `(${first.amountCents} ct vs. ${occ.amountCents} ct) — Duplikate müssen denselben Preis tragen.`
        );
      }
      if (occ.available !== first.available) {
        errors.push(
          `Doppelter Eintrag "${id}" in landingpage-next/lib/config.ts mit abweichenden available-Flags ` +
          `(${first.available} vs. ${occ.available}) — Duplikate müssen denselben Wert tragen.`
        );
      }
    }
    pkgs.set(id, first);
  }
  return pkgs;
}

const backend = parseBackendPackages(readFileSync(APP_JS, 'utf8'));
const frontend = parseFrontendPackages(readFileSync(CONFIG_TS, 'utf8'));

// 1) Paket-IDs müssen deckungsgleich sein.
for (const id of backend.keys()) {
  if (!frontend.has(id)) {
    errors.push(`Paket "${id}" fehlt in landingpage-next/lib/config.ts (Backend: scanner/app.js).`);
  }
}
for (const id of frontend.keys()) {
  if (!backend.has(id)) {
    errors.push(`Paket "${id}" fehlt in scanner/app.js PACKAGES (Frontend: landingpage-next/lib/config.ts).`);
  }
}

// 2) Cent-Beträge müssen übereinstimmen.
for (const [id, b] of backend) {
  const f = frontend.get(id);
  if (!f) continue;
  if (b.amountCents !== f.amountCents) {
    errors.push(
      `Preis-Divergenz bei "${id}": scanner/app.js amount=${b.amountCents} ct, ` +
      `landingpage config.ts amountCents=${f.amountCents} ct.`
    );
  }
}

// 3) available-Flags:
//    - Backend-unkonditional (basis/profi/cookie-*): Frontend muss kaufbar sein
//      (available true oder nicht gesetzt — Default ist true).
//    - Backend-konditional (Flag-Gruppe, z. B. ENABLE_ABO für abo/abo-jahr,
//      'ENABLE_ABO && ABO_TIERS_ENABLED' für die Tier-/Startpaket-Pakete):
//      Frontend muss das Flag EXPLIZIT setzen (spiegelt manuell das Server-Flag),
//      und alle Pakete DIESER GRUPPE müssen denselben Wert tragen.
const groupAvailable = new Map(); // condition -> Map(id -> available)
for (const [id, b] of backend) {
  const f = frontend.get(id);
  if (!f) continue;
  if (!b.conditional) {
    if (f.available === false) {
      errors.push(
        `Verfügbarkeits-Divergenz bei "${id}": Backend bietet das Paket immer an, ` +
        'landingpage config.ts setzt aber available: false.'
      );
    }
  } else {
    if (f.available === null) {
      errors.push(
        `available-Flag fehlt bei "${id}": Das Backend-Paket hängt am Server-Flag "${b.conditional}" — ` +
        'landingpage config.ts muss available explizit true/false setzen (Spiegel des Server-Flags).'
      );
    } else {
      if (!groupAvailable.has(b.conditional)) groupAvailable.set(b.conditional, new Map());
      groupAvailable.get(b.conditional).set(id, f.available);
    }
  }
}
for (const [condition, entries] of groupAvailable) {
  const values = new Set(entries.values());
  if (values.size > 1) {
    errors.push(
      `available-Flags der "${condition}"-Pakete sind uneinheitlich ` +
      `(${[...entries.entries()].map(([id, v]) => `${id}=${v}`).join(', ')}) — ` +
      'alle hängen am selben Server-Flag und müssen denselben Wert tragen.'
    );
  }
}

if (errors.length > 0) {
  console.error('Preis-Sync FEHLGESCHLAGEN — scanner/app.js ↔ landingpage-next/lib/config.ts laufen auseinander:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `Preis-Sync OK: ${backend.size} Pakete deckungsgleich ` +
  '(IDs, Cent-Beträge, available-Flags) zwischen scanner/app.js und landingpage-next/lib/config.ts.'
);

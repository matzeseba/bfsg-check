#!/usr/bin/env node
// Preis-Sync-Check: vergleicht die Paket-/Preis-Konfiguration zwischen
// scanner/app.js (PACKAGES — Checkout-Abrechnung) und
// landingpage-next/lib/config.ts (PACKAGES + ABO_ANNUAL + COOKIE_PACKAGES — Anzeige).
// Schlägt mit Exit 1 fehl, wenn Paket-IDs, Cent-Beträge oder available-Flags
// auseinanderlaufen — sonst zeigt die Landingpage andere Preise als der Checkout
// berechnet. Läuft in der PR-CI (Job price-sync). Nur Node-Stdlib, keine Deps.

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
  // Einträge hinter "...(ENABLE_ABO ? { ... } : {})" sind konditional (Server-Flag).
  const conditionalMarker = block.indexOf('...(ENABLE_ABO');
  const pkgs = new Map();
  const entryRe = /(?:'([^']+)'|([A-Za-z][\w-]*))\s*:\s*\{([^}]*)\}/g;
  let m;
  while ((m = entryRe.exec(block)) !== null) {
    const id = m[1] || m[2];
    const body = m[3];
    const amountMatch = body.match(/amount:\s*(\d+)/);
    if (!amountMatch) continue; // kein Preis-Eintrag (defensiv)
    pkgs.set(id, {
      amountCents: Number(amountMatch[1]),
      conditional: conditionalMarker !== -1 && m.index > conditionalMarker
    });
  }
  return pkgs;
}

// --- landingpage-next/lib/config.ts: Paket-Einträge über id:"..." finden ---
function parseFrontendPackages(src) {
  const pkgs = new Map();
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
    pkgs.set(id, {
      amountCents: Number(amountMatch[1]),
      available: availableMatch ? availableMatch[1] === 'true' : null // null = nicht gesetzt (Default true)
    });
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
//    - Backend-konditional (ENABLE_ABO, z. B. abo/abo-jahr): Frontend muss das Flag
//      EXPLIZIT setzen (spiegelt manuell das Server-Flag), und alle konditionalen
//      Pakete müssen denselben Wert tragen (hängen am selben Server-Flag).
const conditionalAvailable = new Map();
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
        `available-Flag fehlt bei "${id}": Das Backend-Paket hängt am Server-Flag ENABLE_ABO — ` +
        'landingpage config.ts muss available explizit true/false setzen (Spiegel des Server-Flags).'
      );
    } else {
      conditionalAvailable.set(id, f.available);
    }
  }
}
const conditionalValues = new Set(conditionalAvailable.values());
if (conditionalValues.size > 1) {
  errors.push(
    'available-Flags der ENABLE_ABO-Pakete sind uneinheitlich ' +
    `(${[...conditionalAvailable.entries()].map(([id, v]) => `${id}=${v}`).join(', ')}) — ` +
    'alle hängen am selben Server-Flag und müssen denselben Wert tragen.'
  );
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

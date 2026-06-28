// Regressions-Smoke SSRF C1 (Cookie-Pfad): scanCookie() muss den IP-Pin
// (--host-resolver-rules=MAP) ueber pinnedHostResolverArg an chromium.launch
// uebergeben — 1:1 wie scanUrl/scanSite in scan.js. Ohne diesen Pin bleibt im
// TOCTOU-Restfenster zwischen verifyNoDnsRebinding und Chromiums eigener
// Aufloesung ein DNS-Rebind moeglich.
//
// Browser-frei: der bezahlte Cookie-Scan startet einen echten Chromium und ist
// daher (wie scan.js) nicht im Logik-Test-Pfad. Dieser Guard prueft stattdessen
// am Quelltext, dass die Pin-Verdrahtung vorhanden bleibt — entfernt jemand den
// Pin, schlaegt der Test fehl (sonst blieben alle uebrigen Tests gruen).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cookieSrc = readFileSync(
  fileURLToPath(new URL('../lib/scan-cookie.js', import.meta.url)),
  'utf8'
);
const scanSrc = readFileSync(
  fileURLToPath(new URL('../lib/scan.js', import.meta.url)),
  'utf8'
);

// Die exakte Launch-Arg-Komposition, die scan.js fuer den Pin nutzt.
const LAUNCH_PIN_SPREAD = "...(pinArg ? [pinArg] : [])";

test('Cookie-Pin: scan-cookie.js importiert pinnedHostResolverArg', () => {
  assert.match(cookieSrc, /import\s*{[^}]*\bpinnedHostResolverArg\b[^}]*}\s*from\s*'\.\/url-guard\.js'/);
});

test('Cookie-Pin: pinArg wird aus der verifizierten Adresse gebildet', () => {
  assert.match(
    cookieSrc,
    /const\s+pinArg\s*=\s*pinnedHostResolverArg\(\s*new URL\(safe\.url\)\.hostname\s*,\s*safe\.addresses\s*\)/
  );
});

test('Cookie-Pin: chromium.launch erhaelt den Pin via Spread (Parity zu scan.js)', () => {
  assert.ok(
    cookieSrc.includes(LAUNCH_PIN_SPREAD),
    'scan-cookie.js muss den Pin per ...(pinArg ? [pinArg] : []) in die Launch-Args spreaden'
  );
  // Parity: scan.js nutzt exakt dieselbe Komposition — bricht die hier, ist die
  // Annahme dieses Guards veraltet und muss mitgezogen werden.
  assert.ok(
    scanSrc.includes(LAUNCH_PIN_SPREAD),
    'scan.js (Referenz) muss dieselbe Pin-Spread-Komposition nutzen'
  );
});

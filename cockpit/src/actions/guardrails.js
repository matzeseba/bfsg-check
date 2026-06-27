// 5-Ebenen-Governance. Schützt vor UWG-/Compliance-Verstößen.
// Quelle der Regeln: CLAUDE.md (Compliance) + LEGAL-REALITY-CHECK-2026.
import { config } from '../config.js';

// Ebene 1 — Blacklist: harte Verbote (auch bei "approve" nicht ausführbar).
const BLACKLIST = [
  { re: /\bcold[\s-]?mail|kaltakquise|massenmail\b/i, reason: 'Cold-Mail an Einzelpersonen (UWG §7 II Nr.2)' },
  { re: /\blinkedin\b.*\b(dm|nachricht|anschreiben)|xing\b.*\b(dm|nachricht)/i, reason: 'LinkedIn/Xing-DM an Fremde (OLG Hamm 18 U 154/22)' },
  { re: /schleichwerbung|getarnte werbung/i, reason: 'Schleichwerbung (UWG §5a IV / §22 MStV)' },
];

// Ebene 2 — Formulation-Guard: verbotene Werbe-Aussagen.
const FORBIDDEN_WORDS = [
  { re: /\bbfsg[\s-]?konform\b/i, reason: '„BFSG-konform" (UWG §5 Irreführung)' },
  { re: /\brechtssicher\b/i, reason: '„rechtssicher" (UWG §5)' },
  { re: /\bgarantiert\b|\bgarantie\b/i, reason: '„garantiert/Garantie" (UWG §5)' },
  { re: /\bt[üu]v\b|\bdekra\b/i, reason: 'TÜV/DEKRA-Siegel ohne Zertifizierung' },
  { re: /\b100\s?%\s?(sicher|konform)\b/i, reason: '„100% sicher/konform"' },
];

const ALLOWED_CHANNELS = new Set([
  'google-ads', 'bing-ads', 'seo', 'openpr', 'inar', 'firmenpresse',
  'saashub', 'g2', 'capterra', 'omr', 'recherchescout', 'haro',
  'awesome-list', 'show-hn', 'brevo',
]);

// Ebene 1+5: prüft eine Aktion VOR Ausführung.
export function checkAction(actionDef, args = {}) {
  const text = JSON.stringify(args).toLowerCase();
  for (const { re, reason } of BLACKLIST) {
    if (re.test(text)) return { ok: false, reason };
  }
  // Budget-Cap (Ads)
  const dailyBudget = Number(args.dailyBudget ?? args.budget ?? 0);
  if (dailyBudget > 100) return { ok: false, reason: `Ads-Tagesbudget ${dailyBudget}€ > 100€ Hard-Cap` };
  // Refund-Cap
  const amount = Number(args.amount ?? 0);
  if (actionDef.id === 'A10' && amount > 500) return { ok: false, reason: `Refund ${amount}€ > 500€ ohne expliziten Abgleich` };
  // Channel-Whitelist (falls Aktion einen Kanal nennt)
  if (args.channel && !ALLOWED_CHANNELS.has(String(args.channel).toLowerCase())) {
    return { ok: false, reason: `Kanal "${args.channel}" nicht auf der Whitelist` };
  }
  return { ok: true };
}

// Ebene 2: prüft generierten Text. PASS/WARN/FAIL — nie still ändern.
export function formulationGuard(text = '') {
  const hits = [];
  for (const { re, reason } of FORBIDDEN_WORDS) {
    const m = text.match(re);
    if (m) hits.push({ match: m[0], reason });
  }
  return { verdict: hits.length ? 'FAIL' : 'PASS', hits };
}

export { ALLOWED_CHANNELS, config as _config };

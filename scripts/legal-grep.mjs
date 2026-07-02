#!/usr/bin/env node
/**
 * legal-grep.mjs — CI-Gate: Regex-Scan auf verbotene Marketing-Claims.
 *
 * Scannt marketing/**\/*.md sowie landingpage-next/{app,components,lib}/**
 * auf die verbotenen Formulierungen (siehe CLAUDE.md → Pflicht-Sprache):
 *   „BFSG-konform", „rechtssicher", „garantiert" (Wortstamm), „TÜV", „DEKRA".
 *
 * Whitelist: legitime Negationen, Disclaimer und Meta-Diskussion
 * (z. B. „keine Garantie", „nicht BFSG-konform", „kein TÜV") werden
 * NICHT geflaggt — Kalibrierung gegen den Repo-Stand vom 02.07.2026,
 * fachliches Vorbild: scripts/legal_copy_grep.py (tiefere Analyse, mehr Regeln).
 *
 * Exit 0 = clean, Exit 1 = Treffer (Ausgabe Datei:Zeile).
 * Nur Node-Stdlib, keine Dependencies. Aufruf: node scripts/legal-grep.mjs
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));

// ---------------------------------------------------------------------------
// Verbotene Muster (case-insensitive)
// ---------------------------------------------------------------------------
// Hinweis „BFSG-konform": Nur das Claim-Adjektiv wird geflaggt. Das Substantiv
// „BFSG-Konformität" ist per Negative-Lookahead ausgenommen — es kommt im Repo
// ausschließlich in Disclaimern und neutraler Diskussion vor („keine Garantie
// für … BFSG-Konformität", „kein Maßstab für BFSG-Konformität"). Ein Versprechen
// wie „volle/100 % Konformität" fängt das eigene Muster darunter.
const FORBIDDEN = [
  { name: "BFSG-konform", re: /BFSG[-\s.]?konform(?!ität)/gi },
  { name: "rechtssicher", re: /rechtssicher/gi },
  { name: "garantiert (Wortstamm)", re: /garant\w*/gi },
  { name: "TÜV", re: /\bT(ÜV|UEV)\b/gi },
  { name: "DEKRA", re: /\bDEKRA\b/gi },
  { name: "100 %/volle Konformität", re: /(100\s*%|volle)\s*(BFSG-)?Konformität/gi },
];

// ---------------------------------------------------------------------------
// Whitelist: legitime Negationen / Disclaimer / Meta-Diskussion.
// Geprüft gegen ein Fenster aus Vorzeile + aktueller Zeile, damit umgebrochene
// Sätze („Keine Garantie für\nVollständigkeit … BFSG-Konformität") erkannt werden.
// ---------------------------------------------------------------------------
const WHITELIST = [
  // „keine Garantie", „keine Konformitätsgarantie", „Keine Empfehlung oder Garantie",
  // „Keine Konformitäts-, Garantie- oder Siegel-Claims", „keine … garantiert …"
  /kein(e[nrsm]?|erlei)?\s+(?:\S+\s+){0,4}\S*garant/i,
  // Negation im selben Satz, vor oder nach dem Wortstamm:
  // „nicht garantiert", „Es geht nicht um Garantien", „Garantie wird ausdrücklich nicht …"
  /\bnicht\b[^.!?]{0,40}garant/i,
  /garant[^.!?]{0,40}\bnicht\b/i,
  /ohne\s+\S*garantie/i,
  // Meta-Kompositum = Diskussion ÜBER Garantie-Sprache, kein Claim:
  // „Garantie-Claims", „Garantie-Eindruck", „Heils-/Garantie-Sprache", „Garantieversprechen"
  /garantie-/i,
  /garantieversprechen/i,
  // Zeilen, die Formulierungen explizit als irreführend/verboten einordnen
  /irreführ/i,
  /verboten/i,
  // „das kann kein Tool leisten", „das kann niemand"
  /kann\s+(kein|niemand)/i,
  // Negationen der übrigen Begriffe
  /nicht\s+BFSG[-\s]?konform/i,
  /kein(e[nrsm]?)?\s+(?:\S+\s+){0,3}(TÜV|TUEV|DEKRA)/i,
  // Google-/Bing-Ads-Keyword-Listen: Suchanfragen der Nutzer, keine eigenen Claims
  /bfsg\s+konform\s+machen/i,
  /cookie\s+banner\s+rechtssicher\s+2026/i,
  /keywords?\s*:/i,
];

// Code-Kommentare in TS/JS-Dateien sind nicht nutzersichtbar → kein Marketing-Claim.
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const COMMENT_LINE = /^\s*(\/\/|\/?\*|\{\/\*)/;

// ---------------------------------------------------------------------------
// Datei-Sammlung
// ---------------------------------------------------------------------------
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", ".turbo"]);
const TEXT_EXTS = new Set([
  ".md", ".mdx", ".txt", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".html", ".css",
]);

function walk(dir, extFilter, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // Verzeichnis existiert nicht → leise überspringen
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) walk(full, extFilter, out);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (extFilter ? extFilter.has(ext) : TEXT_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

const MD_ONLY = new Set([".md", ".mdx"]);
const files = [
  ...walk(join(REPO_ROOT, "marketing"), MD_ONLY, []),
  ...walk(join(REPO_ROOT, "landingpage-next", "app"), null, []),
  ...walk(join(REPO_ROOT, "landingpage-next", "components"), null, []),
  ...walk(join(REPO_ROOT, "landingpage-next", "lib"), null, []),
];

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------
const findings = [];

for (const file of files) {
  const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
  const isCode = CODE_EXTS.has(extname(file).toLowerCase());
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/);

  lines.forEach((line, i) => {
    if (isCode && COMMENT_LINE.test(line)) return;
    // Fenster für Whitelist-Prüfung: Vorzeile + aktuelle Zeile (Zeilenumbrüche in Sätzen)
    const window = (i > 0 ? lines[i - 1] + "\n" : "") + line;
    for (const rule of FORBIDDEN) {
      rule.re.lastIndex = 0;
      const match = rule.re.exec(line);
      if (!match) continue;
      if (WHITELIST.some((w) => w.test(window))) continue;
      findings.push({
        loc: `${rel}:${i + 1}`,
        rule: rule.name,
        hit: match[0],
        context: line.trim().slice(0, 140),
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Ausgabe + Exit-Code
// ---------------------------------------------------------------------------
console.log(`legal-grep: ${files.length} Dateien gescannt`);

if (findings.length === 0) {
  console.log("PASS — keine verbotenen Marketing-Claims gefunden.");
  process.exit(0);
}

console.error(`FAIL — ${findings.length} Treffer:`);
for (const f of findings) {
  console.error(`  ${f.loc}  [${f.rule}]  „${f.hit}"`);
  console.error(`    ${f.context}`);
}
console.error(
  "\nHinweis: Pflicht-Sprache siehe CLAUDE.md („automatisierte technische Analyse“ statt Konformitäts-/Garantie-Claims)."
);
process.exit(1);

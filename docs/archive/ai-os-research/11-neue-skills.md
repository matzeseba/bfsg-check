# Neue Skills — Uebersicht (S1–S7)

> **Erstellt:** 21.06.2026 · Status: alle 7 Skills gebaut und deployt

---

## Ueberblick

| # | Skill-Ordner | Trigger (Beispiel) | Kategorie | Agency-Agent |
|---|---|---|---|---|
| S1 | `ads-performance-pull` | "Ads-Performance", "Wie laufen die Ads?" | Quick-Action | `paid-media-ppc-strategist` |
| S2 | `ab-test-tracker` | "A/B-Test", "Haben wir einen Gewinner?" | Quick / Generator | `paid-media-auditor` |
| S3 | `scan-dataset-aggregat` | "Scan-Statistiken", "Daten fuer Show-HN" | Quick-Action | `support-analytics-reporter` |
| S4 | `upsell-trigger` | "Up-Sell-Check", "Upgrade-Kandidaten" | Generator (Draft only) | `marketing-email-strategist` |
| S5 | `legal-copy-grep` | "Legal-Grep", "Compliance-Scan" | Quick-Action + CI | `support-legal-compliance-checker` |
| S6 | `backup-verify` | "Backup-Status", "Ist das Backup aktuell?" | Quick / Live-Aktion | `engineering-sre` |
| S7 | `stripe-revenue-snapshot` | "Stripe-Umsatz", "Revenue diese Woche" | Quick-Action | `finance-bookkeeper-controller` |

---

## Datei-Pfade

```
.claude/skills/
  ads-performance-pull/SKILL.md
  ab-test-tracker/SKILL.md
  scan-dataset-aggregat/SKILL.md
  upsell-trigger/SKILL.md
  legal-copy-grep/SKILL.md
  backup-verify/SKILL.md
  stripe-revenue-snapshot/SKILL.md

scripts/
  legal_copy_grep.py   <- lauffaehig, stdlib only, CI-tauglich
```

---

## Governance-Matrix

| Skill | Schreibt extern? | Pflicht-Bestaetigung? | Audit-Log? |
|---|---|---|---|
| ads-performance-pull | Nein | Nein | Nein |
| ab-test-tracker (lesen) | Nein | Nein | Nein |
| ab-test-tracker (neu anlegen) | Ja (out/ab-tests.jsonl) | Nein (lokale Datei) | ab-tests.jsonl |
| scan-dataset-aggregat | Nein | Nein | Nein |
| upsell-trigger | Ja (Brevo-Draft) | Ja (vor Draft-Erstellung) | cockpit-actions.jsonl |
| legal-copy-grep | Nein | Nein | optional legal-grep-results.jsonl |
| backup-verify (lesen) | Nein | Nein | Nein |
| backup-verify (Restore) | JA (produktiv) | PFLICHT ("RESTORE BESTAETIGT") | cockpit-actions.jsonl |
| stripe-revenue-snapshot | Nein | Nein | Nein |

---

## legal_copy_grep.py — Testlauf-Ergebnis (21.06.2026)

Lauf ueber: 66 Dateien (marketing/*.md + landingpage-next/**/*.{tsx,ts,mdx,md})

| Level | Treffer | Beurteilung |
|---|---|---|
| ROT | 16 | 8 in Zitat-/Warnung-Kontexten (false positive); 8 echt — pruefen |
| GELB | 5 | Kontext-abhaengig — z. B. "vollstaendig konform" in FAQ-Texten |
| INFO | 47 | "Gratis" durchgaengig — kein Verbot, Preisklarheit pruefen |

**Echte ROT-Treffer (kein Zitat-Kontext):**
- `landingpage-next/app/agb/page.tsx:35` — "Abmahnsicher" (AGB-Negativ-Abgrenzung — Kontext beachten)
- `landingpage-next/app/axe-lighthouse-wave-vergleich/page.tsx:124` — "BFSG-Konform"
- `landingpage-next/app/bfsg-checkliste-online-shop/page.tsx:306` — "BFSG-Konformitaet"
- `landingpage-next/app/bfsg-pruefung-kosten/page.tsx:210,276` — "BFSG-Konformitaet" in Disclaimern

**Hinweis:** Die Treffer in `marketing/google-ads.md` und `google-ads-rsa-headlines.md` sind
fast alle in Kommentar-Texten ("Vermeide 'BFSG-konform'...") — das sind false positives des Regex.
Beim naechsten Skript-Update: Kommentar-Zeilen (beginnend mit `>` oder `//` oder `#`) ignorieren.

---

## CI-Integration (Empfehlung)

```yaml
# .github/workflows/legal-copy-check.yml  (User-Entscheidung erforderlich)
name: Legal-Copy-Check
on: [pull_request]
jobs:
  legal-grep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - name: Legal-Copy-Grep
        run: python scripts/legal_copy_grep.py --ci
        # Exit-Code 1 blockiert Merge bei ROT-Treffern
```

Entscheidung: Offene Frage 7 aus `docs/ai-os-research/06-agenten-skills-katalog.md`.
Empfehlung: JA — der Overhead ist minimal (< 5 Sekunden), der Nutzen hoch.

---

## Changelog

- **2026-06-21 v1:** Alle 7 Skills erstellt, Skript getestet, Uebersicht angelegt.

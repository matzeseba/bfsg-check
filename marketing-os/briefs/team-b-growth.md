# Team-B-Brief — Organic Growth Engine: Kernel, Agenten, Playbooks (One-Shot)

## Mission
Baue die inhaltliche Wachstumsschicht des Marketing-Agent-OS: Kernel, Agenten-Personas und
automatisierte Playbooks für schnellstmögliche kostenlose Leads — ausschließlich UWG-sichere
0-€-Kanäle. `marketing-os/ARCHITECTURE.md` (§3, §4 Playbook-Schema, §8) und
`marketing-os/policy/compliance.json` sind bindend — ZUERST vollständig lesen.

## Pflicht-Lektüre (Reihenfolge)
1. `marketing-os/ARCHITECTURE.md` + `marketing-os/policy/compliance.json`
2. `git show origin/worktree-marketing-schnelle-leads:marketing/2026-07-07-schnelle-leads-execution-plan.md` (NUR lesend via git show — einzige erlaubte git-Nutzung)
3. `marketing/2026-06-30-marketing-strategie-master.md`, `marketing/seo-content-plan.md`,
   `marketing/listings-submission-templates.md`, `marketing/recherchescout-profil.md`,
   `marketing/show-hn-launch-post.md`, `marketing/awesome-lists-pr-template.md`, `marketing/OFFER.md`
4. `docs/LEGAL-REALITY-CHECK-2026.md` (Was erlaubt/verboten)

## Deliverables (nur `marketing-os/KERNEL.md`, `agents/`, `playbooks/`, `data/seed/`)
1. `KERNEL.md` (< 200 Zeilen) — Identity (COO des Marketing-OS, delegiert, codet nie),
   Agent-Registry-Tabelle (Agent | Rolle | Kanal | Trigger), Routing-Regeln, Modell-Policy
   (Content-Jobs = Sonnet), Verweis auf Policy + Eskalation an Owner
2. 8 Personas `agents/<id>.md` (je < 100 Zeilen, Format: Identity / Memory Scope / Constraints / Output-Format):
   `seo-pillar-writer`, `aeo-answer-writer`, `comparison-page-writer` (§6-UWG-Regeln!),
   `pr-writer` (Juli-Hooks: MLBF-Kontrollphase seit 05.01.2026, Abmahnwelle 2 seit Feb 2026 ~2.700 €,
   EU-Stellungnahme 11.03.2026 — sachlich, nicht alarmistisch), `listings-agent` (SaaSHub/G2/Capterra/OMR
   als Action-Card-Checklisten), `haro-responder` (Recherchescout-Antwort-Drafts),
   `newsletter-writer` (nur Opt-in-Brevo-Liste), `analytics-reviewer` (liest kpis/leads → 3 Empfehlungen)
   — JEDE Persona enthält wörtlich: Pflichtsprache („automatisierte technische Analyse", nie
   „BFSG-konform/rechtssicher/garantiert"), Disclaimer-Pflicht, Verbot von SSH/Prod/Live-APIs,
   Output = reines Markdown auf stdout (keine Datei-Schreibzugriffe)
3. ≥ 10 Playbooks `playbooks/<id>.json` exakt nach Schema §4, `autoPublish:false`, sinnvolle
   Kadenzen. Pflicht-Playbooks: `mlbf-ratgeber` (once — MLBF-Prüfstrategie-Ratgeberseite, bester
   Produkt-Fit lt. Memory), `seo-pillar-weekly`, `aeo-faq-weekly`, `comparison-refresh-monthly`,
   `pr-monthly-hook`, `listings-checklist-once`, `haro-daily-draft`, `newsletter-weekly`,
   `analytics-weekly`, `badge-awesome-once` (BFSG-Score-Badge-Embed + Awesome-List-PR-Drafts).
   promptTemplates so präzise, dass ein Sonnet-Agent mit NUR Read/Grep/Glob (Repo lesbar) ein
   fertiges, gate-sicheres Markdown-Artefakt liefert — inkl. Produkt-Fakten (Basis 129 €, Profi
   399 €, Cookie 39/69 €, Abo 24,99 €/Monat bzw. 249 €/Jahr, Domain bfsg-fix.de, Marke BFSG-Fuchs)
4. `data/seed/jobs.json` (4–6 Demo-Jobs über mehrere Status, davon 1 mit block-Finding im gate),
   `data/seed/leads.json` (~20 Einträge über 30 Tage, gemischte kinds), `data/seed/kpis.json`
   (~60 Einträge, mehrere Kanäle/Metriken), `data/seed/state.json` (alle Playbooks enabled,
   lastRun null) — Shapes exakt nach §4, damit Dashboard-Charts sofort etwas zeigen

## Definition of Done
- Alle JSON-Dateien parsen (selbst prüfen mit node -e), Schema-Felder vollständig
- Kein einziges verbotenes Muster aus compliance.json in Personas/Playbook-Templates
  (Selbst-Check per Grep dokumentieren)
- Kanäle NUR aus allowedChannels

## Harte Verbote
KEIN git commit/push (git show read-only erlaubt), keine Dateien außerhalb deiner vier Pfade,
keine SSH-/Prod-/Live-API-Zugriffe, keine Cold-Outreach-/DM-/Foren-Playbooks, echte Umlaute.

## Report-Kontrakt
`marketing-os/briefs/reports/team-b-report.md`: Status, Dateiliste, Grep-Selbst-Check-Ergebnis,
offene Punkte. Antworte am Ende NUR mit Status + 3 Zeilen.

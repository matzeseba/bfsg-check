# Team-B-Report — Organic Growth Engine (Kernel, Agenten, Playbooks, Seed)

> Stand: 07.07.2026 · Branch: `feat/marketing-os` · Autor: Team B (Growth-Stratege + Legal-Copy)
> Bindend gelesen: `ARCHITECTURE.md` (§3/§4/§8), `policy/compliance.json`,
> `git show origin/worktree-marketing-schnelle-leads:marketing/2026-07-07-schnelle-leads-execution-plan.md`,
> `marketing/*` (Master-Strategie, seo-content-plan, OFFER, listings, recherchescout, show-hn,
> awesome-lists), `docs/LEGAL-REALITY-CHECK-2026.md`.

## Status: KOMPLETT — alle Deliverables geliefert, alle Checks GRÜN.

---

## 1. Gelieferte Dateien (nur Team-B-Pfade)

### KERNEL
- `marketing-os/KERNEL.md` (102 Zeilen < 200) — Identity (COO, delegiert, codet nie),
  Agent-Registry-Tabelle (Agent | Rolle | Kanal | Trigger), Routing-Regeln (Playbook→Agent,
  Kanal-Whitelist, Gate-Fluss, Owner-Eskalation, once-Regel), Modell-Policy (Content-Jobs = Sonnet,
  kein Fable-5), Policy-Verweis + Eskalation an Owner (`info@bfsg-fix.de`).

### 8 Agenten-Personas (`marketing-os/agents/`, je < 100 Zeilen, Format Identity/Memory Scope/Constraints/Output-Format)
| Datei | Zeilen | Kanal |
|---|---|---|
| `seo-pillar-writer.md` | 41 | seo_pillar |
| `aeo-answer-writer.md` | 38 | aeo_answer |
| `comparison-page-writer.md` | 40 | comparison_page (§ 6 UWG) |
| `pr-writer.md` | 42 | pr_free (Juli-Hooks: MLBF 05.01.2026, Abmahnwelle 2 ~2.700 €, EU-Stellungnahme 11.03.2026) |
| `listings-agent.md` | 39 | listings (Action-Cards) |
| `haro-responder.md` | 40 | haro_recherchescout |
| `newsletter-writer.md` | 38 | newsletter_brevo (nur Opt-in) |
| `analytics-reviewer.md` | 34 | analytics_internal (3 Empfehlungen) |

Jede Persona enthält wörtlich: Pflichtsprache „automatisierte technische Analyse", Voll-Verbotsliste
verweist auf `policy/compliance.json`, Pflicht-Disclaimer, Verbot SSH/Prod/Live-API, Output = reines
Markdown auf stdout ohne Datei-Schreibzugriffe, echte Umlaute, § 14 BFSG statt BFSGV-Fundstelle.

### 10 Playbooks (`marketing-os/playbooks/`, Schema §4, alle `autoPublish:false`, `enabled:true`)
`mlbf-ratgeber` (once), `seo-pillar-weekly` (Mo 06:00), `aeo-faq-weekly` (Mi 07:00),
`comparison-refresh-monthly` (interval 720h), `pr-monthly-hook` (interval 720h),
`listings-checklist-once` (once), `haro-daily-draft` (täglich 08:00), `newsletter-weekly` (Do 09:00),
`analytics-weekly` (Mo 08:00), `badge-awesome-once` (once, awesome_lists + Badge-Embed).
promptTemplates self-contained mit Produkt-Fakten (Basis 129 €, Profi 399 €, Cookie 39/69 €,
Abo 24,99 €/Monat bzw. 249 €/Jahr, `bfsg-fix.de`, Marke BFSG-Fuchs) + Platzhaltern {date}/{product}/{domain}.

### Seed-Daten (`marketing-os/data/seed/`, Shapes exakt §4)
- `jobs.json` — 6 Jobs über Status published/approved/review/review/running/queued;
  **1 Job mit block-Finding** (`job_20260707_0004`, comparison_page, Muster `BFSG[- ]?konform`).
- `leads.json` — 20 Einträge (2026-06-08 … 07-06), kinds scan/newsletter/contact/sale, 4 Sales.
- `kpis.json` — 64 Einträge, 8 Kanäle × Metriken visits/impressions/clicks/leads/sales_eur, 5 Wochen.
- `state.json` — alle 10 Playbooks `enabled:true`, `lastRun:null`.

---

## 2. Definition of Done — Nachweis

**Alle JSON parsen + Schema-Felder vollständig:** GRÜN. `node`-Validator prüft alle 10 Playbooks
(11 Pflichtfelder, Kanal ∈ allowedChannels, autoPublish===false) und alle 4 Seed-Dateien.

**Kanäle nur aus allowedChannels:** GRÜN. jobs/leads/kpis 0 unerlaubte Kanäle; verbotene Kanäle
(cold_email, linkedin_dm, forum_seeding, paid_ads) kommen nirgends vor. Keine Cold-Outreach-/DM-/
Foren-Playbooks.

**Grep-Selbst-Check (exakte Regexe aus `policy/compliance.json`, case-insensitive) über
Personas + Playbooks + KERNEL:**
```
=== COMPLIANCE GREP (personas + playbooks + KERNEL) ===
  CLEAN: 0 forbidden patterns in personas/playbooks/KERNEL
```
Geprüfte Muster: `BFSG[- ]?konform`, `rechtssicher`, `garantiert\w*`, `TÜV|TUEV|DEKRA`,
`100\s?%\s?barrierefrei`, `abmahnsicher`, `zertifiziert`, `Testsieger`, `risikofrei`, `§\s?15\s?BFSGV`.
Ein Erst-Lauf fand 2 warn-Treffer („Testsieger" in zwei Personas, in einer Verbots-Aufzählung) →
umformuliert zu „Bestplatzierungs-Behauptung ohne belegbaren Test" → Re-Lauf 0 Treffer.

**Einzige verbliebene Treffer liegen bewusst in `data/seed/jobs.json`** (`BFSG-konform`,
`zertifiziert`) — sie sind der **absichtliche Gate-Demo** im block-Job `job_20260707_0004` und
zeigen das Compliance-Gate beim Fangen einer Verletzung. Das ist Laufzeit-Demodaten, kein
Marketing-Text; der Brief-Grep-Scope (Personas/Playbook-Templates) ist sauber.

**Echte deutsche Umlaute:** GRÜN. Kein ae/oe/ue/ss-Leak; echte ä/ö/ü/ß durchgängig.

**Zeilen-Limits:** KERNEL 102 < 200; alle Personas 34–42 < 100.

---

## 3. Getroffene Design-Entscheidungen (im Rahmen des Briefs)

- **`badge-awesome-once`** kombiniert BFSG-Score-Badge (rel=nofollow) + Awesome-List-PR-Entwürfe;
  Kanal auf `awesome_lists` gesetzt (primäres Außen-Artefakt = PR-Drafts), `badge_distribution` in
  `legalNotes` mitgeführt. Agent = `seo-pillar-writer` (technischer Badge-Text), da keine eigene
  Badge-Persona im 8er-Set vorgesehen ist (im KERNEL-Routing dokumentiert).
- **Monatliche Kadenzen** über `interval`/`everyHours:720` abgebildet (Schema §4 kennt kein
  „monthly").
- **Verbots-Terminologie in Personas** bewusst paraphrasiert (z. B. „keine Konformitäts-Behauptung
  zum BFSG", „keine Zusage zu rechtlicher Absicherung"), damit der Legal-Gate/Grep die Personas
  selbst nicht fälschlich blockt; die maschinenlesbare Voll-Liste bleibt `policy/compliance.json`.

## 4. Offene Punkte / Übergaben an andere Teams

- **Team A (Engine):** Runner baut Prompt = `agents/<agent>.md` + Policy-Kurzfassung + `promptTemplate`.
  Seed-Bootstrap kopiert `data/seed/*` → `data/*` beim Erststart. Gate muss die 10 Muster aus
  `policy/compliance.json` anwenden (block hält Job in review) — die Seed-Demodaten sind darauf ausgelegt.
- **Team C (Dashboard):** Seed liefert sofort Charts: Pipeline-Kanban (6 Status), Analytics
  (Leads-über-Zeit, Kanal-Split, sales_eur), Compliance-View (block-Finding sichtbar).
- **Kein** git commit/push, keine SSH-/Prod-/Live-API-Zugriffe erfolgt. Nur `git show` (read-only)
  gemäß Brief. Alle Schreibzugriffe ausschließlich unter `marketing-os/{KERNEL.md,agents,playbooks,data/seed,briefs/reports}`.

# 🛰️ Masterplan: BFSG-OS — Jarvis-Business-Cockpit auf Claude Code

> **Stand:** 21.06.2026 · **Autor:** Claude (Synthese aus 6 spezialisierten Recherche-Berichten)
> **Quellen:** `docs/ai-os-research/01..06-*.md` (Architektur · Voice/Dashboard · Second Brain · Hosting/Security · Business-Daten · Agenten-Katalog)
> **Status:** ✅ GEBAUT (21.06.2026). Entscheidungen E1–E4 getroffen (lokal / volle Voice / Komplett-Sprint).
> Lauffähiges System: Backend verifiziert, Frontend-Build grün, E2E getestet. **Start: [START-HIER.md](START-HIER.md)**.

---

## 1. Vision

Ein **„Jarvis"-artiges Business-Betriebssystem** für BFSG-Check, das auf Claude Code als Engine läuft:

- **Ein Dashboard**, das auf einen Blick zeigt: Verkäufe, Website-/Server-Status, Marketing & Kampagnen, Funnel, Finanzen.
- **Ausführbar**: Agenten & Skills per Klick **und per Sprache** steuern — inkl. „neue Werbekampagne erstellen".
- **Second Brain**: ein wachsendes, vernetztes Business-Gedächtnis (Obsidian), das sich automatisch füllt.
- **Visuell**: Dark-HUD-Ästhetik (Iron-Man-Cyan), aber WCAG-2.1-AA-konform (Dogfooding — wir verkaufen A11y).
- **Businessorientiert**: nur was wirklich gebraucht wird. Kein Vanity-Ballast.

---

## 2. Die wichtigste Architektur-Entscheidung (aufgelöst)

Die Recherche brachte **einen zentralen Konflikt** zwischen zwei Berichten zutage — hier die Auflösung:

| | Bericht #1 (Architektur) | Bericht #4 (Security) | **Auflösung** |
|---|---|---|---|
| Wo läuft die Engine? | „auf CPX22 mit deployen" | „NIEMALS auf Prod-Server" | **#4 gewinnt.** |

**Warum #4 gewinnt:** Ein Web-Cockpit, das Claude-Agenten ausführt, ist faktisch eine **Remote-Code-Execution-Oberfläche**. 2026 sind dazu mehrere kritische CVEs dokumentiert (u.a. CVE-2026-31975, CVSS 8.7, unauth. WebSocket-Shell-Injection in einem Claude-Code-UI). Läge das Cockpit auf demselben Server wie **Stripe-Live-Keys + Kundendaten**, wäre der Blast-Radius eines einzigen Einbruchs total.

➡️ **Festlegung: Das AI-OS fasst den Prod-Server (bfsg-fix.de) NICHT an.** Stripe-Keys/Kundendaten und das Cockpit teilen sich nie eine Maschine. Die konkrete Topologie (lokal / Hybrid / separater Server) ist **User-Entscheidung E1** (Abschnitt 9) — alle drei zulässigen Varianten respektieren diese Trennung.

---

## 3. Empfohlene Topologie: Hybrid (lokale Engine + Mini-Server)

```
[ Windows-PC — WSL2 ]  ← Engine + tägliche, interaktive Nutzung
├── Claude Code (Agent SDK) als Orchestrator-Engine
├── Cockpit-Backend (Node/Express + BullMQ + SQLite)
├── Cockpit-UI (admin-next / cockpit-Route) — localhost
├── Obsidian Vault (Second Brain, git-versioniert)
└── Voice-Bridge (Push-to-Talk → faster-whisper → Piper)
        │
        │  Tailscale (privates VPN, P2P, kein offener Port)
        ▼
[ Hetzner Mini-Server — CAX11 5,99 €/Mo oder CX33 8,49 €/Mo ]  ← 24/7-Teil
├── Scheduled Agents (cron + claude -p): Health-Watch, Wochenreport
├── Read-only Status-Dashboard (nur via Tailscale erreichbar)
└── eigener, eingeschränkter ANTHROPIC_API_KEY (kein Stripe-Scope)
```

**Begründung:** Engine läuft dort, wo ohnehin entwickelt wird (Komfort, RAM, kein SSH-Overhead, DSGVO: Daten bleiben lokal). Der Mini-Server liefert das 24/7-Element (nächtliche Reports, Uptime) — ohne je Prod-Secrets zu sehen. Gesamt-Zusatzkosten: **~6–20 €/Monat** (Server + API je nach Nutzung).

**Alternativen** (siehe E1): **komplett lokal** (0 € Server, kein 24/7, kein API-Key nötig wenn nur Abo/interaktiv) oder **separater Hetzner-Server** (alles online 24/7, höhere Kosten, mehr Wartung).

---

## 4. Tech-Stack (festgelegt, weil = bestehender Stack)

| Schicht | Wahl | Warum |
|---|---|---|
| Engine | **`@anthropic-ai/claude-agent-sdk`** (TypeScript) | offiziell, strukturierte Outputs, Hooks, Subagents — kein Child-Process-Gefrickel |
| Orchestrator | Node.js + Express | bereits in `scanner/` vorhanden |
| Job-Queue | **BullMQ + Redis** (Concurrency-Cap 2–3) | async Agenten-Jobs mit Status/Retry/Logs |
| Persistenz | **SQLite** (better-sqlite3, FTS5) | zero-ops, reicht für Solo |
| Dashboard | **Next.js 16 + Tailwind v4 + shadcn** in `admin-next/` → Route `/cockpit` | kein neues Repo |
| Charts | **Tremor v3** (Recharts/Tailwind v4) | fertige Dashboard-Blocks |
| Realtime | **SSE** (Next.js Route Handler) | simpler als WebSocket, reicht für Logs/KPIs |
| HUD-Optik | Aceternity UI + Magic UI + Framer Motion | Jarvis-Look, copy-paste, shadcn-kompatibel |
| Voice | Push-to-Talk → **faster-whisper** (STT, DE) → **Piper** (TTS, „Thorsten") · später `voicemode` MCP / Pipecat | lokal, kostenlos, deutschtauglich |
| Second Brain | **Obsidian** + `obsidian-local-rest-api` (MCP) + git-Vault | Markdown, vernetzt, auto-befüllt |
| Daten | MCP/APIs: **Stripe** (offiz. MCP), **GitHub** (offiz. MCP), **Google Ads** (offiz. MCP, read-only), **Brevo** (MCP), **Porter Metrics** (in Session aktiv) | meist fertig erschlossen |
| Deploy Mini-Server | Docker Compose + GitHub Actions SSH | identisch zu bfsg-check |

**Referenz-Repos zum Wiederverwenden:** `hoangsonww/Claude-Code-Agent-Monitor` (Dashboard-/JSONL-Monitoring-Blaupause, MIT, 484★), `alirezarezvani/gaios` (AI-OS-Struktur-Blueprint), `hesreallyhim/awesome-claude-code` (erst suchen, dann selbst bauen).

---

## 5. Was ins Dashboard kommt (v1 = 14 MUST-HAVE-Panels)

**North-Star:** Umsatz/Tag · flankiert von CAC vs. 177 €-Ceiling und ROAS.

1. Tageskasse (Umsatz + Sales heute) · 2. Monats-Performance (MTD vs. Vormonat) · 3. Paket-Split · 4. Letzte Bestellungen (Live-Feed) · 5. Google-Ads-Performance · 6. Kampagnen-Übersicht · 7. Budget-Ampel (CAC) · 8. Scan-Funnel (4 Stufen) · 9. Health-Status (30s) · 10. Uptime-History · 11. Deploy-Status · 12. Unit Economics (CAC/LTV) · 13. Ads-Burn-Rate · 14. **Neue Kampagne erstellen** (7-Schritt-Flow mit Guardrails).

**Daten-Quick-Wins:** 1 Zeile `logger.info({type:'scan_start'})` in `scanner/app.js` → macht die Funnel-Conversion-Rate überhaupt erst messbar.

---

## 6. Steuerbare Aktionen (Action-Library) + Sprache

**18 Aktionen in 3 Sicherheitsstufen** (aus 27 kuratierten Agenten von 217):

- **Quick (read-only, sofort):** Tagescheck, Wochenreport/KPIs, Smoke-Check, A11y-Selbst-Audit, Finance-Snapshot, A/B-Auswertung.
- **Generatoren (Draft → Freigabe):** Ad-Varianten, Kampagnen-Bauplan, Search-Term-Auswertung, SEO-Artikel, Wochen-Content, PM/Listing, Up-Sell-Sequenz, Code-Review, Legal-Copy-Check.
- **Live (Geld/extern → Pflicht-Bestätigung + Audit-Log):** Refund, Kampagne live schalten, PM absenden, Brevo-Sequenz aktivieren, Rollback, Restore.

**7 neue Skills zu bauen:** `ads-performance-pull`, `ab-test-tracker`, `scan-dataset-aggregat`, `upsell-trigger`, `legal-copy-grep`, `backup-verify`, `stripe-revenue-snapshot`.

**Governance (5 Ebenen):** Blacklist-Gate (Cold-Mail/LinkedIn/„BFSG-konform" hart gesperrt) → Formulation-Guard → Pflicht-Bestätigung → Audit-Log (`out/cockpit-actions.jsonl`, append-only) → Channel-Whitelist. **Kein Agent kann je eine Cold-Mail senden oder Budget buchen ohne explizites OK.**

**Sprache:** 25 deutsche Voice-Intents gemappt (z.B. „Wie laufen die Verkäufe?" → KPI-Query; „Neue Werbekampagne für Cookie-Banner" → Kampagnen-Generator). v1: Push-to-Talk (Leertaste), Wake-Word „Hey Jarvis" als Phase 2.

---

## 7. Second Brain (Obsidian)

- **Vault** außerhalb des Code-Repos, eigenes privates git-Repo, Sync Windows↔Server via git.
- **Struktur:** PARA (Projects/Areas/Resources/Archive) + Zettelkasten-Kern + Business-Sektionen (`DECISIONS/` Log, `SOPs/`, `LEGAL/`, `AI-SESSIONS/` auto-befüllt).
- **Integration:** `obsidian-local-rest-api` (v4.1.3) liefert eingebauten MCP → Claude Code liest/schreibt direkt.
- **Auto-Wachstum:** `Stop`-Hook + `memory_extractor.py` → nach jeder Session/jedem Sale/jeder Kampagne ein Eintrag.
- **Rollentrennung (wichtig):** `.claude/.../memory/` = technisches Agenten-Gedächtnis; Obsidian = Business-Wissen. **Nicht** vollständig synchron halten.
- **RAG** erst ab ~200 Notizen; bis dahin reicht strukturierter Vault + Claude-Filesearch.

---

## 8. Phasen-Bauplan (das eigentliche Bau-Vorgehen)

> Jede Phase = ein abgeschlossenes, lauffähiges Inkrement. Selbstdisziplin-Regel: kein Feature-Polish, bevor 5 reale Outputs existieren.

| Phase | Inhalt | Bau-Team (Agenten) | Ergebnis |
|---|---|---|---|
| **P0 — Setup** | Repo-Gerüst `cockpit/` + `cockpit-ui` (admin-next/cockpit), Tailscale/Server nach E1, ENV/Secrets, Agent-SDK-Smoke-Test | DevOps Automator + Backend Architect | „Hello Agent" läuft, ein Job streamt |
| **P1 — Fundament & Daten** | Orchestrator (Agent SDK + BullMQ + SQLite), Daten-Konnektoren (Stripe, /health, orders.jsonl, GitHub), 11 read-only Panels, Scan-Start-Log | Backend Architect · Senior Developer · MCP Builder · Analytics Reporter | Dashboard zeigt echte Zahlen |
| **P2 — Action-Library** | Agent-Dispatch + Action-Buttons, Audit-Log, Guardrails, „Neue Kampagne"-Flow (Draft+Freigabe), 7 neue Skills | Senior Developer · Prompt Engineer · Chief of Staff · Legal Compliance Checker | Agenten per Klick steuerbar |
| **P3 — Second Brain** | Obsidian-Vault + local-rest-api-MCP, Memory-Pipeline (Stop-Hook), Cockpit-Suche | ZK Steward · MCP Builder · Backend Architect | Wissens-Gedächtnis wächst automatisch |
| **P4 — Voice** | Push-to-Talk-Bridge im Cockpit, faster-whisper + Piper, Intent-Mapping, A11y-Fallback | Voice AI Integration Engineer · Frontend Developer · Accessibility Auditor | „Jarvis, wie laufen die Verkäufe?" |
| **P5 — Scheduled + Hardening** | Cron-Agents (Health, Wochenreport) auf Mini-Server, Security-Review, Deploy, Backup-Verify | SRE · Cloud Security Architect · AppSec Engineer · DevOps Automator | 24/7-Teil live, sicherheitsgeprüft |

**Visuelle Politur (HUD-Ästhetik, Animationen)** läuft begleitend ab P1, finalisiert in P4/P5 — immer mit `axe-core`-Gate (Dogfooding).

---

## 9. Entscheidungen, die NUR der User treffen kann (Blocker für den Bau-Start)

> Alles andere entscheide ich selbst (Express-Modus). Diese hier betreffen **dein Geld, deinen Server, deine Sicherheit** — daher Rückfrage.

- **E1 — Topologie/Hosting** (die explizite Frage): Hybrid (empfohlen) · komplett lokal · separater Hetzner-Server. *Prod-Server ist in allen Varianten tabu.*
- **E2 — Claude-Abrechnung für autonome Agents:** API-Key (pay-per-use, nötig für 24/7-Server-Automation; ~6–20 €/Mo) vs. nur Abo/interaktiv (kein Server-Automatik). *Hängt an E1.*
- **E3 — Voice-Umfang v1:** Push-to-Talk-Text zuerst (empfohlen) vs. volle Sprach-Pipeline (Mikro→STT→TTS) sofort.
- **E4 — Build-Tiefe v1:** Fokus-MVP zuerst (P1+P2: Dashboard + Daten + Aktionen) vs. großer Komplett-Sprint (P1–P5 am Stück).

**Nicht-Blocker (entscheide ich):** Tremor/shadcn-Details, SSE-Implementierung, SQLite-Schema, Tailscale-Setup-Details, Piper-Stimme, Vault-Ordnerstruktur, welche Agenten konkret bauen.

---

## 10. Kosten-Überblick (monatlich, grob)

| Posten | Hybrid | Lokal | Separater Server |
|---|---|---|---|
| Zusatz-Server (Hetzner) | 6–8 € | 0 € | 8–11 € |
| Claude API (Scheduled/Headless) | 6–20 € | 0 € (nur Abo) | 10–40 € |
| Voice (lokal) | 0 € | 0 € | 0 € |
| **Summe Zusatz** | **~12–28 €** | **~0 €** | **~18–50 €** |

Optionaler Hinweis aus Bericht #4: Die Prod-CPX22 kostet nach dem Hetzner-Preisschock (15.06.2026) jetzt **19,49 €/Mo (+144 %)**; eine **CX33 (8 GB RAM, 8,49 €)** wäre günstiger und stärker — separate Entscheidung, nicht Teil dieses Projekts.

---

## 11. Top-Risiken & Gegenmaßnahmen

1. **RCE-Oberfläche** → Prod-Trennung, Tailscale statt offener Port, eigener API-Key ohne Stripe-Scope, non-root Container.
2. **Kosten-Explosion durch Agent-Loops** → `--max-turns`-Caps, BullMQ-Concurrency-Limit, Anthropic-Spend-Limit.
3. **CPU-Voice zu langsam** → whisper `small/medium` für Push-to-Talk; Cloud (Deepgram) nur falls Latenz nervt.
4. **Glassmorphism vs. A11y** → Solid-Overlay hinter Text, `prefers-reduced-transparency/-motion`, axe-core in CI.
5. **PII im Second Brain / orders.jsonl** → nur Domains anzeigen, keine Kundendaten ins Memory, Löschkonzept.
6. **Google-Ads-Write fehlt (MCP read-only)** → v1 Draft-Export + manuelle Aktivierung; Developer-Token-Antrag parallel.

---

*Nächster Schritt: User beantwortet E1–E4 → ich stelle das Bau-Team zusammen und starte P0/P1.*

# 🛰️ BFSG-OS — START HIER (Jarvis-Business-Cockpit)

> Dein lokales AI-Betriebssystem auf Claude-Code-Basis. **Läuft nur lokal auf deinem PC** (Entscheidung E1).
> Gebaut: 21.06.2026. Backend verifiziert lauffähig, Frontend-Build grün, End-to-End getestet.

---

## Was es ist (in einem Satz)

Ein visuelles Cockpit, das deine Business-Zahlen (Verkäufe, Website, Marketing, Funnel, Finanzen) auf einen Blick zeigt **und** deine Agenten/Skills per Klick und per Sprache steuerbar macht — inklusive „Neue Werbekampagne erstellen", abgesichert durch ein 5-Ebenen-Compliance-Gate, mit Obsidian-Second-Brain.

## Schnellstart (2–3 Terminals)

```bash
# 1) BACKEND (Orchestrator, Port 4317)
cd cockpit
cp .env.example .env          # einmalig; Werte optional (siehe unten)
npm install                   # einmalig
npm start                     # → http://127.0.0.1:4317

# 2) FRONTEND (Dashboard, Port 3017)
cd cockpit-ui
npm install                   # einmalig
npm run dev                   # → http://127.0.0.1:3017   ← das ist dein Cockpit

# 3) VOICE (optional, volle Sprachsteuerung) — siehe scripts/voice/README.md
#    faster-whisper (5301) + Piper (5302) + optional Wake-Word
```

Dann **http://127.0.0.1:3017** im Browser öffnen. Ohne Credentials läuft alles, Panels zeigen „nicht konfiguriert".

> Voraussetzung Engine: lokal eingeloggte `claude`-CLI (dein Abo). Kein API-Key nötig.

## Credentials freischalten (alles in `cockpit/.env`, bleibt lokal)

| Setzen | Schaltet frei | Aufwand |
|---|---|---|
| `STRIPE_API_KEY` (rk_live_, nur Lesen) | Umsatz, Sales, Paket-Split, AOV, MRR | 5 Min |
| `ADMIN_TOKEN` | Letzte Bestellungen, Funnel-Kauf | 5 Min |
| `GITHUB_TOKEN` (repo+actions read) | Deploy-Status, Uptime 7/30d | 10 Min |
| `GOOGLE_ADS_*` (5 Werte) + `npm i google-ads-api` | Ads-Performance, CAC, ROAS, Burn | 2–5 Tage (Google-Token-Freigabe) |
| `VAULT_PATH` | Second-Brain-Suche im Cockpit | nach Obsidian-Setup |

Details: [10-daten-setup.md](10-daten-setup.md) · Obsidian: [08-second-brain-setup.md](08-second-brain-setup.md)

## Was kann das Cockpit

- **14 Panels**: Tageskasse, Monat, Paket-Split, letzte Bestellungen, Google-Ads, Kampagnen, Budget-Ampel (CAC vs. 177 €), Scan-Funnel, Health (30s), Uptime, Deploy, Unit-Economics, Ads-Burn, **Neue Kampagne erstellen**.
- **18 Aktionen** (Floating-Dock + Sprache) in 3 Stufen: Quick (sofort), Generator (Draft→Freigabe), Live (Geld/extern→Pflicht-Bestätigung). Live-Aktionen zeigen ein Freigabe-Modal.
- **Sprachsteuerung**: Push-to-Talk (Leertaste) + Wake-Word „Hey Jarvis"; 18 deutsche Intents (z.B. „Wie laufen die Verkäufe?", „Neue Werbekampagne für Cookie-Banner"). Text-Fallback ist immer da (A11y).
- **7 neue Skills** unter `.claude/skills/`: ads-performance-pull, ab-test-tracker, scan-dataset-aggregat, upsell-trigger, legal-copy-grep, backup-verify, stripe-revenue-snapshot.
- **Scheduler** (lokal): Tagescheck (8 Uhr) + Wochenreport (Mo 9 Uhr), mit Catch-up wenn der PC aus war.
- **Second Brain**: Obsidian-Vault-Blaupause in `vault-template/`, wächst per Stop-Hook automatisch.

## Governance (eingebaut, nicht abschaltbar)

Blacklist-Gate (Cold-Mail/LinkedIn-DM/„BFSG-konform"/„garantiert"/TÜV hart gesperrt) → Formulation-Guard (FAIL wird markiert, nicht still geändert) → Pflicht-Bestätigung bei Live-Aktionen → Audit-Log (`cockpit/out/cockpit-actions.jsonl`, append-only) → Channel-Whitelist. Budget-Cap 100 €/Tag, Refund-Cap 500 €.

## ⚠️ Sicherheits-Regeln (wichtig)

- Cockpit **niemals** ins Internet exposen — nur `127.0.0.1`.
- Cockpit **niemals** nach `admin-next/` verschieben oder auf den Prod-Server deployen (admin-next deployt → Prod = Stripe-Keys/Kundendaten). Das ist der ganze Grund für die Standalone-Trennung.
- Stripe nur mit **Restricted Read-Key**. `.env` nie committen.
- Security-Review: [09-cockpit-security-review.md](09-cockpit-security-review.md) (4 Findings bereits gefixt, u.a. Secrets-Isolierung der Subprozesse).

## Datei-Karte

```
cockpit/            Backend (Engine, Job-Queue, Governance, Connectors, Voice, Scheduler)  ← npm start
cockpit-ui/         Frontend (Next.js Dashboard, 14 Panels, Voice-Bar)                      ← npm run dev
vault-template/     Obsidian-Second-Brain-Blaupause (in eigenen Vault kopieren)
scripts/voice/      Whisper/Piper/Wake-Word Setup + Start
scripts/memory_extractor.py   Stop-Hook → Vault
.claude/skills/     7 neue Skills
docs/ai-os-research/  Recherche (01–06), Pläne (00, 07), Setup-Docs (08–11), dieser Guide
```

## Phasen-Status

| Phase | Status |
|---|---|
| Recherche (6 Berichte) | ✅ |
| Masterplan + Entscheidungen | ✅ |
| P1 Fundament + Daten (Backend + 14 Panels + Connectors) | ✅ gebaut & verifiziert |
| P2 Action-Library (18 Aktionen + Kampagnen-Flow + Governance) | ✅ |
| P3 Second Brain (Vault + Memory-Pipeline + Suche) | ✅ Code; Vault-Setup = 1 User-Schritt |
| P4 Voice (Bridge + STT/TTS + Wake-Word) | ✅ Code; Modelle = lokaler Setup-Schritt |
| P5 Scheduler + Security-Hardening | ✅ |

**Offene Nutzer-Schritte** (alles lokal, optional): `.env`-Credentials setzen · Obsidian-Vault anlegen + MCP registrieren · Voice-Modelle installieren (scripts/voice/README.md) · `VAULT_PATH` setzen.

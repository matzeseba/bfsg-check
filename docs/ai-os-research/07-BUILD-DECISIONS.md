# 🧭 Bau-Entscheidungen (User-Festlegungen 21.06.2026)

Diese Datei hält die verbindlichen Entscheidungen fest, die der Bau-Sprint umsetzt.

| ID | Entscheidung | Wahl des Users | Konsequenz für den Bau |
|---|---|---|---|
| **E1** | Topologie/Hosting | **Komplett lokal** (Windows-PC) | Kein Hetzner-Mini-Server, kein Tailscale. Engine = lokales Claude Code (Abo-Auth), **kein separater API-Key** nötig. Kein 24/7 — Scheduled Jobs laufen nur, wenn der PC an ist. |
| **E2** | Claude-Abrechnung | (folgt aus E1) | Orchestrator ruft die lokale **`claude` CLI** (`-p`, `--output-format stream-json`) als Child-Prozess → nutzt die bestehende Login-Auth. Agent SDK + `ANTHROPIC_API_KEY` bleibt optionaler Upgrade-Pfad für echtes Headless 24/7. |
| **E3** | Voice-Umfang v1 | **Volle Sprach-Pipeline sofort** | Wake-Word „Hey Jarvis" (openWakeWord) + Push-to-Talk-Fallback, STT faster-whisper (DE), TTS Piper „Thorsten". A11y-Tastatur-Fallback Pflicht. |
| **E4** | Bau-Tiefe | **Großer Komplett-Sprint** | P1–P5 zusammen, viele Agenten parallel: Dashboard + Daten + Aktionen + Second Brain + Voice + Scheduled/Hardening. |

## Abgeleitete Architektur-Festlegung (kritisch)

**Das Cockpit ist eine eigenständige, NUR-LOKALE App** unter `cockpit/` (Backend) + `cockpit-ui/` (Frontend) im Repo-Root.

**Warum nicht in `admin-next/`?** `admin-next/` wird per GitHub Actions auf den **Prod-Server** deployt. Das Cockpit ist eine Code-Ausführungs-Oberfläche (RCE-Surface) und darf laut Masterplan §2 **niemals** auf denselben Server wie Stripe-Keys/Kundendaten. Läge der Cockpit-Code in `admin-next/`, würde er beim nächsten Deploy auf Prod landen. → Standalone, vom Deploy ausgeschlossen.

**Schutz vor versehentlichem Deploy:** `cockpit/` + `cockpit-ui/` werden in `.gitignore`-Betracht gezogen bzw. explizit aus jedem Deploy-Workflow ausgeschlossen; sie sind nicht Teil der `deployment/docker-compose.yml`.

## Engine-Pfad (lokal, ohne API-Key)

```
Cockpit-Backend ── spawn ──> `claude -p "<prompt>" --output-format stream-json --verbose
                                     [--agents …] [--allowedTools …] [--max-turns N]`
                              (nutzt lokale Abo-Auth aus ~/.claude)
                  <── stdout (JSON-Lines) ── streamt Events zurück (Logs/Result/Cost)
```

Für späteres echtes 24/7-Headless (separater Rechner/Server): auf `@anthropic-ai/claude-agent-sdk` + `ANTHROPIC_API_KEY` umstellen — gleiche Engine-Schnittstelle (`runAgent()`), daher austauschbar.

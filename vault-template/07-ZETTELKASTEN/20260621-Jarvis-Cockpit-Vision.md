---
type: zettel
id: 20260621-Jarvis-Cockpit-Vision
created: 2026-06-21
tags: [ai-os, cockpit, architektur, strategie]
links: ["[[07-ZETTELKASTEN/INDEX-Zettelkasten]]", "[[03-RESOURCES/BFSG-Check-Business-Kontext]]", "[[04-DECISIONS/DECISION-LOG]]"]
---

# Das Cockpit darf niemals auf dem Prod-Server laufen

## Kernaussage

Ein Cockpit, das Claude-Agenten ausführt, ist eine Remote-Code-Execution-Oberfläche. Liegt es auf demselben Server wie Stripe-Live-Keys und Kundendaten, ist der Blast-Radius eines einzigen Einbruchs total.

## Erläuterung

Das BFSG-OS Jarvis-Cockpit orchestriert Claude-Agenten. Es startet Subprozesse, liest Umgebungsvariablen, schreibt Dateien. Würde es auf bfsg-fix.de laufen, hätte ein Angreifer mit Zugang zum Cockpit direkten Zugriff auf:

- Stripe Live-Keys (`rk_live_*`)
- Kundendaten (orders.jsonl mit Domain-Informationen)
- Server-Root (Caddy, Docker, systemd)

**Lösung:** Cockpit läuft lokal (Windows PC / WSL2), bindet auf `127.0.0.1`. Der Prod-Server bleibt davon physisch getrennt.

## Verbindungen

- Bestätigt: [[04-DECISIONS/DECISION-LOG]] (Entscheidung Topologie E1)
- Führt zu: Tailscale-Anforderung für 24/7-Teil
- Widerspricht: naive „deploy everything together"-Instinkt

## Gegenrede

*Was würde ein Security-Architect einwenden?* — Lokale Isolation ist kein vollständiger Schutz. Wenn der lokale PC kompromittiert ist (Malware, Browser-Extension), ist das Cockpit trotzdem exponiert. Gegenmaßnahme: API-Keys mit minimalem Scope, kein `sk_live_*` lokal, nur `rk_live_*` (Restricted Key).

## Offene Frage

Reicht Tailscale als Netzwerk-Isolation für den 24/7-Mini-Server, oder brauchen wir zusätzlich mTLS zwischen Cockpit und Mini-Server?

---
*Links: [[07-ZETTELKASTEN/INDEX-Zettelkasten]] · [[04-DECISIONS/DECISION-LOG]]*

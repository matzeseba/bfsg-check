---
type: decision-log
created: 2026-06-21
tags: [decisions, log, append-only]
links: ["[[INDEX]]", "[[07-ZETTELKASTEN/20260621-Jarvis-Cockpit-Vision]]"]
---

# Decision-Log (Append-only)

> **Regel:** Einträge werden NIE gelöscht. Revisionen werden als neue Zeile markiert.  
> Jede Entscheidung bekommt eine eigene Datei in `04-DECISIONS/` nach Template `_templates/decision.md`.

---

## Index aller Entscheidungen

| Datum | ID | Titel | Status |
|---|---|---|---|
| 2026-06-21 | E1 | Topologie: Cockpit läuft lokal, nicht auf Prod | entschieden |
| 2026-06-21 | E2 | Claude-Abrechnung: API-Key für Scheduled Agents | offen |
| 2026-06-21 | E3 | Voice-Umfang v1: Push-to-Talk-Text zuerst | offen |
| 2026-06-21 | E4 | Build-Tiefe v1: Fokus P1+P2 (Dashboard + Aktionen) | offen |
| 2026-06-21 | E5 | Re-Check-Abo: ENABLE_ABO=false bis Lasttest | entschieden |

---

## E1 — Cockpit-Topologie (entschieden)

**Datum:** 2026-06-21  
**Entschieden:** Cockpit läuft LOKAL (Windows PC, bindet auf 127.0.0.1). Prod-Server (bfsg-fix.de) ist tabu für Cockpit-Code.  
**Begründung:** Cockpit = RCE-Oberfläche. Prod-Server enthält Stripe Live-Keys + Kundendaten. Trennung ist nicht verhandelbar.  
**Detail:** [[07-ZETTELKASTEN/20260621-Jarvis-Cockpit-Vision]]

---

## E5 — Re-Check-Abo deaktiviert (entschieden)

**Datum:** 2026-06-21  
**Entschieden:** `ENABLE_ABO=false` — bleibt deaktiviert bis Stripe-Webhook unter Last getestet.  
**Begründung:** Webhook-Endpunkt nicht load-getestet. Falsches Billing-Verhalten im Live-Mode wäre ein Reputationsrisiko.  
**Revisionsmarke:** Aktivieren wenn: Lasttest bestanden + Monitoring aktiv.

---

*Neue Entscheidungen unten anfügen. Format: Datum · ID · Titel · Status · 2-3 Sätze Begründung.*

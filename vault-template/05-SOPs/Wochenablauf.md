---
type: sop
version: 1.0
last-reviewed: 2026-06-21
owner: Matze
tags: [sop, woche, ritual, review]
links: ["[[INDEX]]", "[[01-PROJECTS/BFSG-Check-Launch]]", "[[02-AREAS/Marketing]]"]
---

# SOP: Wochenablauf (Sonntags-Ritual)

## Zweck
Wöchentliche Auswertung, Entscheidungen und Content-Planung in unter 90 Minuten.

## Auslöser
Jeden Sonntag, 09:00–10:30 Uhr.

## Schritte

### Schritt 1: KPI-Review (15 Min)
**Was:** Cockpit öffnen, Wochenzahlen ablesen  
**Wie:** `GET /api/cockpit/summary` → Panels lesen  
**Prüfen:** Revenue, Sales, CAC vs. 177€-Ceiling, Ads-ROAS

### Schritt 2: Vault-Sync (5 Min)
**Was:** Neue AI-Session-Logs committen  
**Wie:**
```bash
cd C:\Users\Administrator\bfsg-vault
git add -A && git commit -m "vault sync $(date +%Y%m%d)" && git push
```

### Schritt 3: Decision-Log prüfen (10 Min)
**Was:** Offene Entscheidungen in [[04-DECISIONS/DECISION-LOG]] reviewen  
**Wie:** Notizen lesen, Status aktualisieren

### Schritt 4: Content-Woche planen (20 Min)
**Was:** Nächste Woche: welche Ads-Tests, welche Listings, welche PRs?  
**Wie:** `02-AREAS/Marketing` öffnen, Punkte ergänzen

### Schritt 5: Cockpit — Wochenreport-Agent (10 Min)
**Was:** Wochenreport-Subagent starten  
**Wie:** Cockpit-UI → Actions → „Wochenreport"

### Schritt 6: INBOX leeren (20 Min)
**Was:** `00-INBOX/` durcharbeiten → sortieren nach PARA  
**Wie:** Jede Notiz in den richtigen Ordner verschieben + 2 Links hinzufügen

## Erfolgskriterium
- INBOX leer
- Neue Wochenzahlen dokumentiert
- Min. 1 Entscheidung aktualisiert

---
*Links: [[INDEX]] · [[01-PROJECTS/BFSG-Check-Launch]] · [[02-AREAS/Marketing]]*

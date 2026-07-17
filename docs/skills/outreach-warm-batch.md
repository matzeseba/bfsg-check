---
name: outreach-warm-batch
description: Erstellt personalisierte LinkedIn-DM-Drafts für N warme Kontakte mit echtem Site-Scan. Trigger "N Partner anschreiben", "Warm-Outreach".
---

# Warm-Outreach Skill

## Input
- Anzahl (Default: 5)
- Optional: spezifische LinkedIn-Profile oder Filter (z.B. „Agenturen Berlin")

## Schritte

### 1. Warme Liste finden
Quellen (in dieser Priorität):
1. `marketing/_obsolete/partner-targets.md` (vorab gepflegte Liste)
2. Falls nichts: User-Frage nach Profil-URLs

**STOP wenn:** Keine warmen Kontakte → Vorschlag User soll erst LinkedIn-1.-Grad-Filtern.

### 2. Für jeden Kontakt: Site-Scan
Falls Domain bekannt:
```bash
curl -fsS "https://bfsg-fix.de/api/scan?url=https://[domain].de" | jq
```
Extrahiere:
- Score (0-100)
- Top-3 Findings (Severity descending)

### 3. DM-Draft erstellen
Nutze Vorlage aus `marketing/_obsolete/partner-warm-dms.md` (Vorlage 1-5 je nach Persona).
Personalisiere:
- Vorname
- 1 persönliches Detail (aus letztem LinkedIn-Post oder gemeinsamem Kontakt)
- Echter Score + Top-3 Findings (NICHT erfinden!)
- Domain + Firma korrekt

### 4. Output als Markdown-Tabelle
```markdown
## 5 Warm-DM-Drafts — Ready to Send

### #1 — Anna Müller (anna-mueller, Agentur Müller GmbH)
**Site:** mueller-agentur.de · Score: 42/100
[Vollständige DM hier]
---
### #2 — ...
```

User kopiert dann Draft für Draft in LinkedIn → klickt Senden manuell (UWG-Sicherheit).

### 5. Tracking
Status je Kontakt in der Markdown-Ausgabe vermerken (z.B. „DM-Draft-Bereit"); Pflege der Liste in `marketing/`.

## Ausgaben-Regel
**NIEMALS automatisch senden.** Du erstellst nur Drafts. User klickt selbst.

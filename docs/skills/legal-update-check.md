---
name: legal-update-check
description: Monatlicher Check auf BFSG/DSGVO/UWG-Updates die Code/Texte betreffen. Trigger "Recht-Update", "Legal-Check".
---

# Legal-Update-Check Skill

## Schritte

### 1. Quellen scannen (WebSearch + WebFetch)
- BFSG-Gesetzestext (gesetze-im-internet.de) — neue Fassungen?
- DSGVO-Aktualisierungen (eur-lex.europa.eu)
- UWG-Änderungen (gesetze-im-internet.de/uwg)
- TDDDG (telekommunikation-digitale-dienste-datenschutz)
- BFSG-Verordnungen (BFSGV) — Auslegungshinweise
- EU AI Act Artikel die ab 02.08.2026 gelten

Quellen-Liste in `docs/RECHTSSICHERHEITS-AUDIT.md` Sektion "Quellen".

### 2. Vergleich zum letzten Stand
Letztes Audit-Datum in `docs/RECHTSSICHERHEITS-AUDIT.md` lesen.
Diff der relevanten Paragrafen seit dann.

### 3. Bewertung
Für jede Änderung:
- Code-Impact? (z.B. neue Pflicht-Texte, neue Erfolgshaftung)
- UX-Impact? (z.B. neue Banner-Pflichten)
- Marketing-Impact? (z.B. Cold-Mail-Verschärfung)

### 4. Output
```markdown
## ⚖️ Legal-Update-Check — [Datum]

🟢 **Kein Update relevant** ODER
🟡 **Update erkannt:** [Quelle] — [Kurz-Beschreibung]
🔴 **Code-Impact:** Datei X muss angepasst werden

**Action:** [GitHub-Issue eröffnet ODER PR-Vorschlag ODER nur Awareness]
```

### 5. Bei Code-Impact
- GitHub-Issue eröffnen mit Label „legal" + Severity
- Issue-Body: Quelle, Diff, betroffene Files, Vorschlag

### 6. Logging
Append zu `docs/_legal-update-log.jsonl`:
```json
{"ts":"2026-...","sources_checked":["bfsg","dsgvo","uwg"],"updates_found":[...],"action":"none|issue|pr"}
```

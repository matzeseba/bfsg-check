---
name: weekly-kpi-report
description: Wöchentlicher KPI-Snapshot mit allen Channels. Trigger "Wochenreport", "KPIs", jede Montag morgens.
---

# Wochenreport-Skill

## Schritte

### 1. Sales (Stripe MCP)
- Anzahl Käufe diese Woche vs. Vorwoche
- Brutto-Umsatz + Net-Revenue (nach Stripe-Fees)
- Aufschlüsselung nach Paket (basis / profi / cookie-basis / cookie-profi / abo)
- Neue Re-Check-Abos (MRR-Steigerung)
- Refunds (Anzahl + Betrag)

### 2. Marketing-Funnel (Porter Metrics + Repo-Logs)
- Google-Ads-Impressionen / Clicks / CPC / Conversions
- LinkedIn-Post-Impressions (manuell falls kein API)
- Gratis-Scans-Anzahl (aus Scanner-Logs: `out/scans.jsonl`)
- Conversion-Rate Scan → Sale

### 3. Server-Health (Sentry + Health-Endpoint)
- Uptime %
- Error-Anzahl + Top-3-Issues
- Performance-Metriken (durchschnittliche Scan-Dauer)

### 4. Pipeline (Notion MCP)
- Neue Leads
- Pipeline-Stages-Bewegung
- Top-3 hottest Leads (mit nächster Aktion)

### 5. Output
Erstelle Notion-Page mit Titel „Wochenreport KW [X] / [Jahr]" in DB „BFSG KPIs" mit:
- KPI-Tabelle (Wochen-Vergleich)
- Highlights (besser Vorwoche)
- Lowlights (schlechter Vorwoche)
- 3 Action-Items für nächste Woche

### 6. Bonus: Gamma-Deck (optional)
Frage User ob Slide-Deck erwünscht. Falls ja:
Gamma MCP `generate`: 5-Slide-Deck mit KPIs als Charts.

## Output-Format im Chat
```markdown
## 📊 Wochenreport KW [X] · BFSG-Check

| Metrik | Diese Woche | Vorwoche | Δ |
|---|---|---|---|
| Umsatz | X € | Y € | +/- Z% |
| MRR | X € | Y € | +/- Z% |
| Scans | X | Y | +/- Z% |
| Conv-Rate | X% | Y% | +/- pp |

📈 **Highlight:** [konkret]
📉 **Lowlight:** [konkret]
🎯 **Top-3 Action-Items:**
1. ...
2. ...
3. ...

Notion-Page: [Link]
```

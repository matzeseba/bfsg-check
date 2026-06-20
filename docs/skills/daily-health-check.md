---
name: daily-health-check
description: Tägliche Kurz-Diagnose Server + Sales + Bounces + Errors. Nutze bei "Tagescheck", "Status heute", "wie steht's".
---

# Tagescheck Skill

Führe in dieser Reihenfolge aus und gib einen kompakten Markdown-Report zurück (kein Mini-Roman):

## 1. Server-Health
```bash
curl -fSs https://bfsg-fix.de/health
```
Erwartet: `{"ok":true,"stripe":true,"live":true,"mailer":"aktiv ..."}` — wenn `live:false` oder Fehler: ROT.

## 2. Stripe-Sales letzte 24h
Nutze Stripe MCP:
- Alle Charges/Sessions seit gestern 00:00
- Summe Brutto + Anzahl
- Highlight wenn erster Live-Verkauf

## 3. Brevo-Bounces letzte 24h
Nutze Brevo MCP `contacts_get_contact_stats` + `email_campaign_management_get_email_campaigns`:
- Bounce-Rate über letzte Mails
- Spam-Reports
- Bei Bounce-Rate >5%: WARN

## 4. Sentry-Errors letzte 24h
Falls Sentry-DSN konfiguriert: Anzahl Errors + Top-3-Issues per Severity.
Falls nicht: skip mit Hinweis "Sentry nicht konfiguriert".

## 5. Notion Sales-Pipeline (optional)
Falls Notion-DB "BFSG Sales Pipeline" existiert: neue Leads + Pipeline-Stages.

## Output-Format
```markdown
## 🌅 BFSG-Tagescheck — [Datum]

🟢 **Server**: live, mailer aktiv, stripe live
💰 **Sales 24h**: X € (Y Käufe)
📧 **Mails**: Bounce-Rate X% (Z gesendet)
🔥 **Errors**: X (Top: ...)
📋 **Pipeline**: X neue Leads

**Aktion heute:** [konkreter Vorschlag basierend auf Findings]
```

Bei Fehlern: Stoppe und zeige Fehler direkt, nicht weiter.

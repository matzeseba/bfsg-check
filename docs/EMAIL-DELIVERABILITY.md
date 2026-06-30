# E-Mail-Deliverability — bfsg-fix.de

Pragmatischer Leitfaden, damit Brevo-Mails (Scan-Reports, Stripe-Belege, Onboarding) sauber im Postfach landen — nicht im Spam.

---

## ⚠️ OFFEN (Stand 30.06.2026): Alle Mails landen aktuell im SPAM — muss überarbeitet werden

**Beobachtung (real getestet, Empfänger outlook.de):** Sowohl die **Double-Opt-in-Bestätigungsmails** (Lead-Capture **und** Newsletter) als auch der **bezahlte Scan-Report** und die Transaktionsmails landen derzeit im **Spam-Ordner**. Absender: `no-reply@bfsg-fuchs.de` über Brevo.

**Was schon stimmt:** `bfsg-fuchs.de` ist bei Brevo als Domain **„Authentifiziert"** (DKIM) markiert und der Sender zeigt **„DMARC ist konfiguriert"**. Auth allein verhindert Spam aber NICHT — der Hauptfaktor ist die Sender-Reputation.

**Wahrscheinlichste Ursache:** **Cold-Start-Reputation der jungen Sende-Domain `bfsg-fuchs.de`.** Die Domain ist nach dem Marken-Cutover (PR #95/#96) neu als Primär-Sender, das Sendevolumen ist sehr niedrig → Provider (Outlook/Microsoft, Gmail) stufen neue Low-Volume-Absender defensiv als Spam ein, bis Reputation aufgebaut ist (typisch 3–6 Wochen Warm-up). Das deckt sich mit [[email-infra-state]] (Cold-Start für bfsg-fix.de) — gilt für die noch jüngere bfsg-fuchs.de verstärkt.

### Rework-To-dos (priorisiert — „falls es geht")
1. **SPF/DKIM/DMARC für `bfsg-fuchs.de` auf DNS-Ebene verifizieren** (nicht nur Brevo-UI vertrauen):
   ```bash
   bash deployment/scripts/check-mail-auth.sh bfsg-fuchs.de
   ```
   Erwartung: SPF (`v=spf1 include:spf.brevo.com ~all`), DKIM (Brevo `brevo1/brevo2`-CNAMEs bzw. `mail._domainkey`), DMARC-TXT auf `_dmarc.bfsg-fuchs.de` jeweils `[OK]`. **Zusätzlich** den Header einer wirklich empfangenen Mail prüfen: `Authentication-Results` muss `spf=pass`, `dkim=pass`, `dmarc=pass` zeigen. Fehlt eines → das ist der erste Fix.
2. **mail-tester.com-Score ziehen** (Section 6): echte `no-reply@bfsg-fuchs.de`-Mail (DOI + Report) an die Test-Adresse senden, Ziel **≥ 9/10**, gemeldete Mängel abarbeiten.
3. **Warm-up + Reputation:** Owner soll die bereits erhaltenen Mails in Outlook als **„Kein Junk"** markieren und Absender zu Kontakten hinzufügen (wirkt sofort auf die eigene Zustellung). Niedrigvolumig + konsistent weitersenden über 3–6 Wochen.
4. **Inhalts-/Header-Hygiene:** `text/plain`-Alternative zusätzlich zu HTML liefern, `List-Unsubscribe`-Header (bei Newsletter/Nurture Pflicht — Nurture-Templates haben `{{ unsubscribe }}`, Header in Brevo prüfen), nicht zu bildlastig, keine Spam-Trigger-Wörter.
5. **Optional/später:** Custom Return-Path (eigene Subdomain bei Brevo), bei höherem Volumen ggf. dedizierte IP. Für jetzt zu früh.

**Realismus:** Auth + mail-tester-Fixes sind „heute machbar"; der Reputations-/Warm-up-Teil braucht Zeit und lässt sich nicht erzwingen. Erwartung: deutlich besser nach 3–6 Wochen konsistentem Versand + sauberer Auth.

> Hinweis: Dieser Leitfaden unten ist teils noch auf `bfsg-fix.de` formuliert (vor dem Marken-Cutover). Für die Praxis gilt jetzt **`bfsg-fuchs.de`** als Primär-Sende-Domain — alle Checks/Records entsprechend auf `bfsg-fuchs.de` anwenden.

---

## 1. Status-Check (in 10 Sekunden)

```bash
bash deployment/scripts/check-mail-auth.sh bfsg-fix.de
```

Liefert `[OK]` / `[FAIL]` für **SPF / DKIM / DMARC / MX**. Exit-Code 0 = alles grün, 1 = mindestens ein Fehler. Vor jedem Release einmal laufen lassen — und nach jeder DNS-Änderung.

Erwartete Erst-Ausgabe nach kompletter Konfiguration:

```
[OK]   SPF gefunden: v=spf1 include:spf.brevo.com ~all
[OK]   Brevo-Include (spf.brevo.com) vorhanden.
[OK]   SPF endet mit ~all oder -all (Policy gesetzt).
[OK]   DKIM-Record vorhanden.
[OK]   DKIM enthält public-key Tag (p=...).
[OK]   DMARC gefunden: v=DMARC1; p=none; rua=mailto:...
```

---

## 2. SPF-Record

**Eintrag:** TXT auf `@` (Apex von `bfsg-fix.de`)

```
v=spf1 include:spf.brevo.com ~all
```

- `include:spf.brevo.com` — autorisiert Brevo-Sendeserver.
- `~all` — Soft-Fail (empfohlen für Start; später ggf. `-all`).

**Wichtig:** Pro Domain darf nur **ein** SPF-Record existieren. Wenn später weitere Sender dazukommen (z. B. eigener Newsletter-Service), beide in **einen** Record mergen, nicht zwei TXT-Records nebeneinander.

---

## 3. DKIM-Setup (Brevo-Flow)

DKIM signiert ausgehende Mails kryptografisch. Brevo generiert den public key, wir tragen ihn als TXT-Record ein.

1. https://app.brevo.com → **Senders, Domains & dedicated IPs → Domains**
2. **„Add a domain"** → `bfsg-fix.de` eintragen.
3. Brevo zeigt zwei TXT-Records an:
   - **Verifizierungs-Code** (Host: `@`, Wert: `brevo-code:abc...`)
   - **DKIM-Key** (Host: `mail._domainkey`, Wert: `k=rsa; p=MIGfMA0GCSqGSIb...`)
4. Beide bei INWX als TXT-Records eintragen (siehe `deployment/dns-records.md`).
5. Nach DNS-Propagation (5 Min – 4 h) in Brevo **„Authenticate this domain"** klicken.
6. Verifizieren mit:
   ```bash
   bash deployment/scripts/check-mail-auth.sh bfsg-fix.de
   ```
   `DKIM-Record vorhanden` muss `[OK]` sein.

**Selector:** Brevo nutzt standardmäßig `mail` (also Host `mail._domainkey`). Falls Brevo später auf `mail2` rotiert, Skript via `DKIM_SELECTOR=mail2 bash deployment/scripts/check-mail-auth.sh` testen.

---

## 4. DMARC-Migrationsplan

DMARC sagt Empfängern, was sie mit Mails tun sollen, die SPF/DKIM nicht bestehen. **Niemals direkt mit `p=reject` starten** — sonst killst du legitime Mails, falls noch ein Sender unauthentifiziert läuft.

| Phase | Tag    | DMARC-Record                                                                                                          | Wirkung                                                              |
|-------|--------|-----------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| 0     | Start  | `v=DMARC1; p=none; rua=mailto:matthiasseba92@gmail.com`                                                              | Monitoring-only — Reports kommen, nichts wird blockiert.             |
| 1     | Tag 30 | `v=DMARC1; p=quarantine; pct=10; rua=mailto:matthiasseba92@gmail.com`                                                | 10 % der nicht-konformen Mails landen im Spam.                       |
| 2     | Tag 60 | `v=DMARC1; p=quarantine; pct=100; rua=mailto:matthiasseba92@gmail.com`                                               | Alle nicht-konformen Mails landen im Spam.                           |
| 3     | Tag 90 | `v=DMARC1; p=reject; rua=mailto:matthiasseba92@gmail.com`                                                            | Nicht-konforme Mails werden komplett abgelehnt. Endstufe.            |

**Vor jedem Phasenwechsel:** Brevo-Reports (rua) prüfen — wenn nur Brevo-IPs aligned sind, ist es safe. Wenn fremde IPs auftauchen (z. B. eigener Server, Forwarding), erst klären, dann erhöhen.

Praktischer Report-Reader: https://dmarcian.com → kostenloser XML-Parser, lädt die rua-Mails auf und visualisiert sie.

---

## 5. Bounce-Handling

- **Hard Bounces** (`5xx`): Empfänger existiert nicht → Brevo blacklisted automatisch. Im Brevo-Dashboard unter **Contacts → Blocklist** sichtbar.
- **Soft Bounces** (`4xx`): Temporär (Mailbox voll, Server down) → Brevo retried automatisch (bis ~72 h).
- **Spam-Complaints**: User klickt „Junk" → Brevo blacklisted automatisch + Reputations-Schaden. Bei Rate > 0,1 % handeln.

**Im Code:**
- Brevo-Webhook auf `/webhook/brevo` empfangen (für Hard-Bounce + Spam-Complaint).
- Bei Bounce: User in DB als `mail_blocked=true` markieren → Re-Send unterbinden.
- Stripe-Receipt-Failures separat loggen — falls Stripe-Mail bounct, ist das ein User-Erlebnis-Bug.

(TODO: Brevo-Bounce-Webhook in Welle 3 verdrahten. Bis dahin manuell wöchentlich Brevo-Dashboard checken.)

---

## 6. mail-tester.com — Pre-Launch-Workflow

1. https://www.mail-tester.com/ aufrufen → temporäre Test-Adresse kopieren (z. B. `test-abc123@srv1.mail-tester.com`).
2. Aus der App eine echte Mail (Scan-Report-Mock) an diese Adresse schicken.
3. „Then check your score" klicken → Score sollte **≥ 9.0 / 10** sein.
4. Häufige Mängel:
   - **−1**: kein DMARC → siehe Phase 0 oben.
   - **−1**: HTML ohne text/plain-Alternative → in Brevo-Template beide Parts liefern.
   - **−1**: Bilder ohne Alt-Text → für Accessibility eh Pflicht, hier doppelt wichtig.
   - **−0.5**: List-Unsubscribe-Header fehlt → bei Transactional OK, bei Marketing Pflicht (CAN-SPAM / DSGVO).

Vor jedem größeren Versand-Push (Newsletter, Re-Engagement) frische Mail-Tester-Runde fahren.

---

## 7. Brevo Volumen-Hinweis

| Plan          | Preis         | Versand/Tag    | Wann nötig                                            |
|---------------|---------------|----------------|-------------------------------------------------------|
| **Free**      | 0 €           | 300 Mails/Tag  | Start. Reicht für ~5–10 Kunden/Tag mit je 2 Mails.   |
| **Starter**   | ab 9 €/Monat  | 5.000 Mails/Mo | Erste Sales-Welle (~50–80 Kunden/Monat).              |
| **Business**  | ab 25 €/Monat | ab 20.000/Mo   | Aktiver Newsletter + Onboarding-Sequenzen.            |

**Realitäts-Check:** BFSG-Check verschickt pro Kunde ~3–4 Transactional-Mails (Scan-Done, Receipt, Fix-Plan-Ready, Follow-Up). Bei 100 Scans/Tag → 300–400 Mails/Tag → **Free reicht nicht**, Plan-Upgrade ab Monat 1 nach Launch einplanen.

**Trigger zum Upgrade:** Brevo-Dashboard zeigt „Daily limit reached" → sofort Starter buchen, sonst silent failures.

---

## Quick-Reference

| Frage                                | Antwort / Datei                                                  |
|--------------------------------------|------------------------------------------------------------------|
| Wie ist der aktuelle DNS-Stand?      | `bash deployment/scripts/check-mail-auth.sh`                     |
| Welche TXT-Records gehören wohin?    | `deployment/dns-records.md`                                       |
| DMARC-Phase wechseln?                | Siehe Tabelle Abschnitt 4 → INWX-TXT auf `_dmarc` aktualisieren.  |
| Mail wird als Spam markiert?         | mail-tester.com Score < 9 → Section 6 Mängel-Liste.               |
| User bekommt keine Mail?             | Brevo-Dashboard → Logs → nach Empfänger filtern.                  |

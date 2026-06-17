# 🚀 Mensch-Pflichten vor Live-Start

**Stand:** Alle 13 PRs sind gemerged auf `claude/pre-launch-sprint`. Server `bfsg-fix.de` läuft mit altem Code (vor PRs). Diese Liste musst du komplett abarbeiten BEVOR der Code live geht. Reihenfolge wichtig!

**Aufwand gesamt:** ~3–4 Stunden eigene Zeit + 1–2h Anwalt + 1–2 Tage Wartezeit (Versicherung, Anwalts-Termin).

**Realistischer Live-Termin:** 23.–25.06.2026 (in ~1 Woche).

---

## 📋 Übersichts-Checkliste

Häkche jeden Punkt ab wenn fertig. **In dieser Reihenfolge abarbeiten.**

### Block A — Vorbereitung (1 Stunde, kannst jetzt sofort anfangen)
- [ ] A1: ADMIN_TOKEN generieren (2 min)
- [ ] A2: Sentry-Account anlegen (10 min)
- [ ] A3: GPG-Keypair für Backup generieren (15 min)
- [ ] A4: Hetzner Storage-Box bestellen (10 min)
- [ ] A5: Notion-Workspace + Integration anlegen (15 min)

### Block B — Anwalt (parallel laufen lassen, dauert 1–7 Tage)
- [ ] B1: Anwaltstermin vereinbaren (5 min)
- [ ] B2: Rechtstext-Platzhalter füllen (15 min)
- [ ] B3: Anwalt-Termin durchführen (1–2h)
- [ ] B4: Anwalts-Feedback einarbeiten

### Block C — Server-Konfiguration (30 min, NACH Block A)
- [ ] C1: SSH-Zugang prüfen
- [ ] C2: .env auf Server aktualisieren
- [ ] C3: GPG-Pubkey auf Server importieren
- [ ] C4: rclone für Storage-Box konfigurieren

### Block D — GitHub-Secrets (10 min)
- [ ] D1: SMTP_USER + SMTP_PASS
- [ ] D2: ADMIN_TOKEN
- [ ] D3: SENTRY_DSN
- [ ] D4: NOTION_TOKEN + NOTION_DB_*

### Block E — DNS (5 min)
- [ ] E1: preview.bfsg-fix.de Record bei INWX
- [ ] E2: admin.bfsg-fix.de Record bei INWX

### Block F — Code-Integration (Claude erledigt für dich nach deinem GO)
- [ ] F1: Logger/Sentry-Integration in scanner/app.js
- [ ] F2: Invoice-Generierung-Integration in app.js
- [ ] F3: docker-compose um landing-next + admin-next erweitern
- [ ] F4: Commit + Push auf claude/pre-launch-sprint

### Block G — Versicherung (parallel, 1–2 Tage)
- [ ] G1: Vermögensschaden-Haftpflicht beantragen

### Block H — Live-Schaltung (NACH Block A–G)
- [ ] H1: Merge claude/pre-launch-sprint → main (Auto-Deploy triggert)
- [ ] H2: Deploy-Logs beobachten
- [ ] H3: /health-Check
- [ ] H4: Test-Bestellung mit eigener Karte
- [ ] H5: Refund-Test
- [ ] H6: Mail-Eingang verifizieren

### Block I — Marketing-Aktivierung (NACH erfolgreichem Block H)
- [ ] I1: Google Ads aktivieren
- [ ] I2: LinkedIn-Profil + erster Post
- [ ] I3: Partner-Outreach starten

### Block J — Sicherheits-Hygiene (jederzeit)
- [ ] J1: Stripe rk_live_-Key rotieren
- [ ] J2: Brevo SMTP-Key rotieren
- [ ] J3: Hetzner-Cloud-Token löschen
- [ ] J4: SSH-Key rotieren

---

# 📖 Detaillierte Anleitungen (5-Jährige-tauglich)

## A1: ADMIN_TOKEN generieren ⏱️ 2 min

**Was:** Ein zufälliges Passwort für die Admin-API (für `/admin/orders` und `/api/resend/*`).

**Wie:**
1. Öffne dein Terminal (auf Mac: Cmd+Leertaste → "Terminal" eingeben → Enter)
2. Tippe diesen Befehl rein + Enter:
   ```
   openssl rand -hex 32
   ```
3. Es kommt eine Zeile wie `a1b2c3d4e5f6...` raus (64 Zeichen, nur Buchstaben+Zahlen)
4. **Markiere die Zeile mit Maus + Cmd+C** (kopieren)
5. Speichere sie in deinem Passwort-Manager (1Password, Bitwarden, Apple Keychain) unter dem Namen "BFSG-Check ADMIN_TOKEN"

**Erwartetes Ergebnis:** Du hast einen 64-Zeichen-Token im Passwort-Manager. Den brauchst du gleich für C2 + D2.

---

## A2: Sentry-Account anlegen ⏱️ 10 min

**Was:** Sentry trackt Fehler im Server. Wenn was crasht, kriegst du eine Mail.

**Wie:**
1. Browser öffnen → https://sentry.io/signup/
2. **„Sign up with Email"** klicken
3. E-Mail: `matze.seba@outlook.de`, Passwort frei wählen
4. Organisation: Name eingeben (`BFSG-Check`)
5. Bei „Choose your platform" → **Node.js** klicken
6. Bei „Configure your SDK" siehst du in der Mitte einen DSN-String:
   ```
   https://abc123@o456.ingest.sentry.io/789
   ```
7. **Diesen ganzen DSN-String markieren + Cmd+C** kopieren
8. Im Passwort-Manager speichern unter „BFSG-Check SENTRY_DSN"
9. Unten in der Sentry-Anleitung **„Skip Setup"** oder Wizard zu Ende klicken (egal, wir machen den Code-Teil schon)

**Plan-Wahl:** „Developer (Free)" — 5.000 Events/Monat reichen für Start.

**Erwartetes Ergebnis:** SENTRY_DSN-String im Passwort-Manager. Brauchst du für C2 + D3.

---

## A3: GPG-Keypair für Backup generieren ⏱️ 15 min

**Was:** Ein Schlüssel-Paar zum Verschlüsseln deiner Backups. Der private Schlüssel BLEIBT BEI DIR (NICHT auf Server!).

**Wie:**
1. Terminal öffnen
2. Prüfe ob GPG installiert ist:
   ```
   gpg --version
   ```
   - Wenn „command not found" → installiere mit `brew install gnupg` (macOS) und mache Schritt 2 nochmal
3. Keypair erzeugen:
   ```
   gpg --batch --gen-key <<EOF
   Key-Type: RSA
   Key-Length: 4096
   Name-Real: BFSG-Check Backup
   Name-Email: backup@bfsg-fix.de
   Expire-Date: 5y
   %no-protection
   %commit
   EOF
   ```
4. Drücke Enter — dauert 10–30 Sekunden (er erzeugt Zufallszahlen)
5. Public-Key exportieren (kommt auf Server):
   ```
   gpg --armor --export backup@bfsg-fix.de > ~/Desktop/backup-pubkey.asc
   ```
6. Private-Key exportieren (BLEIBT BEI DIR!):
   ```
   gpg --armor --export-secret-keys backup@bfsg-fix.de > ~/Desktop/backup-privkey.asc
   ```
7. Öffne Finder → Desktop → `backup-privkey.asc` rechtsklicken → mit Texteditor öffnen
8. Den **gesamten Inhalt** kopieren (Cmd+A, Cmd+C) und in deinen Passwort-Manager unter „BFSG-Check GPG Private Key Backup" packen
9. **WICHTIG:** Lösche danach beide Dateien vom Desktop:
   ```
   shred -uvz ~/Desktop/backup-privkey.asc
   ```
   (Mac ohne shred: `rm -P ~/Desktop/backup-privkey.asc`)
   - Den Public-Key `backup-pubkey.asc` LASSEN, brauchst du gleich für C3

**Erwartetes Ergebnis:**
- Private-Key sicher im Passwort-Manager
- `backup-pubkey.asc` noch auf Desktop für C3

---

## A4: Hetzner Storage-Box bestellen ⏱️ 10 min

**Was:** Cloud-Speicher für deine Backups. 3,20 €/Monat reichen (100 GB).

**Wie:**
1. Browser: https://accounts.hetzner.com/login → mit Hetzner-Account einloggen
2. Im Menü → **„Storage Boxes"** klicken (oder direkt: https://robot.hetzner.com/storage)
3. **„Storage Box bestellen"** klicken
4. Produkt: **BX11** (100 GB, 3,20 €/Monat) auswählen
5. Standort: gleich wie dein Server (Nürnberg empfohlen)
6. **„Bestellen"** → Bestätigen
7. Wenige Minuten warten — Email kommt mit:
   - **Storage-Box-Username** (`uXXXXX`)
   - **Storage-Box-Passwort** (komplexer String)
   - **Hostname** (`uXXXXX.your-storagebox.de`)
8. Alle 3 Daten im Passwort-Manager speichern unter „Hetzner Storage-Box"

**Erwartetes Ergebnis:** Storage-Box-Credentials im Passwort-Manager. Brauchst du gleich für C4.

---

## A5: Notion-Workspace + Integration anlegen ⏱️ 15 min

**Was:** Notion-Dashboard für Live-Sicht auf Orders + MRR.

**Wie:**
1. Browser: https://notion.so → einloggen (falls nicht: kostenlos anlegen mit `matze.seba@outlook.de`)
2. **Settings & Members** (links unten Zahnrad) → **Connections** → **„Develop or manage integrations"**
3. **„+ New integration"** klicken
4. Name: `BFSG-Check Dashboard`
5. „Associated workspace": dein Workspace
6. Type: **Internal**
7. „Capabilities" (Checkboxen):
   - ☑ Read content
   - ☑ Update content
   - ☑ Insert content
8. **„Submit"** klicken
9. Du siehst **„Internal Integration Secret"** mit `secret_xxx...`
10. **Show & copy** klicken → in Passwort-Manager speichern unter „Notion BFSG-Token"

11. Neue Notion-Page anlegen:
    - Links in der Seitenleiste **„+ Add a page"** klicken
    - Titel: **BFSG-Check Dashboard**
    - Page öffnen
12. **Oben rechts** in der Page → `…` (Drei-Punkte-Menü) → **„Connect to"** → wähle **„BFSG-Check Dashboard"**
13. URL der Page kopieren (oben in der Browser-Adresszeile). Format:
    ```
    notion.so/BFSG-Check-Dashboard-ABCDEFG123...
    ```
14. Speichere im Passwort-Manager unter „Notion Page URL"

**Erwartetes Ergebnis:** Notion-Token + Page-URL im Passwort-Manager. Brauchst du gleich für die DBs (siehe weiter unten).

---

## B1: Anwaltstermin vereinbaren ⏱️ 5 min

**Was:** Anwalt soll deine Rechtstexte prüfen. Ohne das: keine Live-Schaltung.

**Wo finden:**
- Empfehlung: Fachanwalt für **IT-Recht ODER Wettbewerbsrecht**
- Online-Plattformen: anwalt.de, advocado.de, anwalt-suchservice.de
- Suche: „Fachanwalt IT-Recht E-Commerce DSGVO" + dein Ort
- Erstgespräch dauert 30–60 Min, kostet ~150–300 €

**Was schicken (E-Mail-Vorlage):**
```
Sehr geehrte/r Frau/Herr [Name],

ich starte demnächst BFSG-Check, eine SaaS-Plattform zur technischen
Erstprüfung von Websites auf Barrierefreiheit (BFSG/WCAG) und Cookie-
Compliance (§ 25 TDDDG). Vor Live-Schaltung benötige ich eine kurze
anwaltliche Freigabe der Rechtstexte.

Umfang:
- Impressum (§ 5 DDG)
- Datenschutzerklärung (DSGVO Art. 13)
- AGB (B2B + B2C, inkl. Widerrufsbelehrung)
- Widerrufs-Button (§ 356e BGB, neu seit 19.06.2026)
- Disclaimer „keine Rechtsberatung, keine Konformitätsgarantie"

Geschätzter Aufwand: 1–2 Stunden Review. Ich liefere eine konkrete
Checkliste mit 12 Detail-Fragen, alle relevanten HTML-Files als PDF-Export,
und meine ladungsfähigen Stamm­daten.

Wann hätten Sie kurzfristig Zeit für ein 30-Minuten-Erstgespräch
(telefonisch / per Videocall) zur Klärung von Honorar und Vorgehen?

Mit freundlichen Grüßen
[Dein Name]
matze.seba@outlook.de
```

**Erwartetes Ergebnis:** Termin in 1–7 Tagen. Bis dahin: Block A + C + D + E parallel erledigen.

---

## B2: Rechtstext-Platzhalter füllen ⏱️ 15 min

**Was:** Im Repo gibt es 20 Stellen mit `[Platzhalter]` (z.B. `[Name]`, `[Anschrift]`). Die musst du mit deinen echten Daten füllen.

**Wie:**
1. Browser: https://github.com/matzeseba/bfsg-check/blob/claude/pre-launch-sprint/docs/LEGAL-PLACEHOLDERS.md
2. Die Datei listet alle 20 Platzhalter auf
3. Für jeden Platzhalter:
   - Geh in GitHub zur entsprechenden Datei (`landingpage/impressum.html` etc.)
   - Klick auf **Edit (Stift-Icon oben rechts)**
   - Suche den Platzhalter (Cmd+F im Browser) → ersetze mit deinen echten Daten
   - Unten **„Commit changes"** klicken
4. **Pflicht-Angaben für Impressum (§ 5 DDG):**
   - Vollständiger Name (kein Pseudonym!)
   - Ladungsfähige Anschrift (Postfach reicht NICHT, muss eine echte Hausadresse oder c/o-Adresse sein — `Impressums-Service` z.B. von autorenwelt.de für 5 €/Monat als Notlösung)
   - E-Mail: `kontakt@bfsg-fix.de` (lege bei Brevo eine Alias-Adresse an, leitet auf dein Outlook)
   - Telefonnummer: optional (aber empfohlen für Trust)
   - USt-IdNr.: nur wenn regelbesteuert (siehe C2 VAT_MODE)
   - Steuernummer: vom Finanzamt (optional)

**Erwartetes Ergebnis:** Alle 20 Platzhalter durch echte Daten ersetzt. Du erstellst pro Datei einen separaten Commit auf einem neuen Branch, dann Pull-Request.

**Falls zu komplex:** Sag mir Bescheid mit deinen Stamm­daten, ich mache den Branch + PR für dich.

---

## C1: SSH-Zugang prüfen ⏱️ 2 min

**Was:** Stelle sicher dass du auf den Server kommst.

**Wie:**
1. Terminal
2. Tippe:
   ```
   ssh root@bfsg-fix.de
   ```
3. Wenn Frage „Are you sure…" → tippe `yes` + Enter
4. Wenn Frage „password:" → dein vorhin gesetztes Hetzner-Root-Passwort eintippen (blind, nichts wird angezeigt) + Enter
5. Wenn du jetzt Prompt `root@bfsg-fix:~#` siehst → ✅ funktioniert. Tippe `exit` + Enter zum Beenden.

**Wenn es nicht klappt:** Sag mir Bescheid + Screenshot vom Fehler — dann debugge ich.

---

## C2: .env auf Server aktualisieren ⏱️ 10 min

**Was:** Die kritischen Server-Variablen ergänzen (ADMIN_TOKEN, SENTRY_DSN, VAT_MODE, Stamm­daten für Rechnungen, Backup-Config).

**Wie:**
1. SSH einloggen wie in C1
2. Editor öffnen:
   ```
   nano /opt/bfsg-check/deployment/.env
   ```
3. Am Ende der Datei (mit Pfeiltasten ganz unten hingehen) folgendes einfügen — **dabei die Werte aus deinem Passwort-Manager einsetzen**:
   ```
   ADMIN_TOKEN=DEIN_64_ZEICHEN_TOKEN_AUS_A1
   SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
   VAT_MODE=kleinunternehmer
   INVOICE_FROM_NAME=BFSG-Check (Vorname Nachname)
   INVOICE_FROM_ADDRESS=Straße 12, 10115 Berlin
   INVOICE_USTID=
   INVOICE_TAX_NUMBER=
   INVOICE_IBAN=
   BACKUP_GPG_RECIPIENT=backup@bfsg-fix.de
   BACKUP_TARGET=hetzner-storage:bfsg-backups
   ```
4. **Speichern:** Ctrl+O → Enter → Ctrl+X
5. Container neu starten damit die neuen Variablen greifen:
   ```
   cd /opt/bfsg-check/deployment && docker compose restart app
   ```
6. Test:
   ```
   curl -fSs https://bfsg-fix.de/health
   ```
   Erwartung: `{"ok":true,"stripe":true,"live":true,"mailer":"aktiv...","aboEnabled":false}`

**WICHTIG:** Wenn `VAT_MODE` für dich `regelbesteuerung` ist (über 22k €/Jahr Umsatz) → setze stattdessen `VAT_MODE=regelbesteuerung` + fülle `INVOICE_USTID` mit deiner USt-IdNr.

**Erwartetes Ergebnis:** `/health` zeigt `live:true`. Server kennt jetzt alle neuen Variablen.

---

## C3: GPG-Pubkey auf Server importieren ⏱️ 5 min

**Was:** Damit der Server deine Backups verschlüsseln kann.

**Wie:**
1. **Auf deinem Mac/PC** Terminal:
   ```
   scp ~/Desktop/backup-pubkey.asc root@bfsg-fix.de:/tmp/
   ```
2. Passwort eingeben → Datei wird hochgeladen
3. **Auf dem Server** (SSH):
   ```
   gpg --import /tmp/backup-pubkey.asc
   ```
   Erwartung: `gpg: key XXX: public key "BFSG-Check Backup <backup@bfsg-fix.de>" imported`
4. Key als „vertrauenswürdig" markieren (sonst weigert sich GPG ihn zum Encrypten zu nutzen):
   ```
   echo "$(gpg --list-keys --with-colons backup@bfsg-fix.de | awk -F: '/fpr/{print $10;exit}'):6:" | gpg --import-ownertrust
   ```
5. Aufräumen:
   ```
   rm /tmp/backup-pubkey.asc
   ```
6. **Auf deinem Mac/PC** Terminal:
   ```
   shred -uvz ~/Desktop/backup-pubkey.asc
   ```
   (oder einfach in den Papierkorb + Papierkorb leeren)

**Erwartetes Ergebnis:** Server kann jetzt Backups mit deinem Pubkey verschlüsseln. Privater Schlüssel ist NUR bei dir.

---

## C4: rclone für Storage-Box konfigurieren ⏱️ 5 min

**Was:** rclone ist das Tool, das die Backups hochlädt. Wir konfigurieren es für deine Storage-Box.

**Wie:**
1. SSH zum Server
2. rclone-Konfiguration starten:
   ```
   rclone config
   ```
3. **n** für „New remote" + Enter
4. Name: `hetzner-storage` + Enter
5. Storage-Typ: **5** (für sftp) + Enter
6. Host: deine Storage-Box-URL ohne `https://`, z.B. `uXXXXX.your-storagebox.de` + Enter
7. User: `uXXXXX` (deine Storage-Box-Username aus A4) + Enter
8. Port: `23` (Storage-Box nutzt 23 statt 22) + Enter
9. Passwort: **y** für „yes type in my own password" + Enter
10. Passwort eingeben (aus A4) + Enter, dann zweite Bestätigung + Enter
11. Bei „Use ssh-key" einfach Enter (skip)
12. Restliche Fragen mit Enter (Defaults nehmen)
13. Bei „Edit advanced config" → **n** + Enter
14. Übersicht: **y** für „Yes this is OK" + Enter
15. **q** für quit + Enter

16. Test:
    ```
    rclone mkdir hetzner-storage:bfsg-backups
    rclone lsd hetzner-storage:
    ```
    Erwartung: `bfsg-backups`-Ordner wird angezeigt.

17. Backup manuell testen:
    ```
    /opt/bfsg-check/deployment/backup.sh
    ```
    Erwartung: Logs zeigen `[OK] Uploaded to hetzner-storage:bfsg-backups/bfsg-backup-YYYYMMDD.tar.gz.gpg`

**Erwartetes Ergebnis:** Erstes Backup liegt verschlüsselt in der Storage-Box. Ab jetzt automatisch jeden Tag um 3 Uhr nachts.

---

## D1–D4: GitHub-Secrets setzen ⏱️ 10 min

**Was:** Damit die GitHub-Actions-Workflows (uptime-watch, backup-restore-test, notion-sync) auf den Server zugreifen können.

**Wie:**
1. Browser: https://github.com/matzeseba/bfsg-check/settings/secrets/actions
2. Für jeden der folgenden Secrets:
   - **„New repository secret"** klicken
   - Name eintippen
   - Value einfügen (aus deinem Passwort-Manager)
   - **„Add secret"** klicken

**Liste:**

| Secret-Name | Wert |
|---|---|
| `SMTP_USER` | `matthiasseba92@gmail.com` (deine Brevo-Login-Mail) |
| `SMTP_PASS` | Brevo SMTP-Key (aus app.brevo.com → SMTP & API → SMTP) |
| `ADMIN_TOKEN` | dein Token aus A1 |
| `SENTRY_DSN` | dein DSN aus A2 |

**Zusätzlich für Notion-Dashboard (D4 = nach Notion-DBs angelegt, siehe nächster Block):**

| Secret-Name | Wert |
|---|---|
| `NOTION_TOKEN` | aus A5 |
| `NOTION_DB_ORDERS` | (kommt gleich) |
| `NOTION_DB_SUBSCRIPTIONS` | (kommt gleich) |

**Notion-DBs anlegen (machst du in der Notion-Page von A5):**
1. In deiner „BFSG-Check Dashboard" Notion-Page
2. Tippe `/database` → **„Table - Inline"** auswählen
3. Name der Database: **Orders**
4. Spalten anlegen (Klick auf `+` rechts):
   - `Session-ID` (bleibt Title-Spalte) — Type: Title
   - `E-Mail` — Type: Email
   - `URL` — Type: URL
   - `Paket` — Type: Select → Optionen: basis, profi, cookie-basis, cookie-profi, abo
   - `Betrag (€)` — Type: Number
   - `Status` — Type: Select → Optionen: PAID, FULFILLING, MAILED, FAILED, RESENDING, RESENT
   - `Erstellt` — Type: Date
   - `PDF-Pfad` — Type: Text
   - `Fehler` — Type: Text
5. Wenn fertig: **`…` (oben rechts in der DB) → „Copy link to view"**
6. URL hat das Format `notion.so/.../ABCDEF?v=...` — die `ABCDEF` ist die DB-ID
7. Diese ID als GitHub-Secret `NOTION_DB_ORDERS` setzen

8. **Subscriptions-DB analog:** zweite `/database` mit Spalten:
   - `Subscription-ID` (Title)
   - `E-Mail` (Email)
   - `URL` (URL)
   - `Paket` (Select)
   - `Status` (Select: ACTIVE, CANCELLED)
   - `Created` (Date)
   - `Letzter Re-Check` (Date)
   - `Customer-ID Stripe` (Text)
9. DB-ID als GitHub-Secret `NOTION_DB_SUBSCRIPTIONS` setzen

**Erwartetes Ergebnis:** 7 GitHub-Secrets gesetzt. Die Workflows können jetzt automatisch laufen.

---

## E1 + E2: DNS-Records bei INWX ⏱️ 5 min

**Was:** Subdomains für Next.js-Preview + Admin-Dashboard.

**Wie:**
1. Browser: https://www.inwx.de/de/customer/login
2. Einloggen → **Nameserver** → **DNS**
3. Klick auf **bfsg-fix.de**
4. **„Eintrag hinzufügen"**:

| # | Typ | Host | Wert | TTL |
|---|---|---|---|---|
| 1 | A | `preview` | `178.105.83.0` | `3600` |
| 2 | A | `admin` | `178.105.83.0` | `3600` |
| 3 | AAAA | `preview` | `2a01:4f8:1c18:d890::1` | `3600` |
| 4 | AAAA | `admin` | `2a01:4f8:1c18:d890::1` | `3600` |

5. Speichern. Propagation dauert 5–60 Min.

**Erwartetes Ergebnis:** Du kannst später `preview.bfsg-fix.de` (Next.js-Landing) und `admin.bfsg-fix.de` (Dashboard) anzeigen.

---

## F1–F4: Code-Integration (Claude macht das für dich)

**Was:** Logger + Sentry + Invoice müssen in scanner/app.js eingebaut werden + docker-compose um die neuen Services erweitert werden.

**Wie:** **NICHTS** musst du tun außer mir zu sagen: „Mach F1–F4". Ich mache dann:
- 3-Zeilen-Edit in app.js für Logger/Sentry-Init
- 3-Zeilen-Edit für Invoice-PDF im Webhook
- docker-compose erweitern um `landing-next` + `admin-next` Services
- Commit + Push auf `claude/pre-launch-sprint`

Dauer: 10–15 min meinerseits.

---

## G1: Vermögensschaden-Haftpflicht ⏱️ 30 min Antrag + 1–7 Tage Bearbeitung

**Was:** Versicherung gegen Schäden die dein Code beim Kunden auslöst.

**Wo:**
- **Hiscox** (Empfehlung): https://www.hiscox.de/it-haftpflichtversicherung — Online-Antrag, ab ~30 €/Mo
- **exali**: https://www.exali.de/IT-Haftpflicht — ähnlich, ab ~25 €/Mo
- **Markel**: https://www.markel.de/it-haftpflicht — ab ~40 €/Mo

**Was angeben:**
- Tätigkeit: „IT-Dienstleistung, SaaS-Plattform für Website-Compliance-Prüfung"
- Jahresumsatz (Schätzung): 5.000 € (Bootstrap-Phase)
- Versicherungssumme: 250.000 € (Standard)
- Selbstbeteiligung: 1.000 € (drückt Beitrag)
- Mitarbeiter: 1 (du)

**Erwartetes Ergebnis:** Police innerhalb 1–7 Tagen per Mail. Erst nach Vorliegen der Police live schalten (Cyber-Risiko sonst persönlich).

---

## H1: Merge claude/pre-launch-sprint → main ⏱️ 2 min + 5 min Deploy

**Was:** Der finale Schritt. Code geht live, Auto-Deploy triggert.

**Voraussetzungen (ALLE müssen ✅ sein):**
- [ ] Block A komplett
- [ ] Block B komplett (Anwalt hat OK gegeben + Platzhalter sind drin)
- [ ] Block C komplett (Server-.env aktuell, GPG + rclone konfiguriert)
- [ ] Block D komplett (GitHub-Secrets)
- [ ] Block E komplett (DNS)
- [ ] Block F komplett (Claude hat Code-Integration gemacht)
- [ ] Block G komplett (Versicherung-Police da)

**Wie:**
1. Sag mir „Mach H1". Ich mache dann den Merge `claude/pre-launch-sprint → main`.
2. Auto-Deploy triggert automatisch (deploy.yml auf main-Push).
3. Beobachte die Action: https://github.com/matzeseba/bfsg-check/actions
4. Nach ~5 Min: Deploy ist grün, neuer Code läuft.

**Wenn Deploy fehlschlägt:** Ich rollback per `git revert` auf den vorigen Stand.

---

## H2–H6: Verifikation nach Live-Schaltung ⏱️ 30 min

### H2: Deploy-Logs beobachten
- https://github.com/matzeseba/bfsg-check/actions → den neuesten „Deploy to Hetzner"-Run anklicken
- Logs durchscrollen, am Ende sollte stehen: `=== Health-Check ===` + `{"ok":true...}`

### H3: /health-Check
```
curl -fSs https://bfsg-fix.de/health
```
Erwartung:
```
{"ok":true,"stripe":true,"live":true,"mailer":"aktiv (SMTP konfiguriert)","aboEnabled":false}
```

### H4: Test-Bestellung mit eigener Karte
**Detail-Anleitung:** siehe `docs/STRIPE-LIVE-TESTKAUF.md` im Repo.

Zusammengefasst:
1. https://bfsg-fix.de öffnen
2. Gratis-Scan starten für `example.com`
3. „Vollreport sichern" → Basis (199 €) oder lege vorher 1 €-Test-Produkt in Stripe an
4. Im Checkout-Modal:
   - Verbraucher-Toggle
   - Widerruf-Consent ankreuzen
   - **Eigene E-Mail** eingeben
   - „Zahlungspflichtig bestellen"
5. Mit **eigener echter Karte** bezahlen
6. Auf Server: `docker compose logs --tail=50 app | grep webhook`
7. Mail sollte in 2 Min ankommen (auch Spam-Ordner!)
8. PDF prüfen: Score sichtbar, Findings drin, Footer-Disclaimer da

### H5: Refund-Test
1. Stripe-Dashboard → **Zahlungen** → den Test-Payment finden
2. **„Erstatten"** klicken → vollständiger Betrag
3. Refund läuft in 5–10 Werktagen zurück. Effektive Kosten: 0 €.

### H6: Mail-Eingang verifizieren
- Test-Bestellung-Mail im Posteingang (NICHT Spam) → ✅
- Falls Spam: `bash deployment/scripts/check-mail-auth.sh bfsg-fix.de`
- mail-tester.com Score holen: gehe auf https://www.mail-tester.com, sehe Test-Adresse `test-xxx@mail-tester.com`, schicke vom Server eine Test-Mail dorthin (via /api/widerruf-Endpoint mit Test-Daten triggern), klicke „Then check your score" → Ziel: ≥ 9/10

---

## I1–I3: Marketing-Aktivierung

### I1: Google Ads
- Konto: https://ads.google.com/intl/de_de/start
- Kampagne anlegen mit **`marketing/google-ads-keywords.csv`** im Repo
- Negative Keywords aus **`marketing/google-ads-negatives.csv`**
- Budget: **10 €/Tag** zum Start
- Conversion-Tracking-Tag aktivieren (Anleitung von Google)
- Kampagne **pausiert** speichern → mir Bescheid sagen, ich review + dann aktivieren

### I2: LinkedIn-Profil + erster Post
- Profil-Headline ändern auf: „BFSG-Check Gründer — Compliance-Scans für deutsche Websites"
- Ersten Post veröffentlichen:
  > 🇩🇪 Habe 10 deutsche Online-Shops auf BFSG-Konformität geprüft.
  >
  > 9 von 10 fallen beim Kontrast durch.
  >
  > Die 5 häufigsten Findings:
  > 1. Kontrast unter WCAG-Schwelle (4.5:1 Text)
  > 2. Fehlende alt-Attribute bei Bildern
  > 3. Keine Skip-Links für Tastatur-Nutzer
  > 4. Form-Inputs ohne Labels
  > 5. Cookie-Banner ohne Opt-Out vor Tracking
  >
  > Gratis-Check unter bfsg-fix.de — Vollreport ab 199 € (kein Abo-Zwang).
  >
  > Wie habt ihr eure Site geprüft? 👇

### I3: Partner-Outreach
- Liste: **`marketing/partner-targets.md`** im Repo
- 30 Web-Agenturen + 30 IT-Anwaltskanzleien
- Pro Tag 5 LinkedIn-DMs (KEIN Cold-Mail!)
- Vorlage steht im File

---

## J1–J4: Sicherheits-Hygiene ⏱️ 10 min

Alle Secrets, die durch unseren Chat liefen, rotieren:

### J1: Stripe rk_live-Key
- Dashboard → **Developers → API Keys** → den genutzten Restricted-Key
- Rechts „…" → **„Roll key"** → neuen Key kopieren
- Server-`.env` aktualisieren mit neuem Key → `docker compose restart app`

### J2: Brevo SMTP-Key
- app.brevo.com → **SMTP & API** → SMTP → den genutzten Key
- **„Revoke"** + neuen Key generieren
- Server-`.env` `SMTP_PASS=…` + GitHub-Secret aktualisieren → `docker compose restart app`

### J3: Hetzner-Cloud-Token löschen
- console.hetzner.cloud → **Security → API Tokens** → `claude-bootstrap`-Token
- **„Delete"** — brauche ich nicht mehr

### J4: SSH-Key rotieren
- Mir Bescheid sagen, ich generiere neuen
- Du tauschst alten gegen neuen in `~/.ssh/authorized_keys` auf Server
- Alter Key aus GitHub-Secret `HETZNER_SSH_KEY` ersetzen

---

# 🎯 Empfohlene Reihenfolge der Abarbeitung

**Heute Abend (1 h):**
- A1, A2, A3, A4, A5

**Morgen:**
- B1 Anwaltstermin anfragen (5 min)
- B2 Platzhalter füllen (15 min)
- C1, C2, C3, C4 (30 min, sobald A fertig)
- D1–D4 (10 min)
- E1, E2 (5 min)
- G1 Versicherungsantrag stellen (30 min)

**In den 1–7 Tagen Wartezeit:**
- Anwalt-Termin wahrnehmen (B3)
- Anwalt-Feedback einarbeiten (B4)
- Versicherungs-Police kommt

**Wenn Anwalt OK + Police da:**
- „Claude, mach F1–F4" (15 min meinerseits)
- „Claude, mach H1" (Merge auf main, 2 min)
- H2–H6 Verifikation (30 min)
- I1–I3 Marketing scharf schalten (60 min)

**Jederzeit (asap):**
- J1, J2, J3 Secrets rotieren (10 min)

---

# 🆘 Wenn was schiefgeht

**Sag mir Bescheid mit:**
- Welcher Schritt: z.B. „C2 hat nicht geklappt"
- Was passiert ist: Screenshot + Fehlermeldung
- Was du erwartet hattest

Ich debugge dann. Wir sind ein Team.

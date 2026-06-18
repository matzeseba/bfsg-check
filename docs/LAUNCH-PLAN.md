# 🚀 BFSG-Check — Dein Live-Plan

> **Für Matthias.** So einfach, dass es jeder verstehen kann.
> Hak einfach jeden Punkt ab. Wenn was nicht klappt → mir Bescheid sagen.

**Wo stehst du:** Code ist fertig, Server läuft, Stripe live, Brevo-Mail aktiv, Cookie-Banner deployed.
**Was fehlt:** 6 Schritte. Dann kannst du live gehen und Geld verdienen.

---

## ⏱️ Wie lange dauert alles?

| Was | Du machst | Andere warten |
|---|---|---|
| Alles vorbereiten (du selbst) | 1,5 Stunden | – |
| Anwalt anschreiben + Termin | 5 Minuten | 1–7 Tage Wartezeit |
| Versicherung beantragen | 30 Minuten | 1–7 Tage Wartezeit |
| Live-Schaltung + Test | 30 Minuten | – |
| Marketing starten | 1 Stunde | – |

**Realistischer Live-Termin:** in 1 Woche, also so um den **25.06.2026**.

---

## 🟢 BLOCK 1 — Heute Abend (1 Stunde)

Diese 5 Sachen kannst du sofort erledigen. Du brauchst dafür nur dein Mac/PC.

### ✅ Aufgabe 1.1: Admin-Passwort erstellen — 2 Minuten

**Warum:** Damit nur du an die Bestellungs-Liste rankommst.

**So geht's:**
1. Terminal öffnen (Mac: Cmd+Leertaste → "Terminal" tippen → Enter)
2. Diesen Befehl eintippen + Enter:
   ```
   openssl rand -hex 32
   ```
3. Es kommt eine lange Zeile (64 Zeichen) raus
4. Markieren + Cmd+C kopieren
5. In deinen Passwort-Manager speichern unter "BFSG ADMIN_TOKEN"

**Fertig wenn:** Du den Token im Passwort-Manager hast.

---

### ✅ Aufgabe 1.2: Sentry-Account anlegen — 10 Minuten

**Warum:** Wenn der Server kaputtgeht, kriegst du eine Mail.

**So geht's:**
1. Browser: https://sentry.io/signup/
2. „Sign up with Email" anklicken
3. E-Mail: matze.seba@outlook.de · Passwort frei wählen
4. Organisation: "BFSG-Check"
5. Plattform wählen: **Node.js**
6. Du siehst einen langen String der mit `https://` anfängt — das ist dein DSN
7. Den ganzen DSN kopieren + im Passwort-Manager speichern als "BFSG SENTRY_DSN"
8. Plan wählen: "Developer (Free)" — kostet nichts

**Fertig wenn:** SENTRY_DSN im Passwort-Manager.

---

### ✅ Aufgabe 1.3: Backup-Schlüssel erstellen — 15 Minuten

**Warum:** Damit deine Backups verschlüsselt sind und niemand sie lesen kann.

**So geht's:**
1. Terminal öffnen
2. Prüfen ob GPG installiert ist:
   ```
   gpg --version
   ```
   Falls "command not found": `brew install gnupg` eintippen + nochmal probieren.
3. Schlüssel-Paar erzeugen (alles auf einmal kopieren + Enter):
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
4. Privaten Schlüssel exportieren (BLEIBT BEI DIR):
   ```
   gpg --armor --export-secret-keys backup@bfsg-fix.de > ~/Desktop/backup-privkey.asc
   ```
5. Öffentlichen Schlüssel exportieren (kommt später auf Server):
   ```
   gpg --armor --export backup@bfsg-fix.de > ~/Desktop/backup-pubkey.asc
   ```
6. Den **privaten** Schlüssel in deinen Passwort-Manager kopieren:
   - Finder → Desktop → `backup-privkey.asc` mit Texteditor öffnen
   - Alles markieren (Cmd+A) + kopieren (Cmd+C)
   - In Passwort-Manager unter "BFSG GPG Private Key" einfügen
7. Privaten Schlüssel vom Desktop löschen:
   ```
   rm -P ~/Desktop/backup-privkey.asc
   ```
   Den `backup-pubkey.asc` LASSEN — den brauchst du in Block 3.

**Fertig wenn:** Privater Schlüssel im Passwort-Manager. Öffentlicher noch auf Desktop.

---

### ✅ Aufgabe 1.4: Speicher-Box bei Hetzner bestellen — 10 Minuten

**Warum:** Da liegen deine verschlüsselten Backups. Kostet 3,20 €/Monat.

**So geht's:**
1. Browser: https://accounts.hetzner.com/login → mit Hetzner-Account einloggen
2. Im Menü "Storage Boxes" klicken
3. "Storage Box bestellen" klicken
4. Produkt: **BX11** (100 GB, 3,20 €/Monat)
5. Standort: **Nürnberg** (gleicher Ort wie dein Server)
6. "Bestellen" → bestätigen
7. Nach 5 Minuten kommt eine Mail mit 3 Sachen:
   - Username (so was wie `u123456`)
   - Passwort (lange Zeichenkette)
   - Hostname (`u123456.your-storagebox.de`)
8. Alle 3 Sachen in den Passwort-Manager unter "Hetzner Storage-Box"

**Fertig wenn:** Storage-Box-Daten im Passwort-Manager.

---

### ✅ Aufgabe 1.5: Notion-Token holen — 15 Minuten

**Warum:** Damit du in Notion immer siehst, wer was bestellt hat.

**So geht's:**
1. Browser: https://notion.so → einloggen (oder kostenlos anlegen)
2. Links unten Zahnrad → **Settings** → **Connections** → **„Develop or manage integrations"**
3. **„+ New integration"** klicken
4. Name: `BFSG-Check Dashboard`
5. Workspace: deinen wählen
6. Type: **Internal**
7. Capabilities ankreuzen: ☑ Read content · ☑ Update content · ☑ Insert content
8. **„Submit"** klicken
9. Du siehst **„Internal Integration Secret"** → **„Show & copy"** klicken
10. In Passwort-Manager speichern als "Notion BFSG-Token"

**Jetzt eine Notion-Seite anlegen:**
1. Links in der Seitenleiste **„+ Add a page"** klicken
2. Titel: **BFSG-Check Dashboard**
3. Oben rechts in der Page → `…` → **„Connect to"** → **„BFSG-Check Dashboard"**
4. URL der Page kopieren (oben aus dem Browser)
5. Im Passwort-Manager speichern als "Notion Page URL"

**Fertig wenn:** Notion-Token + Page-URL im Passwort-Manager.

---

## 🟡 BLOCK 2 — Morgen früh (50 Minuten, parallel starten)

Zwei Sachen können parallel laufen und dauern 1–7 Tage Wartezeit:

### ✅ Aufgabe 2.1: Anwalt anschreiben — 5 Minuten

**Warum:** Anwalt muss die Rechtstexte freigeben, sonst Abmahn-Risiko.

**So geht's:**
1. Anwalt suchen: anwalt.de oder advocado.de · Suche: "Fachanwalt IT-Recht E-Commerce"
2. Diese E-Mail kopieren und versenden (an 2–3 Anwälte zum Vergleich):

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
und meine ladungsfähigen Stammdaten (Matthias Seba, Lange Straße 20,
27449 Kutenholz, info@matthias-seba.de, § 19 UStG Kleinunternehmer).

Wann hätten Sie kurzfristig Zeit für ein 30-Minuten-Erstgespräch
(telefonisch / per Videocall) zur Klärung von Honorar und Vorgehen?

Mit freundlichen Grüßen
Matthias Seba
matze.seba@outlook.de
```

**Fertig wenn:** E-Mail an 2–3 Anwälte raus. Termin kommt in 1–7 Tagen.

**Was es kostet:** Erstgespräch 30–60 Min, ca. 150–300 € · Review-Honorar 200–500 €.

---

### ✅ Aufgabe 2.2: Versicherung beantragen — 30 Minuten

**Warum:** Wenn dein Code beim Kunden was kaputt macht oder du eine Abmahnung kriegst, zahlt die Versicherung.

**So geht's:**
1. Browser: https://www.hiscox.de/it-haftpflichtversicherung (oder exali.de)
2. Online-Antrag starten
3. Das eingeben:
   - **Tätigkeit:** „IT-Dienstleistung, SaaS-Plattform für Website-Compliance-Prüfung"
   - **Jahresumsatz (Schätzung):** 5.000 €
   - **Versicherungssumme:** 250.000 €
   - **Selbstbeteiligung:** 1.000 € (macht Beitrag günstiger)
   - **Mitarbeiter:** 1 (du)
4. Antrag absenden
5. Police kommt per Mail in 1–7 Tagen, dann **PDF abspeichern** in einem Ordner „BFSG-Versicherung"

**Fertig wenn:** Police-PDF gespeichert. Kosten: ca. 30–60 €/Monat.

**WICHTIG:** Ohne Police KEINE Live-Schaltung. Cyber-Risiko sonst persönlich.

---

## 🔵 BLOCK 3 — Server einrichten (30 Minuten, sobald Block 1 fertig)

Hier musst du auf deinen Server zugreifen und Daten einspielen.

### ✅ Aufgabe 3.1: Test ob Server-Zugang klappt — 2 Minuten

**So geht's:**
1. Terminal öffnen
2. Tippen:
   ```
   ssh root@bfsg-fix.de
   ```
3. Bei "Are you sure" → `yes` + Enter
4. Bei "password" → dein Hetzner-Root-Passwort eintippen (man sieht nichts beim Tippen!) + Enter
5. Wenn du jetzt sowas wie `root@bfsg-fix:~#` siehst → ✅ klappt
6. `exit` + Enter zum Beenden

**Wenn es nicht klappt:** Mir Bescheid sagen mit Screenshot, ich helfe.

---

### ✅ Aufgabe 3.2: Server-Konfiguration ergänzen — 10 Minuten

**Warum:** Server muss deine neuen Tokens kennen (Admin-Passwort, Sentry, Backup).

**So geht's:**
1. Per SSH einloggen wie in 3.1
2. Datei zum Bearbeiten öffnen:
   ```
   nano /opt/bfsg-check/deployment/.env
   ```
3. Ganz nach unten gehen (Pfeil-Taste runter)
4. Diese Zeilen einfügen — **dabei DEINE Werte aus dem Passwort-Manager eintragen**:
   ```
   ADMIN_TOKEN=DEIN_64_ZEICHEN_TOKEN_AUS_1.1
   SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
   VAT_MODE=kleinunternehmer
   INVOICE_FROM_NAME=Matthias Seba
   INVOICE_FROM_ADDRESS=Lange Straße 20, 27449 Kutenholz
   INVOICE_USTID=
   INVOICE_TAX_NUMBER=
   INVOICE_IBAN=
   BACKUP_GPG_RECIPIENT=backup@bfsg-fix.de
   BACKUP_TARGET=hetzner-storage:bfsg-backups
   ```
5. Speichern: **Ctrl+O** → Enter → **Ctrl+X**
6. Server neu starten:
   ```
   cd /opt/bfsg-check/deployment && docker compose restart app
   ```
7. Test:
   ```
   curl -fSs https://bfsg-fix.de/health
   ```
   Erwartung: `{"ok":true,"stripe":true,"live":true,...}` — das `live:true` ist wichtig!

**Fertig wenn:** `/health` zeigt `live:true`.

---

### ✅ Aufgabe 3.3: GPG-Schlüssel auf Server hochladen — 5 Minuten

**So geht's:**
1. **Auf deinem Mac/PC** Terminal (NICHT im SSH):
   ```
   scp ~/Desktop/backup-pubkey.asc root@bfsg-fix.de:/tmp/
   ```
2. Passwort eingeben → Datei wird hochgeladen
3. Per SSH auf den Server einloggen
4. Auf Server eintippen:
   ```
   gpg --import /tmp/backup-pubkey.asc
   echo "$(gpg --list-keys --with-colons backup@bfsg-fix.de | awk -F: '/fpr/{print $10;exit}'):6:" | gpg --import-ownertrust
   rm /tmp/backup-pubkey.asc
   ```
5. Zurück auf deinem Mac/PC:
   ```
   rm -P ~/Desktop/backup-pubkey.asc
   ```

**Fertig wenn:** Server kann jetzt Backups verschlüsseln.

---

### ✅ Aufgabe 3.4: Speicher-Box mit Server verbinden — 5 Minuten

**So geht's (per SSH auf Server):**
1. rclone-Konfiguration starten:
   ```
   rclone config
   ```
2. **n** drücken + Enter (für „New remote")
3. Name: `hetzner-storage` + Enter
4. Storage-Typ: **5** + Enter (für sftp)
5. Host: dein Hostname aus 1.4 (z. B. `u123456.your-storagebox.de`) + Enter
6. User: deine Storage-Box-Username aus 1.4 + Enter
7. Port: `23` + Enter
8. Passwort: **y** + Enter, dann zweimal dein Storage-Box-Passwort eintippen
9. Bei „Use ssh-key" einfach Enter
10. Restliche Fragen mit Enter (Defaults)
11. Bei „Edit advanced config" → **n** + Enter
12. Übersicht: **y** + Enter
13. **q** + Enter

**Test:**
```
rclone mkdir hetzner-storage:bfsg-backups
rclone lsd hetzner-storage:
```
Erwartung: `bfsg-backups`-Ordner wird gezeigt.

**Erstes Backup machen:**
```
/opt/bfsg-check/deployment/backup.sh
```

**Fertig wenn:** Erstes Backup liegt verschlüsselt in der Storage-Box.

---

## 🟣 BLOCK 4 — GitHub-Secrets (10 Minuten)

Damit die Automatik-Workflows (Uptime, Backup-Test, Notion-Sync) laufen können.

### ✅ Aufgabe 4.1: Secrets eintragen — 10 Minuten

**So geht's:**
1. Browser: https://github.com/matzeseba/bfsg-check/settings/secrets/actions
2. Für jeden Eintrag in der Liste: **„New repository secret"** klicken, Name eintippen, Wert einfügen, **„Add secret"** klicken.

**Diese Secrets brauchst du:**

| Name | Wert |
|---|---|
| `SMTP_USER` | matthiasseba92@gmail.com |
| `SMTP_PASS` | Brevo SMTP-Key (aus app.brevo.com → SMTP & API) |
| `ADMIN_TOKEN` | Token aus 1.1 |
| `SENTRY_DSN` | DSN aus 1.2 |
| `NOTION_TOKEN` | Token aus 1.5 |

**Fertig wenn:** Alle 5 Secrets in GitHub sichtbar.

---

## 🟠 BLOCK 5 — DNS-Einträge bei INWX (5 Minuten)

**Warum:** Damit `preview.bfsg-fix.de` (neue Landingpage-Preview) und `admin.bfsg-fix.de` (Dashboard) funktionieren.

### ✅ Aufgabe 5.1: 4 DNS-Records anlegen — 5 Minuten

**So geht's:**
1. Browser: https://www.inwx.de/de/customer/login → einloggen
2. **Nameserver** → **DNS** → auf `bfsg-fix.de` klicken
3. „Eintrag hinzufügen" → diese 4 Records anlegen:

| Typ | Host | Wert | TTL |
|---|---|---|---|
| A | preview | 178.105.83.0 | 3600 |
| A | admin | 178.105.83.0 | 3600 |
| AAAA | preview | 2a01:4f8:1c18:d890::1 | 3600 |
| AAAA | admin | 2a01:4f8:1c18:d890::1 | 3600 |

4. Speichern. Es dauert 5–60 Minuten bis es live ist.

**Fertig wenn:** 4 DNS-Records angelegt.

---

## ⏳ ZWISCHENPAUSE — Warten auf Anwalt + Versicherung

Jetzt musst du erstmal 1–7 Tage warten. In der Zeit:

- ☎️ Anwalts-Termin wahrnehmen (1–2 h Gespräch)
- 📝 Anwalts-Feedback in die Texte einbauen (machst du selbst über GitHub-Edit ODER sagst mir Bescheid)
- 📬 Versicherungs-Police kommt per Mail

**Was du schon vorbereiten kannst:**
- Mit eigener Karte 1 € auf dein Stripe-Konto laden für den Test-Kauf
- Brevo-Mail einrichten: `kontakt@bfsg-fix.de` als Alias auf dein Outlook
- LinkedIn-Profil-Headline ändern

---

## 🚦 BLOCK 6 — Live-Schaltung (30 Minuten, NACH Block 1–5 + Anwalt-OK + Police)

### Voraussetzungen (alle müssen ✅ sein):
- [ ] Block 1 komplett (alle 5 Aufgaben)
- [ ] Block 2 komplett (Anwalt-Termin + Versicherung-Antrag)
- [ ] Block 3 komplett (Server konfiguriert)
- [ ] Block 4 komplett (GitHub-Secrets)
- [ ] Block 5 komplett (DNS)
- [ ] Anwalt hat OK gegeben
- [ ] Versicherungs-Police ist da

### ✅ Aufgabe 6.1: Live-Schaltung triggern — 2 Minuten

**So geht's:**
1. Mir Bescheid sagen: **„Mach Block 6.1"**
2. Ich mache dann den Merge auf main → Auto-Deploy triggert
3. Du beobachtest die Action: https://github.com/matzeseba/bfsg-check/actions
4. Nach 5 Minuten ist Deploy grün

---

### ✅ Aufgabe 6.2: Health-Check — 1 Minute

**So geht's:**
1. Terminal:
   ```
   curl -fSs https://bfsg-fix.de/health
   ```
2. Erwartung: `{"ok":true,"stripe":true,"live":true,"mailer":"aktiv ..."}`

**Wenn nicht `live:true`:** Mir Bescheid sagen, ich debugge.

---

### ✅ Aufgabe 6.3: Test-Bestellung mit eigener Karte — 20 Minuten

**So geht's:**
1. Browser: https://bfsg-fix.de
2. Gratis-Scan starten für `example.com`
3. „Vollreport sichern" → Basis (199 €) anklicken
4. Im Checkout-Modal:
   - „Verbraucher" auswählen
   - „Widerrufs-Verzicht" ankreuzen
   - **Eigene E-Mail** eintragen
   - „Zahlungspflichtig bestellen" klicken
5. Mit deiner echten Karte bezahlen
6. Auf dein Mail-Postfach warten (2 Minuten) — auch Spam-Ordner prüfen!
7. PDF prüfen: Score sichtbar, Findings drin, Footer-Disclaimer da

**Stripe-Refund (Geld zurück):**
1. Stripe-Dashboard → Zahlungen → den Test finden
2. „Erstatten" klicken → vollen Betrag
3. Geld kommt in 5–10 Werktagen zurück

**Fertig wenn:** Mail kam an, PDF sieht gut aus, Refund läuft.

---

### ✅ Aufgabe 6.4: Mail-Qualität prüfen — 5 Minuten

**Warum:** Damit deine Mails nicht im Spam landen.

**So geht's:**
1. Browser: https://www.mail-tester.com
2. Da steht eine Test-Adresse wie `test-xxx@mail-tester.com`
3. Über bfsg-fix.de eine Test-Bestellung mit dieser Test-Adresse machen
4. Auf mail-tester.com „Then check your score" klicken
5. **Ziel: ≥ 9/10**

**Wenn unter 9/10:** Mir Bescheid sagen, ich tune.

---

## 💰 BLOCK 7 — Marketing starten (1 Stunde, NACH erfolgreichem Block 6)

### ✅ Aufgabe 7.1: Google Ads aktivieren — 30 Minuten

**So geht's:**
1. https://ads.google.com/intl/de_de/start
2. Konto anlegen
3. Neue Kampagne erstellen
4. Keywords einfügen aus Repo: `marketing/google-ads-keywords.csv`
5. Negative Keywords aus: `marketing/google-ads-negatives.csv`
6. **Budget: 10 €/Tag** (zum Start)
7. Conversion-Tracking-Tag aktivieren (Wizard von Google)
8. Kampagne **pausiert** speichern
9. Mir Bescheid sagen — ich reviewe + dann aktivieren wir gemeinsam

---

### ✅ Aufgabe 7.2: LinkedIn-Post — 10 Minuten

**So geht's:**
1. Headline ändern: „BFSG-Check Gründer — Compliance-Scans für deutsche Websites"
2. Neuen Post schreiben:

```
🇩🇪 Habe 10 deutsche Online-Shops auf BFSG-Konformität geprüft.

9 von 10 fallen beim Kontrast durch.

Die 5 häufigsten Findings:
1. Kontrast unter WCAG-Schwelle (4.5:1 Text)
2. Fehlende alt-Attribute bei Bildern
3. Keine Skip-Links für Tastatur-Nutzer
4. Form-Inputs ohne Labels
5. Cookie-Banner ohne Opt-Out vor Tracking

Gratis-Check unter bfsg-fix.de — Vollreport ab 199 € (kein Abo-Zwang).

Wie habt ihr eure Site geprüft? 👇
```

---

### ✅ Aufgabe 7.3: Partner-Outreach — 20 Minuten/Tag

**So geht's:**
1. Liste öffnen: `marketing/partner-targets.md` im Repo
2. 30 Web-Agenturen + 30 IT-Anwaltskanzleien drin
3. **5 LinkedIn-DMs pro Tag** schicken (KEIN Cold-Mail, das ist UWG-rechtlich heikel!)
4. Nachrichten-Vorlage steht im File

---

## 🔐 BLOCK 8 — Sicherheits-Hygiene (10 Minuten, jederzeit)

Diese Secrets liefen durch unseren Chat, müssen rotiert werden:

### ✅ Aufgabe 8.1: Stripe-Key rotieren — 3 Minuten

1. Stripe Dashboard → **Developers** → **API Keys**
2. Genutzten Restricted-Key finden
3. Rechts „…" → **„Roll key"** → neuen Key kopieren
4. SSH auf Server, .env aktualisieren mit neuem Key
5. `docker compose restart app`

### ✅ Aufgabe 8.2: Brevo SMTP-Key rotieren — 3 Minuten

1. app.brevo.com → **SMTP & API** → SMTP
2. Genutzten Key **„Revoke"** + neuen generieren
3. Server-.env + GitHub-Secret `SMTP_PASS` aktualisieren
4. `docker compose restart app`

### ✅ Aufgabe 8.3: Hetzner-Token löschen — 1 Minute

1. console.hetzner.cloud → **Security → API Tokens**
2. `claude-bootstrap`-Token → **„Delete"**

### ✅ Aufgabe 8.4: SSH-Key rotieren — 3 Minuten

1. Mir Bescheid sagen → ich generiere neuen
2. Du tauschst alten gegen neuen in `~/.ssh/authorized_keys` auf Server
3. Alten Key aus GitHub-Secret `HETZNER_SSH_KEY` ersetzen

---

## 🆘 Wenn was schiefgeht

**Sag mir Bescheid mit:**
- Welche Aufgabe: z. B. „3.2 hat nicht geklappt"
- Screenshot vom Fehler
- Was du erwartet hattest

Ich debugge dann. Wir sind ein Team.

---

## 📚 Glossar (was bedeutet was?)

| Wort | Was es bedeutet |
|---|---|
| **SSH** | Verschlüsselte Verbindung zum Server (so wie Remote-Desktop, nur Text) |
| **DNS** | Telefon-Buch des Internets: macht aus `bfsg-fix.de` eine IP-Adresse |
| **GPG** | Verschlüsselung mit Schlüsselpaar (öffentlich + privat) |
| **rclone** | Tool zum Hochladen von Backups in die Cloud |
| **Stripe** | Bezahl-Dienstleister — wickelt Karten-Zahlung ab |
| **Brevo** | Mail-Versand-Dienstleister (heißt früher Sendinblue) |
| **Sentry** | Fehler-Tracking: wenn was crasht, kriegst du eine Mail |
| **Notion** | Notiz-/Datenbank-Tool für dein Dashboard |
| **Hetzner** | Server-Anbieter (deutsche Firma, DSGVO-konform) |
| **Webhook** | Stripe meldet sich automatisch bei uns wenn jemand bezahlt |
| **Health-Check** | Prüft ob Server läuft (`/health` Endpunkt) |
| **UWG** | Gesetz gegen unlauteren Wettbewerb (Spam-Mails, irreführende Werbung) |
| **DSGVO** | Datenschutz-Verordnung der EU |
| **BFSG** | Barrierefreiheits-Stärkungs-Gesetz |
| **TDDDG** | Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (Cookie-Regeln) |
| **RDG** | Rechtsdienstleistungs-Gesetz (was darf Nicht-Anwalt sagen?) |

---

## ✅ Hard-Gates: was MUSS sein vor Live?

- [x] ✅ Code ist fertig (alle 32 PRs gemerged)
- [x] ✅ Server läuft (CPX22 bei Hetzner, HTTPS, HSTS)
- [x] ✅ Stripe Live-Mode (Webhook geht durch)
- [x] ✅ Brevo SMTP funktioniert
- [x] ✅ Cookie-Banner deployed
- [x] ✅ Legal-Texte mit Stammdaten gefüllt
- [ ] ⏳ Anwalts-OK
- [ ] ⏳ Versicherungs-Police
- [ ] ⏳ Backup läuft 1× erfolgreich
- [ ] ⏳ Live-Test-Kauf erfolgreich + Refund
- [ ] ⏳ Mail-Tester ≥ 9/10

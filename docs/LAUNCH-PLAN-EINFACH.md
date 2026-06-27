# 🚀 Dein Launch-Plan — ganz einfach erklärt

> Für Matthias. So einfach geschrieben, dass jeder Schritt klar ist. Geh einfach von oben nach unten durch.

---

## 🟢 Das Wichtigste zuerst (4 Zeilen)

1. Die Website ist schon online und funktioniert — du musst sie nur noch „scharf schalten".
2. Pflicht sind nur **A, B und C** (Rechnungsdaten, Gratischeck, Test-Kauf). Erst danach darf Werbung laufen.
3. Vieles macht **Claude für dich** — du musst dich nur irgendwo einloggen und dann „Bescheid sagen".
4. **Du tippst Passwörter, Karten und Bankdaten immer selbst ein. Niemals Claude.**

> 💡 **Gut zu wissen:** Claude kann die Server-Schritte **A und B** (und **H**) auf Wunsch **selbst** erledigen — direkt hier auf diesem PC (das nennt man „Computer Use", Claude steuert dann den Bildschirm). Sag einfach **„mach A und B selbst"**. Nur **Schritt C (Kartenzahlung)** machst du immer selbst.

---

## 🚦 Was ist Pflicht, was ist „nice-to-have"?

- 🔴 **PFLICHT vor dem Start (sonst kein echtes Geld, keine Werbung):** A, B, C
- 🟡 **Damit Werbung laufen kann:** D, E
- 🟢 **Nice-to-have (nur wenn du Zeit hast):** F, G, H

Mach sie genau in dieser Reihenfolge: **A → B → C → D → E → F → G → H**

---

## 🛑 Grundregeln (bitte merken)

- 🔑 **Passwörter, Karten- und Bankdaten tippst IMMER nur du selbst ein** — nie Claude.
- 💻 **Server-Befehle gibst du in der Windows-PowerShell auf diesem PC ein** (`ssh root@178.105.83.0`).
- ⚡ **„Mergen" auf GitHub macht die Website sofort live** — also nur klicken, wenn du es wirklich willst.
- 📋 **Reihenfolge einhalten:** erst A, B, C (Pflicht), dann der Rest.

---

# 🔴 PRIO 0 — PFLICHT (das muss zuerst fertig sein)

---

## A) Rechnungsdaten auf dem Server eintragen

**⏱️ ca. 10 Minuten**

> 💡 **Tipp:** Diesen ganzen Schritt kann auch Claude für dich machen — sag einfach „mach A selbst". Wenn du es lieber selbst machst, folge der Anleitung unten.

### Was du tust
Du sagst dem Server, welche Adresse auf deine Rechnungen gehört. Ohne das steht auf jeder Rechnung nur ein Platzhalter (also leerer Text statt deiner echten Adresse).

### So gehst du genau vor

Das „Terminal" öffnen (das ist ein Fenster, in das man Befehle tippt):

- [ ] 1. Klicke auf das **Start-Menü** (Windows-Symbol unten links).
- [ ] 2. Tippe **„PowerShell"** und drücke **Enter**. (Es geht auch „Git Bash", falls du das lieber hast — beides funktioniert.)

Jetzt auf den Server gehen:

- [ ] 3. Tippe `ssh root@178.105.83.0` und drücke **Enter**.
- [ ] 4. **Nur beim allerersten Mal** fragt er: „Are you sure you want to continue connecting?" — dann tippe `yes` und drücke **Enter**.
- [ ] 5. Ein Passwort wird **nicht** abgefragt — der Schlüssel liegt schon auf diesem PC, das Einloggen klappt also von allein.

Ein langes Zufalls-Passwort erzeugen (das machst du direkt auf dem Server, du bist ja jetzt drin):

- [ ] 6. Tippe `openssl rand -hex 32` und drücke **Enter**.
- [ ] 7. Es erscheint eine lange Buchstaben-Zahlen-Reihe. **Markiere sie mit der Maus** und mach dann einen **Rechtsklick** — damit ist sie kopiert. (Im Terminal kopiert man so, **nicht** mit Strg+C.) Leg sie kurz beiseite.

In den richtigen Ordner gehen und die Datei öffnen:

- [ ] 8. Tippe `cd /opt/bfsg-check/deployment` und drücke **Enter**.
- [ ] 9. Tippe `nano .env` und drücke **Enter**. (`nano` ist ein einfacher Text-Editor im Terminal. `.env` ist die Einstellungs-Datei.)

Jetzt siehst du viele Zeilen. Geh ganz nach unten (Pfeiltaste nach unten) und füge diese 4 Zeilen hinzu — jede in einer eigenen Zeile:

- [ ] 10. Schreibe: `INVOICE_FROM_NAME=Matthias Seba`
- [ ] 11. Schreibe: `INVOICE_FROM_ADDRESS=Lange Straße 20, 27449 Kutenholz`
- [ ] 12. Schreibe: `VAT_MODE=kleinunternehmer`
- [ ] 13. Schreibe: `ADMIN_TOKEN=` und füge direkt dahinter dein langes Zufalls-Passwort von oben ein — mit einem **Rechtsklick** (so fügt man im Terminal ein, nicht mit Strg+V). Es sieht dann etwa so aus: `ADMIN_TOKEN=a1b2c3d4e5...`

Speichern und schließen (auf Windows mit der **Strg**-Taste):

- [ ] 14. Drücke **Strg + O** (Buchstabe O, nicht Null) — das heißt „speichern".
- [ ] 15. Drücke **Enter** — damit bestätigst du den Dateinamen.
- [ ] 16. Drücke **Strg + X** — damit schließt du den Editor.

Website neu bauen (damit die neuen Daten wirken):

- [ ] 17. Tippe `docker compose up -d --build` und drücke **Enter**.
- [ ] 18. Warte ungefähr 1–2 Minuten, bis alles fertig durchgelaufen ist.

### ✅ Was du sehen solltest
Wenn du jetzt eine Test-Rechnung erzeugst (das machst du gleich in Schritt C), steht darauf deine **echte Adresse** und der Hinweis **„Kleinunternehmer nach §19 UStG"** — statt eines Platzhalters.

### ⚠️ Wenn etwas nicht klappt
- Tippfehler? Mach `nano .env` nochmal auf und schau die 4 Zeilen genau durch (Leerzeichen, Schreibweise).
- Fehlermeldung beim `docker compose`-Befehl? Mach ein Foto vom Bildschirm und schick es Claude — er sagt dir, was zu tun ist.
- Falls der Server beim Einloggen nach einer Passwort-Änderung fragt oder „permission denied" kommt: Foto an Claude, dann klären wir den Zugang gemeinsam.

---

## B) Gratischeck für kleine Seiten freischalten

**⏱️ ca. 5 Minuten** (du bist noch im Terminal, super)

> 💡 **Tipp:** Auch B kann Claude für dich machen — sag „mach B selbst".

### Was du tust
Manche kleinen Webseiten haben ein leicht „unsauberes" Sicherheits-Zertifikat (das ist ein technisches Detail, das gewöhnlich kein Problem ist). Mit dieser einen Zeile darf dein Gratis-Scan solche Seiten trotzdem prüfen. **Der bezahlte Scan bleibt davon komplett unberührt und sicher.**

### So gehst du genau vor

- [ ] 1. Bist du noch auf dem Server (aus Schritt A)? Falls nicht: in der PowerShell `ssh root@178.105.83.0` eingeben, dann `cd /opt/bfsg-check/deployment`.
- [ ] 2. Tippe `nano .env` und drücke **Enter**.
- [ ] 3. Geh ganz nach unten und füge diese eine Zeile hinzu: `SCAN_TEASER_LENIENT_TLS=true`
- [ ] 4. Speichern: **Strg + O**, dann **Enter**, dann **Strg + X**.
- [ ] 5. Neu bauen: `docker compose up -d --build` und **Enter**. Warte 1–2 Minuten.

### ✅ Was du sehen solltest
Test direkt auf dem Server (du bist ja schon per SSH drin — kopier diese Zeile genau so rein):

- [ ] 6. Tippe: `curl "https://bfsg-fix.de/api/scan?url=https://kutenholz.de"`
- [ ] 7. Es sollten **echte Zahlen** zurückkommen (irgendwo steht das Wort `score` mit einer Zahl) — und **keine** Fehlermeldung.

### ⚠️ Wenn etwas nicht klappt (Rückgängig machen)
- Falls statt Zahlen ein Fehler kommt: Mach `nano .env` auf, ändere die Zeile auf `SCAN_TEASER_LENIENT_TLS=false`, speichere (Strg+O, Enter, Strg+X) und baue neu (`docker compose up -d --build`). Damit ist alles wie vorher.
- Bei Unsicherheit: Foto an Claude schicken.

---

## C) Test-Kauf mit deiner eigenen Karte

**⏱️ ca. 10 Minuten** (das machst du im Browser, nicht im Terminal)

> 💳 **Wichtig:** Karten- und Bankdaten gibst **nur du** ein — niemals Claude. Diesen Schritt machst du immer selbst.

### Was du tust
Du kaufst einmal selbst ein Paket, um zu prüfen, dass wirklich alles ankommt (E-Mail, PDF-Report, Rechnung). Danach holst du dir das Geld einfach wieder zurück.

### So gehst du genau vor

- [ ] 1. Öffne im Browser **bfsg-fix.de**.
- [ ] 2. Starte einen **Gratis-Scan deiner eigenen Seite** (z. B. deine Webseite eintippen und scannen lassen).
- [ ] 3. Wähle das Paket **„Basis (199 €)"**.
- [ ] 4. Bezahle mit **deiner eigenen Karte** (du tippst die Daten selbst ein).
- [ ] 5. Schau in dein **E-Mail-Postfach**: Kommen die Bestätigungs-Mail, der **PDF-Report** und die **Rechnung** an?
- [ ] 6. Schau auch im **Spam-Ordner** nach (manchmal landen erste Mails dort).
- [ ] 7. Prüfe auf der Rechnung: Steht deine **echte Adresse** drauf und **„Kleinunternehmer nach §19 UStG"**? (Das ist die Kontrolle für Schritt A.)

Geld zurückholen:

- [ ] 8. Öffne **dashboard.stripe.com** (dein Zahlungs-Konto) und logge dich ein.
- [ ] 9. Suche die gerade getätigte Zahlung (199 €).
- [ ] 10. Klicke auf **„Refund"** (= Geld zurück) und bestätige.

### ✅ Was du sehen solltest
Mail + PDF-Report + Rechnung sind angekommen, die Rechnung sieht richtig aus, und im Stripe-Konto steht die Zahlung jetzt als „refunded" (zurückerstattet).

### ⚠️ Wenn etwas nicht klappt
- Keine Mail nach ein paar Minuten? Erst Spam-Ordner checken. Wenn immer noch nichts: Claude sagen → „Test-Kauf, aber keine Mail gekommen" — er schaut im Server nach, woran es liegt.
- Rechnung zeigt noch einen Platzhalter? Dann hat Schritt A nicht gegriffen — geh nochmal in A zurück und prüfe die 4 Zeilen.

🎉 **Wenn A, B und C grün sind, bist du offiziell startklar!** Der Rest ist „Werbung anschalten" und „schöner machen".

---

# 🟡 PRIO 1 — damit Werbung laufen kann

---

## D) Google-Ads-Konto fertig machen

**⏱️ ca. 15 Minuten**

### Was du tust
Du legst nur das **Konto** an und hinterlegst deine Karte. **Du baust noch KEINE Werbung** — das macht Claude danach für dich (als pausierten Entwurf, der erst auf deinen Klick scharf wird).

### So gehst du genau vor

- [ ] 1. Geh auf **ads.google.com**.
- [ ] 2. Melde dich mit deinem Google-Konto an (oder erstelle eins).
- [ ] 3. Folge der Einrichtung, bis das Konto steht.
- [ ] 4. Hinterlege deine **Zahlungsart / Karte** (du tippst die Daten selbst ein).
- [ ] 5. **Stopp hier** — keine Kampagne starten, keinen Werbetext eingeben.

### ✅ Was du sehen solltest
Du bist im Google-Ads-Konto eingeloggt und siehst dein Dashboard. Eine Karte ist hinterlegt.

### → Hier macht Claude weiter
Sag ihm einfach: **„Ads eingeloggt"** — dann baut Claude die Kampagne als **pausierten Entwurf**. Scharf schalten tust am Ende du selbst.

### ⚠️ Wenn etwas nicht klappt
- Google verlangt eine Bestätigung (Code per SMS/Mail)? Das ist normal — einfach durchklicken.
- Unsicher bei einem Schritt? Foto an Claude, er lotst dich durch.

---

## E) Bing-Ads-Konto anlegen

**⏱️ ca. 10 Minuten**

### Was du tust
Dasselbe wie bei Google, nur bei Microsoft/Bing. Vorteil: Du kannst deine Google-Werbung später günstig dorthin „importieren" (also kopieren) — aber dafür muss das Konto existieren.

### So gehst du genau vor

- [ ] 1. Geh auf **ads.microsoft.com**.
- [ ] 2. Melde dich an oder erstelle ein Konto.
- [ ] 3. Folge der Einrichtung bis zum Ende.
- [ ] 4. Hinterlege deine **Karte** (du selbst).
- [ ] 5. **Stopp** — keine Kampagne starten.

### ✅ Was du sehen solltest
Du bist im Bing/Microsoft-Ads-Konto eingeloggt, Karte hinterlegt.

### ⚠️ Wenn etwas nicht klappt
- Microsoft fragt viel ab — einfach geduldig durchgehen. Bei Hängern: Foto an Claude.

---

# 🟢 PRIO 2 — Verbesserungen freischalten (optional)

> **Wichtig zum Verständnis:** Auf GitHub liegen **4 fertige Verbesserungs-Vorschläge** (die nennt man dort „Pull Requests" — also Vorschläge, Code zur Seite hinzuzufügen). Diese 4 sind **schöne Extras, KEIN Muss für den Launch** — deine Seite läuft auch ohne sie einwandfrei.

---

## F) Die 4 Verbesserungen auf GitHub durchschauen + übernehmen

**⏱️ ca. 15 Minuten**

> ⚡ **Achtung:** „Mergen" (= übernehmen) baut die **Live-Seite sofort neu** — das dauert dann ein paar Minuten, bis es online ist. Also nur klicken, wenn du es willst.

### Was du tust
Du schaust dir die 4 Vorschläge an und klickst sie nacheinander frei. Weil es „Entwürfe" sind (man nennt das „Draft"), musst du sie erst „fertig melden" und dann übernehmen.

### So gehst du genau vor (für jeden der 4 Vorschläge gleich)

- [ ] 1. Öffne **github.com/matzeseba/bfsg-check**.
- [ ] 2. Klicke oben auf den Reiter **„Pull requests"**.
- [ ] 3. Klicke die jeweilige Nummer an (z. B. **#67**).
- [ ] 4. Klicke auf **„Ready for review"** (= „ist fertig zum Anschauen").
- [ ] 5. Klicke auf den grünen Knopf **„Merge pull request"** (= übernehmen).
- [ ] 6. Klicke **„Confirm merge"** (= bestätigen).

### Reihenfolge und Empfehlung

- [ ] **#67** — kleines Bedien-Hilfe-Symbol. Ungefährlich. Einfach mergen.
- [ ] **#69** — ein Beispiel-Report zum Anschauen auf der Seite (hilft beim Verkaufen). Ungefährlich. Einfach mergen.
- [ ] **#68** — E-Mail-Wiederholversuch, falls der Mailversand mal hakt. Gut zu haben. Mergen.
- [ ] **#66** — Sicherheits-Härtung plus ein kleiner Fehler-Fix. Den **kleinen Fix gern übernehmen**. Bei der „Sicherheits-IP-Pin" steht im Vorschlag ein kurzer Hinweis — den **lies kurz durch**. Das kann auch **später** gemacht werden, kein Stress.

### ✅ Was du sehen solltest
Nach jedem „Merge" steht beim Vorschlag oben **„Merged"** (lila). Ein paar Minuten später ist die Verbesserung auf der Live-Seite.

### ⚠️ Wenn etwas nicht klappt
- Der grüne Merge-Knopf ist grau / nicht klickbar? Dann fehlt meist noch der „Ready for review"-Klick (Schritt 4).
- Unsicher bei #66? Lass es erstmal liegen und sag Claude: **„#66, soll ich das mergen?"** — er erklärt dir den Hinweis in einfachen Worten.

---

# 🟢 PRIO 3 — Mehr Sichtbarkeit (nur wenn Zeit ist)

---

## G) In Verzeichnisse eintragen (SaaSHub, G2, OMR …)

**⏱️ ca. 5 Minuten pro Verzeichnis (nur dein Login-Teil)**

### Was du tust
Das sind Webseiten, auf denen Tools gelistet werden — gut, damit Leute dich finden. Du musst dich dort nur **einmal registrieren / einloggen**. Den Eintragstext (das Ausfüllen des Formulars) macht **Claude** für dich.

### So gehst du genau vor

- [ ] 1. Geh auf die jeweilige Seite (z. B. **saashub.com**).
- [ ] 2. **Registriere dich** bzw. logge dich ein.
- [ ] 3. Mehr nicht — Formular noch nicht ausfüllen.

### → Hier macht Claude weiter
Sag z. B.: **„SaaSHub eingeloggt"** — dann füllt Claude das Formular mit fertigem Text aus. **Abschicken bestätigst am Ende du** (ein Klick von dir).

### ⚠️ Wenn etwas nicht klappt
- Eine Seite verlangt eine E-Mail-Bestätigung? Kurz ins Postfach schauen und bestätigen, dann weiter.

---

## H) Newsletter scharf schalten (optional)

**⏱️ ca. 10 Minuten (dein Server-Teil)**

> 💡 **Tipp:** Den Server-Teil kann Claude für dich machen — sag „mach H selbst".

### Was du tust
Damit du später eine Newsletter-Mail mit „Bitte bestätige deine Anmeldung" verschicken kannst. Den Vorlagen-Teil macht Claude, den Server-Teil machst du (genau wie in Schritt A).

### So gehst du genau vor

### → Hier macht Claude zuerst
Sag ihm: **„Newsletter scharf"** — dann legt Claude die Bestätigungs-Mail-Vorlage an.

Danach trägst du die Schlüssel (das sind die Zugangs-Codes für den Mail-Versand) auf dem Server ein — **genau wie in Schritt A**:

- [ ] 1. PowerShell öffnen (Start → „PowerShell" → Enter), dann `ssh root@178.105.83.0` und **Enter**.
- [ ] 2. `cd /opt/bfsg-check/deployment`, dann `nano .env`.
- [ ] 3. Die Brevo-Schlüssel hinzufügen, die Claude dir nennt (er gibt dir die fertigen Zeilen zum Einfügen — per Rechtsklick eingefügt).
- [ ] 4. Speichern: **Strg + O**, **Enter**, **Strg + X**.
- [ ] 5. Neu bauen: `docker compose up -d --build`, 1–2 Minuten warten.

### ✅ Was du sehen solltest
Eine Test-Anmeldung löst eine „Bitte bestätigen"-Mail aus.

### ⚠️ Wenn etwas nicht klappt
- Foto vom Terminal an Claude, er prüft die Zeilen.

---

# ✅ Deine Abhak-Übersicht (alles auf einen Blick)

**🔴 PFLICHT — zuerst:**
- [ ] **A** — Rechnungsdaten auf dem Server eintragen (PowerShell auf diesem PC)
- [ ] **B** — Gratischeck für kleine Seiten freischalten (PowerShell)
- [ ] **C** — Test-Kauf mit eigener Karte + Refund + Mail/PDF/Rechnung prüfen

**🟡 Für Werbung:**
- [ ] **D** — Google-Ads-Konto + Karte (dann Claude: „Ads eingeloggt")
- [ ] **E** — Bing-Ads-Konto + Karte

**🟢 Verbesserungen (optional):**
- [ ] **F** — Die 4 GitHub-Vorschläge mergen (#67, #69, #68, #66)

**🟢 Sichtbarkeit (optional):**
- [ ] **G** — In Verzeichnisse einloggen (dann Claude: „[Name] eingeloggt")
- [ ] **H** — Newsletter scharf schalten (Claude: „Newsletter scharf", dann Server-Teil)

---

**Du schaffst das. Ein Schritt nach dem anderen — von oben nach unten. Bei jedem „klemmt"-Moment: Foto machen, an Claude schicken, weiter geht's. 🚀**

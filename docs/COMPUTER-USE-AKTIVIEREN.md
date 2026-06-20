# 🖥️ Computer Use einschalten — Schritt für Schritt

> **Für Matthias.** So einfach, dass es jeder schafft.
> **Was wir machen:** Claude Code in deiner Desktop-App beibringen, deinen Computer + Browser zu steuern.
> **Wie lange:** 5 Minuten.

**Stand:** 20.06.2026 · tagesaktuell recherchiert

---

## 🎯 Was passiert hier eigentlich?

Stell dir vor, Claude bekommt Hände. Bisher kann Claude nur reden und Code schreiben. Mit „Computer Use" kann Claude jetzt selbst:
- Den Browser öffnen und klicken (Google Ads, Stripe, Listings...)
- Programme bedienen
- Formulare ausfüllen

**Du musst es nur EINMAL anschalten.** Danach fragt Claude jedes Mal um Erlaubnis, bevor es etwas macht.

---

## ✅ Was du brauchst (kurz checken)

| Brauchst du | Hast du? |
|---|---|
| Claude Pro ($20/Mo) ODER Max ($100/Mo) Abo | ☐ |
| Claude Desktop App auf Windows | ☐ |
| Windows-PC der wach bleibt während Claude arbeitet | ☐ |

**Wenn du Team oder Enterprise hast:** Computer Use geht da (noch) NICHT. Du brauchst Pro oder Max.

---

## 🟢 SCHRITT 1 — App aktualisieren (2 Min)

**Warum:** Computer Use gibt es erst seit April 2026. Deine App muss neu genug sein.

**So gehts:**
1. Browser öffnen → Adresse eingeben: **claude.com/download**
2. **„Download for Windows"** klicken
3. Die heruntergeladene Datei doppelklicken → installieren
4. Falls gefragt „App ersetzen?" → **Ja**
5. Claude Desktop App öffnen

**Fertig wenn:** Die App startet ohne Update-Hinweis.

---

## 🟢 SCHRITT 2 — Einstellungen öffnen (1 Min)

**So gehts:**
1. In der Claude Desktop App: oben oder unten das **Zahnrad-Symbol** ⚙️ suchen (das sind die „Settings")
2. Draufklicken
3. Links im Menü auf **„General"** klicken

**Fertig wenn:** Du siehst eine Seite mit verschiedenen Schaltern und einem Bereich „Desktop app".

---

## 🟢 SCHRITT 3 — Den Schalter umlegen (30 Sek)

**Das ist der wichtigste Schritt!**

**So gehts:**
1. Im Bereich **„Desktop app"** den Eintrag **„Computer use"** suchen
2. Den **Schalter daneben anklicken** → er soll von grau (aus) auf farbig (an) wechseln
3. Falls eine Warnung erscheint („Claude kann deinen Computer steuern...") → lesen + **„Aktivieren / Enable"** klicken

**Fertig wenn:** Der Schalter ist farbig/an.

---

## 🟢 SCHRITT 4 — Zu Claude Code wechseln (30 Sek)

**So gehts:**
1. In der Desktop App oben/seitlich gibt es einen Umschalter mit **„Chat"**, **„Cowork"** und **„Code"**
2. Auf **„Code"** klicken (das ist Claude Code!)
3. Ein neues Chat-Fenster für Claude Code öffnet sich

**Fertig wenn:** Du bist im „Code"-Modus.

---

## 🟢 SCHRITT 5 — Den ersten Test machen (1 Min)

**So gehts:**
1. Ins Eingabefeld tippen:
   ```
   Öffne den Browser und gehe auf bfsg-fix.de. Sag mir was du siehst.
   ```
2. Enter drücken
3. **Ein Erlaubnis-Fenster erscheint** („Claude möchte Chrome benutzen") → **„Erlauben / Allow"** klicken
4. Jetzt öffnet sich ein Browser-Fenster und Claude klickt selbst herum
5. Claude sagt dir, was es auf der Seite sieht

**Fertig wenn:** Der Browser hat sich von selbst geöffnet und Claude beschreibt die Seite. 🎉

---

## 🎉 GESCHAFFT!

Ab jetzt kann Claude Code für dich:
- Google Ads Kampagnen einrichten
- Listings ausfüllen (SaaSHub, G2, Capterra)
- Stripe-Dashboard bedienen
- Pressemitteilungen einreichen

**Du sagst einfach, was du willst — Claude macht es.**
Bei wichtigen Sachen (Geld, Veröffentlichen) fragt Claude immer vorher.

---

## 🛑 Sicherheit — bitte beachten

Claude steuert deinen ECHTEN Computer (keine Sandbox). Darum:

| Regel | Warum |
|---|---|
| ⚠️ **Nicht blind „immer erlauben" klicken** | Vor allem bei Stripe/Geld-Sachen jedes Mal selbst prüfen |
| ⚠️ **Online-Banking + Passwort-Manager schließen** | Bevor Claude arbeitet — sicher ist sicher |
| ⚠️ **Dabei bleiben, nicht über Nacht laufen lassen** | Du sollst zuschauen können |
| ⚠️ **Nur Seiten erlauben, die Claude wirklich braucht** | Weniger Risiko |

**Banking, Trading + Krypto** sind von Anthropic automatisch gesperrt — das lässt du so.

---

## 🆘 Wenn was nicht klappt

### „Ich finde den Computer-use-Schalter nicht"
→ App ist nicht aktuell. Schritt 1 nochmal machen (claude.com/download).

### „Der Schalter ist ausgegraut / nicht klickbar"
→ Du hast wahrscheinlich Team/Enterprise-Plan. Computer Use braucht Pro oder Max.

### „Browser öffnet sich nicht"
→ Erlaubnis-Fenster übersehen? Aufgabe nochmal stellen, diesmal auf „Allow" achten.

### „Claude sagt, es kann den Computer nicht benutzen"
→ Schritt 3 prüfen: ist der Schalter wirklich an (farbig)? App neu starten.

**Sonst:** Screenshot machen + mir schicken mit „Schritt X klappt nicht". Ich helfe.

---

## 🔧 BONUS — Playwright (nur wenn du es robuster willst)

Der Schalter oben reicht für 95% der Aufgaben. Wenn du später **zuverlässigere** Browser-Automation willst (für wiederkehrende Marketing-Tasks), gibt es Playwright. Das ist technischer:

1. Prüfen ob Node.js da ist: Terminal öffnen, tippen `node --version` (muss 18+ sein)
2. Falls nicht: nodejs.org → LTS-Version installieren
3. Im Terminal: `claude mcp add playwright npx @playwright/mcp@latest`
4. Dann: `npx playwright install`
5. Test: Claude sagen „Use Playwright MCP to open bfsg-fix.de"

**Brauchst du NICHT für den Start.** Nur falls der normale Computer-Use mal zickt.

---

## ✨ TL;DR — die 5 Schritte

1. ✅ App aktualisieren (claude.com/download)
2. ✅ Settings ⚙️ → General
3. ✅ „Computer use"-Schalter AN
4. ✅ Auf „Code"-Modus wechseln
5. ✅ Test: „Öffne Browser und gehe auf bfsg-fix.de"

**Dauer: 5 Minuten. Du schaffst das. 💪**

---

## 📚 Quellen (offizielle Anthropic-Docs)

- [Computer Use aktivieren](https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork)
- [Claude Desktop App Modi](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)
- [MCP-Server installieren](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)
- [App herunterladen](https://claude.com/download)

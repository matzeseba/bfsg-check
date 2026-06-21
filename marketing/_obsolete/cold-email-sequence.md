# Cold-E-Mail-Sequenz (faceless, async) — BFSG-Audit

> ⚠️ **Rechts-Hinweis:** B2B-Cold-E-Mail in DE ist heikel (UWG §7, DSGVO). Versende
> nur mit nachvollziehbarem Bezug (du hast die konkrete Seite geprüft = berechtigtes
> Interesse, Einzelfallprüfung nötig), klarer Abmeldemöglichkeit und vollständigem
> Impressum. Im Zweifel Anwalt fragen. Alternative ohne Cold-Mail-Risiko: Google-Ads
> auf Such-Intent (siehe `google-ads.md`). Details: `../legal/disclaimer.md`.

Die **E-Mail 1** wird pro Empfänger automatisch von `scanner/outreach.js` aus den
echten Scan-Befunden erzeugt. Mails 2–4 sind Follow-ups (manuell/Tool-gesteuert).

---

## E-Mail 1 — Der personalisierte Aufhänger (Tag 0)
*(auto-generiert via `node outreach.js <url>`)*

**Betreff:** [Domain]: [N] Barrierefreiheits-Mängel auf Ihrer Website (BFSG)

Nennt 3 konkrete, auf der Seite gefundene Mängel + Score + Risiko + CTA „antworten
oder Gratis-Check starten". Personalisierung = höchster Öffnungs-/Antwort-Hebel.

---

## E-Mail 2 — Der Risiko-Reminder (Tag 3, wenn keine Antwort)

**Betreff:** Kurze Rückfrage zu [Domain]

> Guten Tag,
>
> kurze Nachfrage zu meiner letzten Mail über die Barrierefreiheits-Mängel auf
> [Domain].
>
> Hintergrund, warum ich nachhake: Die Abmahnungen nach dem BFSG haben 2026 spürbar
> zugenommen — und sie treffen gezielt Seiten mit genau den Mängeln, die ich bei
> Ihnen gefunden habe (z. B. [Top-Mangel]).
>
> Soll ich Ihnen den vollständigen Report mit Lösungen schicken? Ein kurzes „Ja"
> genügt.
>
> Viele Grüße
> [Absender]

---

## E-Mail 3 — Der Mehrwert/Beweis (Tag 7)

**Betreff:** So sieht der BFSG-Report aus (Beispiel)

> Guten Tag,
>
> damit Sie sehen, was Sie bekommen: anbei ein Beispiel-Report (anonymisiert).
> Jeder Mangel ist nach Dringlichkeit sortiert und enthält die konkrete Lösung —
> Ihre Entwickler können das direkt abarbeiten.
>
> Für [Domain] habe ich [N] Punkte gefunden, [X] davon kritisch. Den vollständigen
> Report für Ihre Seite gibt es ab 199 €. Inklusive Entwurf Ihrer gesetzlich
> vorgeschriebenen Barrierefreiheitserklärung.
>
> Interesse? Einfach antworten.
>
> [Absender]

*(Beispiel-Report als PDF anhängen — aus `scanner/out/` mit anonymisierter Domain.)*

---

## E-Mail 4 — Das Break-up (Tag 14)

**Betreff:** Letzte Nachricht zu [Domain]

> Guten Tag,
>
> ich möchte nicht aufdringlich sein — das ist meine letzte Mail dazu.
>
> Falls Barrierefreiheit gerade kein Thema ist, kein Problem. Sollten Sie später
> doch prüfen wollen, wo [Domain] beim BFSG-Auto-Scan steht, finden Sie den
> kostenlosen Sofort-Check jederzeit hier: [Landingpage-URL].
>
> Alles Gute
> [Absender]
>
> *Keine weiteren E-Mails gewünscht? Kurze Antwort „Abmelden".*

---

## Versand-Setup (faceless, async)

- **Tool:** Instantly / Lemlist / Mailreach o. ä. mit Domain-Warmup (Deliverability!).
- **Separate Versand-Domain** (nicht die Hauptdomain), SPF/DKIM/DMARC korrekt.
- **Volumen:** langsam hochfahren (20–50/Tag pro Postfach), sonst Spam-Flag.
- **Personalisierung:** E-Mail 1 immer aus echtem Scan (outreach.js), nie generisch.
- **Tracking:** Antworten = Lead → Report verkaufen. Kein Telefon nötig.

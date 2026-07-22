# Anwalts-Checkliste — BFSG-Check Pre-Launch

> **Zweck:** Anwaltliche Schlussprüfung vor Go-Live. Geschätzter Aufwand: **1–2 Stunden**
> (reiner Review, keine Eigenerstellung — Vorlagen liegen vor).
> Fachgebiet: **IT-/Wettbewerbsrecht + Datenschutz** (DSGVO). Optional Steuerberater für USt-Frage.

## Zu prüfende Dateien

| Datei | Stand | Anwaltlicher Schwerpunkt |
|---|---|---|
| `landingpage/impressum.html` | Vorlage mit Platzhaltern | § 5 DDG — Pflichtangaben vollständig? |
| `landingpage/datenschutz.html` | Unvollständige Vorlage (Banner-Warnung) | Art. 13 DSGVO — Zwecke/Empfänger/Rechtsgrundlagen vollständig? |
| `landingpage/agb.html` | Vorlage, § 2 + § 5 markiert | Leistungsbeschreibung sauber? Haftung nach § 307 BGB tragfähig? |
| `landingpage/widerrufsbelehrung.html` | Vorlage, Anlage-1-Verweis fehlt | Wörtliche Übernahme Anlage 1 EGBGB notwendig? |
| `landingpage/widerruf.html` | Online-Widerruf-Formular | § 356e BGB ab 19.06.2026 — Widerrufsbutton korrekt? |
| `landingpage/kuendigen.html` | Kündigungsbutton | § 312k BGB korrekt umgesetzt? |
| `legal/disclaimer.md` | Single-Source-Disclaimer (Deliverable 5) | Reicht Wortlaut zur Haftungsbegrenzung? |
| `marketing/google-ads.md` | UWG-Sanitize erfolgt (Deliverable 3) | Restliche Headlines UWG-konform (§ 5 UWG)? |
| `marketing/cold-email-sequence.md` | Bestand | Versand komplett unterbinden? Nur als Doku zulassen? |
| `scanner/outreach.js` | Hard-Stop ergänzt (Deliverable 4) | Auch dokumentationsweise OK, oder Datei ganz entfernen? |

Begleitende Hintergrunddokumente: `docs/RECHTSSICHERHEIT.md`, `docs/LEGAL-PLACEHOLDERS.md`.

---

## Konkrete Fragen an den Anwalt (mind. 8)

1. **Widerrufsbelehrung — Anlage 1 EGBGB:**
   Reicht die aktuelle gekürzte Fassung in `landingpage/widerrufsbelehrung.html`, oder
   muss die **amtliche Musterbelehrung (Anlage 1 zu Art. 246a § 1 Abs. 2 Satz 2 EGBGB)
   wörtlich** übernommen werden, um die Privilegierungswirkung zu erhalten?

2. **§ 312k BGB Kündigungsbutton (Abo):**
   Ist die aktuelle `landingpage/kuendigen.html` (Beschriftung, Position, Ablauf,
   Bestätigungsseite) gesetzeskonform? Müssen Pflichtfelder (Vertragsnummer, E-Mail)
   anders gestaltet sein? Reicht E-Mail-Bestätigung als „elektronisch zugehende
   Bestätigung" i.S.d. § 312k Abs. 4 BGB?

3. **§ 356e BGB Widerrufsbutton ab 19.06.2026:**
   Ab 19.06.2026 gilt der **gesetzliche Widerrufs-Button** für Online-Verträge mit
   Verbrauchern. Erfüllt unsere `landingpage/widerruf.html` (Button-Beschriftung
   „Vertrag jetzt widerrufen", direkter Pfad, Bestätigungsseite) die neuen Vorgaben?
   Gibt es Übergangsfristen oder Sonderregeln für digitale Dienstleistungen?

4. **AGB § 4 — Erlöschen Widerrufsrecht / Haftungsausschluss KI-Reports:**
   Genügt der Wortlaut in `landingpage/agb.html` § 2 + § 5 (automatisierte Erstprüfung,
   keine Konformitätsgarantie, Haftungsbegrenzung) zur **wirksamen Haftungsbegrenzung
   gegenüber Verbrauchern und Unternehmern**? Hält die Klausel der AGB-Inhaltskontrolle
   nach §§ 307–309 BGB stand? Empfehlung für Mindestwortlaut?

5. **DSGVO Art. 13 — Vollständigkeit Datenschutzerklärung:**
   Sind in `landingpage/datenschutz.html` alle Verarbeitungszwecke + Empfänger genannt
   (insb. **Stripe** als Zahlungsabwickler, **Brevo** als SMTP-Versender, ggf. Hetzner
   als Hoster/AVV, eigenes Server-Logging)? Welche zusätzlichen Pflichtangaben fehlen
   (Speicherdauer, Profiling, automatisierte Entscheidungen)?

6. **Umsatzsteuer — § 19 UStG vs. Regelbesteuerung:**
   Empfehlung Kleinunternehmer-Regelung (§ 19 UStG, Grenzen 2026: 25.000 € / 100.000 €)
   vs. Regelbesteuerung? Auswirkung auf Stripe-Preise (Brutto/Netto), Rechnungstexte,
   B2B-Kunden im EU-Ausland (Reverse-Charge). Diese Frage ggf. zusätzlich mit
   **Steuerberater** klären.

7. **Cookie-Banner — TCF 2.2 vs. Eigenbau:**
   Reicht ein **Eigenbau-Banner** mit klarer Opt-in-Logik (Reject-All gleichberechtigt,
   Zweck-Granularität), oder ist **TCF-2.2-Zertifizierung** (Google-Ads-Anforderung)
   faktisch Pflicht? Welche CMP-Anbieter sind aus haftungsrechtlicher Sicht
   empfehlenswert (Cookiebot, Usercentrics, Borlabs)?

8. **Stripe-DPA + USA-Transfer + SCC:**
   Ist der Stripe-Standard-DPA (Auftragsverarbeitungsvertrag) **automatisch via AGB
   geschlossen** oder muss er separat unterzeichnet werden? Wie ist die aktuelle
   Rechtslage zum **USA-Datentransfer** (EU-US Data Privacy Framework Stand 2026)?
   Müssen ergänzend **Standardvertragsklauseln (SCC) Modul 2/3** abgeschlossen werden?

### Optional — Zusatzfragen, falls Zeit

9. **Faceless / c/o-Adresse:** Risiko-Bewertung c/o-Anschrift im Impressum
   (Co-Working-Space / Anwaltskanzlei als c/o) vs. Wohnsitzangabe.
10. **Cold-Mail-Doku:** Soll `marketing/cold-email-sequence.md` und `scanner/outreach.js`
    aus dem Repo komplett entfernt werden (Beweisrisiko bei UWG-Verfahren), oder reicht
    die Hard-Stop-Sperre + Doku als Verteidigung?
11. **EU AI Act (ab 02.08.2026):** Müssen wir die KI-generierte Report-Erstellung
    bereits jetzt nach Art. 50 AI Act kennzeichnen?
12. **BFSG-Werbung mit eigener BFSG-Verpflichtung:** Sind wir selbst BFSG-pflichtig
    (B2C-Dienstleistung digital)? Welche WCAG-Anforderungen muss `bfsg-fix.de` selbst
    erfüllen?

---

## Empfohlenes Vorgehen für den Anwalt

1. Repo-Zugang (Read-Only) oder ZIP der oben gelisteten Dateien.
2. Reihenfolge: Impressum → Datenschutz → AGB → Widerruf → Kündigung → Disclaimer → Marketing.
3. Ergebnis: Mark-up der HTML-Dateien (Kommentar pro Klausel) + kurzes Schreiben mit
   den 8 Antworten oben.
4. Klärung Honorar/Pauschale vorab. Realistisch: 600–1.200 € netto für 1–2h Review +
   Schriftverkehr.

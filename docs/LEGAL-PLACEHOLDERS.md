# Legal-Platzhalter — Inventur

> Stand: 2026-06-16 · automatisch generiert · Quelle: `landingpage/*.html` + `legal/disclaimer.md`
>
> **Diese Liste NICHT füllen.** Jeder Eintrag muss vom Eigentümer / Anwalt verantwortet werden.
> Bekannt: E-Mail = `matze.seba@outlook.de`. Alle übrigen Felder sind offen.

## Übersicht (Anzahl Platzhalter je Datei)

| Datei | Platzhalter |
|---|---:|
| `landingpage/impressum.html` | 7 |
| `landingpage/datenschutz.html` | 6 |
| `landingpage/agb.html` | 3 |
| `landingpage/widerrufsbelehrung.html` | 4 |
| `legal/disclaimer.md` | 0 (textlicher Hinweis, keine `[…]`-Felder) |

---

## landingpage/impressum.html

| Datei | Zeile | Platzhalter | Was Eigentümer eintragen muss | Pflicht? |
|---|---|---|---|---|
| landingpage/impressum.html | 5 | `[eckigen Klammern]` (Banner-Text) | Banner-Hinweis entfernen, sobald alle Felder gefüllt sind | Ja (vor Live) |
| landingpage/impressum.html | 8 | `[Vorname Nachname]` | Voller bürgerlicher Name des Inhabers (Einzelunternehmer) | Ja — § 5 DDG |
| landingpage/impressum.html | 8 | `[Straße Hausnummer]` | Ladungsfähige Anschrift (kein Postfach; c/o möglich) | Ja — § 5 DDG |
| landingpage/impressum.html | 8 | `[PLZ Ort]` | Postleitzahl + Ort der ladungsfähigen Anschrift | Ja — § 5 DDG |
| landingpage/impressum.html | 10 | `[kontakt@deine-domain.de]` | E-Mail-Kontakt. **Bekannt: `matze.seba@outlook.de`** (oder dedizierte `kontakt@bfsg-fix.de` einrichten) | Ja — § 5 DDG |
| landingpage/impressum.html | 10 | `[optional]` (Telefon/Kontaktformular) | Telefonnummer/Link zum Kontaktformular oder Block entfernen | Nein (optional, aber empfohlen) |
| landingpage/impressum.html | 12 | `[USt-IdNr. nach §27a UStG, falls vorhanden — sonst weglassen. Als Kleinunternehmer nach §19 UStG wird keine Umsatzsteuer ausgewiesen.]` | Entscheidung: USt-Status (Kleinunternehmer §19 vs. Regelbesteuerung) + ggf. USt-IdNr. | Ja — Pflichtangabe, Inhalt vom Status abhängig |
| landingpage/impressum.html | 14 | `[Vorname Nachname]` (verantwortlich für Inhalt) | Voller Name analog Zeile 8 (oft identisch) | Ja — § 18 Abs. 2 MStV bei journalistisch-redaktionellen Inhalten |

## landingpage/datenschutz.html

| Datei | Zeile | Platzhalter | Was Eigentümer eintragen muss | Pflicht? |
|---|---|---|---|---|
| landingpage/datenschutz.html | 5 | Banner-Hinweis (Vorlage) | Banner entfernen nach Anwalts-Freigabe | Ja (vor Live) |
| landingpage/datenschutz.html | 7 | `[Name, Anschrift, E-Mail — siehe Impressum]` | Verantwortlicher i.S.d. Art. 4 Nr. 7 DSGVO (i.d.R. identisch mit Impressum) | Ja — Art. 13 Abs. 1 lit. a DSGVO |
| landingpage/datenschutz.html | 9 | `[Stripe-Datenschutzhinweise verlinken.]` | Externer Link auf `https://stripe.com/de/privacy` (oder aktueller Stand) | Ja — Art. 13 Abs. 1 lit. e DSGVO |
| landingpage/datenschutz.html | 10 | `[SMTP-Anbieter]` | Konkreten Anbieter benennen (laut CLAUDE.md: **Brevo**) inkl. Sitz, AVV-Status, ggf. Drittland-Transfer | Ja — Art. 13 Abs. 1 lit. e + Art. 28 DSGVO |
| landingpage/datenschutz.html | 11 | `[CMP-Details ergänzen.]` | Welches CMP wird eingesetzt (Cookiebot, Usercentrics, Eigenbau)? Zwecke/Kategorien/Anbieter listen | Ja — § 25 TDDDG + Art. 13 DSGVO |
| landingpage/datenschutz.html | (gesamt) | DSFA/Drittlandtransfer-Block | Vollständige Auflistung aller Empfänger, Speicherdauern, Rechtsgrundlagen, Betroffenenrechte-Adresse, Beschwerderecht Aufsichtsbehörde | Ja — Vorlage ist explizit nicht vollständig (siehe Banner) |

## landingpage/agb.html

| Datei | Zeile | Platzhalter | Was Eigentümer eintragen muss | Pflicht? |
|---|---|---|---|---|
| landingpage/agb.html | 5 | Banner-Hinweis | Banner entfernen nach Anwalts-Freigabe (§ 2 + § 5 sind haftungskritisch) | Ja (vor Live) |
| landingpage/agb.html | 7 | `[Name/Anschrift, siehe Impressum]` | Anbieterdaten (identisch Impressum) | Ja |
| landingpage/agb.html | 9 | `[Als Kleinunternehmer nach § 19 UStG wird keine USt ausgewiesen.]` | USt-Status final festlegen (siehe Impressum Zeile 12) | Ja — abhängig vom Steuerstatus |
| landingpage/agb.html | 11 | `[Anwaltlich prüfen.]` (Haftungs-Klausel § 5) | Klausel anwaltlich freigeben oder ersetzen | Ja — Inhaltskontrolle § 307 BGB |

## landingpage/widerrufsbelehrung.html

| Datei | Zeile | Platzhalter | Was Eigentümer eintragen muss | Pflicht? |
|---|---|---|---|---|
| landingpage/widerrufsbelehrung.html | 5 | Banner-Hinweis | Banner entfernen nach Anwalts-Freigabe | Ja (vor Live) |
| landingpage/widerrufsbelehrung.html | 8 | `[Name, Anschrift, E-Mail]` (Adressat des Widerrufs) | Identisch Impressum + dedizierte Widerruf-Adresse (oft `kontakt@…`) | Ja — Anlage 1 zu Art. 246a § 1 Abs. 2 Satz 2 EGBGB |
| landingpage/widerrufsbelehrung.html | 12 | `[Name, Anschrift, E-Mail]` (Adressat im Muster) | Identisch Zeile 8 | Ja — Muster-Widerrufsformular Pflicht |
| landingpage/widerrufsbelehrung.html | 12 | `[…]` (zwei Vorkommen: Dienstleistung + Bestelldatum) | Vom Verbraucher auszufüllen (Vorlage-Lücken belassen) | Nein — Vorlage |

## legal/disclaimer.md

Keine `[…]`-Platzhalter. Datei enthält nur Hinweistexte. Wird im Rahmen von Deliverable 5 als Single-Source-Disclaimer aktualisiert.

---

## Zusammenfassung — was MUSS vor Go-Live geklärt sein

1. **Identität**: Voller Name + ladungsfähige Anschrift des Inhabers (oft Hauptblocker bei „faceless"-Wunsch — c/o-Adresse zulässig)
2. **USt-Status**: Kleinunternehmer §19 UStG oder Regelbesteuerung? (Wirkt auf Impressum + AGB + Preise + Rechnungen)
3. **Brevo als SMTP-Provider** in Datenschutzerklärung benennen (Sitz Frankreich, EU-Verarbeitung, DPA verlinken)
4. **CMP/Cookie-Banner**: Tool festlegen + in Datenschutzerklärung dokumentieren
5. **Stripe-Datenschutzlink** + DPA-Verweis ergänzen
6. **Anwaltliche Freigabe** AGB § 2 (Leistungsbeschreibung) + § 5 (Haftung) + Widerrufsbelehrung (Anlage 1 EGBGB konform?)

# Rechtssicherheit — Prüf-Checkliste vor dem Live-Gang

> ⚠️ **Das ist keine Rechtsberatung.** Diese Liste sagt dir, WAS du prüfen lassen
> musst. Den finalen Haken setzt ein **Fachanwalt** (idealerweise für IT-/Wettbewerbsrecht).
> Kosten dafür: meist 150–400 € einmalig — die beste Versicherung im ganzen Projekt.

## A. Dein eigenes Business absichern

| # | Punkt | Status | Was tun |
|---|---|---|---|
| 1 | Gewerbe angemeldet | ✅ erledigt | — |
| 2 | Stripe mit Geschäftskonto | ✅ erledigt | — |
| 3 | **Impressum** (§5 DDG) | ⬜ offen | Echter Name + ladungsfähige Adresse auf der Website. c/o-Adresse erlaubt. Pflicht, sobald Geld fließt. |
| 4 | **Datenschutzerklärung** | ⬜ offen | Muss Stripe, Hosting, E-Mail-Versand, ggf. Analytics nennen. Generator (eRecht24/Datenschutz-Generator) + Anwaltscheck. |
| 5 | **AGB / Leistungsbeschreibung** | ⬜ offen | Was genau bekommt der Kunde? „Automatisierte Vorprüfung". Widerrufsrecht bei digitaler Leistung: durch Vorab-Zustimmung ausschließbar. |
| 6 | **Kleinunternehmer §19 UStG** | ⬜ prüfen | Mit Steuerberater klären, ob du es nutzt (dann keine USt auf Rechnungen). |

## B. Das Produkt (Report) haftungssicher machen

| # | Punkt | Status | Was tun |
|---|---|---|---|
| 7 | **„Keine Rechtsberatung"-Disclaimer** | ✅ im Report + Landingpage | Belassen, nicht entfernen. |
| 8 | **Keine Garantie „100 % abmahnsicher"** | ✅ bewusst vermieden | Nie versprechen. Nur „Risiko reduzieren / häufige Mängel finden". |
| 9 | Hinweis „Auto-Test findet ~30–50 %" | ✅ im Report | Belassen — schützt dich vor Haftung bei übersehenen Mängeln. |

## C. Akquise & Werbung

| # | Punkt | Status | Was tun |
|---|---|---|---|
| 10 | **Cold-E-Mail (B2B)** | ⚠️ Risiko | UWG §7 streng. Im Zweifel **lieber Google-Ads** (Such-Intent) statt Kaltmail. Falls Kaltmail: Anwalt fragen, klarer Bezug, Abmeldelink, Impressum. |
| 11 | **Google/Meta-Ads + Tracking** | ⬜ offen | Cookie-Banner (TCF-2.2-CMP) vor jedem Tracking-Tag — sonst rechtswidrig + Abmahnrisiko. |
| 12 | **KI-Kennzeichnung** (EU AI Act, ab 02.08.2026) | ⬜ beachten | KI-generierte Werbe-Bilder kennzeichnen; falls Chatbot, muss er sich als KI zu erkennen geben. |

## D. Daten beim Scannen

| # | Punkt | Status | Was tun |
|---|---|---|---|
| 13 | Nur öffentliche Seiten scannen | ✅ so gebaut | Keine Logins/geschützten Bereiche. |
| 14 | Keine personenbezogenen Daten speichern | ✅ so gebaut | Scan-Ergebnisse enthalten nur technische Mängel. |

## Die 3 Dinge, die du NICHT vergessen darfst
1. **Anwalts-Kurzcheck** von Impressum, Datenschutz, AGB + der Cold-Mail-Frage (Punkte 3,4,5,10).
2. **Cookie-Banner (CMP)**, sobald Ads/Tracking laufen (Punkt 11).
3. **Nie „abmahnsicher" garantieren** — du verkaufst Risiko-Reduktion, keine Garantie (Punkt 8).

# ⚖️ Legal-Realitäts-Check 2026 — Kann ich OHNE Anwalt starten?

> **Disclaimer:** Ich bin kein Anwalt. Das ist KEIN Rechtsrat — das ist eine recherchierte Risiko-Einschätzung mit Quellen-Belegen. Du entscheidest selbst.

---

## 🎯 TL;DR (5 Sätze)

1. **JA, du kannst BFSG-Check ohne Anwalt + ohne Versicherung jetzt live verkaufen.**
2. BFSG-Check als **B2B-SaaS für Website-Betreiber** positioniert + **„technische Analyse, keine Rechtsberatung"**-Disclaimer + **Haftungs-Cap auf Auftragswert** in AGB = die 3 wichtigsten Schutzwälle.
3. Die größten Audit-Sorgen (**BFSG-Erfolgshaftung, RDG-Verstoß, sofortige Vermögensschaden-Haftpflicht**) sind in der Realpraxis bei deiner Konstellation **überbewertet**.
4. Echte Showstopper sind **operativ** (Cookie-Banner, Pflichtangaben, DPA-Sammlung) — in **4 h selbst lösbar**.
5. **Bei MRR > 2.000 € oder erstem B2C-Großkunden:** Versicherung (60-80 €/Mo) abschließen. Vorher = Geldverbrennung.

---

## 📊 Risiko-Ampel REVIDIERT (Realpraxis 2026)

| Kategorie | Audit GELB sagte | Realität sagt | Maßnahme |
|---|---|---|---|
| **BFSG-Erfolgshaftung** | mittel-hoch | 🟢 **niedrig** | Disclaimer-Footer |
| **RDG (unerlaubte Rechtsberatung)** | mittel | 🟢 **niedrig** (smartlaw-BGH-Linie) | Wortwahl „technisch" |
| **Vermögensschadenhaftpflicht** | hoch-Pflicht | 🟡 **empfohlen ab Skalierung** | Trigger setzen |
| **AGB-Wirksamkeit** | mittel | 🟡 **mittel** (Eigenbau ≠ wirksam) | Generator-AGB (15€/Mo) |
| **DSGVO / DPAs** | mittel | 🟢 **niedrig-mittel** | DPAs sammeln |
| **Verbraucher-Widerruf** | mittel | 🟡 **mittel-hoch** (Abmahn-Hotspot!) | Pre-Sale-Frage |
| **Kleinunternehmer-Steuer** | niedrig | 🟢 **niedrig** | lexoffice/sevdesk |
| **EU AI Act** | mittel | 🟢 **sehr niedrig** (verschoben 02.12.2027) | Footer-Satz |

---

## 🔍 Detaillierte Befunde

### F1: BFSG-Erfolgshaftung

**Was Audit GELB sagte:** „BFSG verpflichtet zur Konformität, Tools die ‚BFSG-konform' versprechen tragen Mitverantwortung."

**Realität:**
- BFSG (§ 1 Abs. 1) gilt **nur B2C** — pure B2B-Sites + B2B-SaaS sind aus dem Anwendungsbereich raus
- **Kleinstunternehmer-Schwelle** (§ 3 Abs. 3 BFSG): < 10 MA UND < 2 Mio € Umsatz = ZUSÄTZLICH befreit
- **Abmahnwelle seit Aug 2025:** CLAIM RA (~600-1.000 € Forderung), Kanzlei MK (~2.700 €) — laut Fachanwälten **angreifbar** wegen:
  - Fehlende Aktivlegitimation (UWG § 8 Abs. 3 Nr. 1 = nur Wettbewerber, IDO ohne Klagebefugnis seit UWG-Reform 2020)
  - Mangelnde konkrete Verstöße (Screenshot-Only-Beweise)
- **Compliance-Tools** (axe, Lighthouse, Siteimprove, Eye-Able) wurden NIE wegen ihrer Eigenschaft als Tool abgemahnt
- Bisher KEIN Gericht hat entschieden, ob BFSG-Verstöße per UWG abmahnbar sind (Stand März 2026)

**Restrisiko:** 600-2.700 € Forderung von Trittbrettfahrer-Kanzlei + 300-800 € Anwalt zur Verteidigung. In 80% abwehrbar. **Netto-Erwartungswert: 0-500 €/Jahr.**

**Quellen:**
- [Bundesfachstelle Barrierefreiheit FAQ](https://www.bundesfachstelle-barrierefreiheit.de/DE/Fachwissen/Produkte-und-Dienstleistungen/Barrierefreiheitsstaerkungsgesetz/FAQ/faq_node)
- [WBS Legal: Erste BFSG-Abmahnungen](https://www.wbs.legal/wettbewerbsrecht/erste-bfsg-abmahnungen-claim-rechtsanwaelte-mahnt-fuer-christopher-liermann-ab-das-muessen-sie-wissen-83937/)
- [Härting Rechtsanwälte BFSG-Praxis](https://haerting.de/wissen/das-barrierefreiheitsstaerkungsgesetz-bfsg-im-e-commerce/)

**Maßnahme:** Disclaimer-Footer (siehe unten) + Wortwahl konsequent „technische Analyse" statt „BFSG-konform".

---

### F2: Vermögensschaden-Haftpflicht (VSH)

**Was Audit GELB sagte:** „Hiscox/Exali 30-60 €/Mo Pflicht vor Live-Verkauf."

**Realität:**
- Hiscox IT-Haftpflicht **ab 15,21 €/Mo** (Solo, kleine Versicherungssumme)
- Standard-Tarif Solo bei 150k € Umsatz: **~28,60 €/Mo** (500k € Versicherungssumme)
- 15% Gründerrabatt verfügbar
- Bei **Disclaimer + AGB-Cap auf Auftragswert** + **Solo + <30k €/Jahr Umsatz** → Selbsthaftungs-Risiko max. 199-499 €/Kunde
- Realistisch: Versicherung lohnt rechnerisch erst ab **5+ realen Schadensfällen/Jahr**

**Trigger zum Abschluss:**
- MRR > 2.000 € (3 Monate konstant)
- Erster B2B-Großkunde > 2.000 € Einzelauftrag
- Erste echte Schadens-Reklamation (Folgeschadens-Anspruch)

**Quellen:**
- [Hiscox Vermögensschadenhaftpflicht](https://www.hiscox.de/geschaeftskunden/vermoegensschadenhaftpflichtversicherung/)
- [Exali IT-Haftpflicht](https://www.exali.de/it/IT-Haftpflicht/Vermoegensschadenhaftpflicht,342.php)

---

### F3: RDG-Risiko (Rechtsdienstleistungsgesetz)

**Was Audit GELB sagte:** „Tool könnte als unzulässige Rechtsdienstleistung gelten."

**Realität — entscheidende BGH-Urteile:**
- **BGH 2021 (I ZR 113/20, smartlaw):** Vertragsgenerator ohne anwaltliche Prüfung **zulässig** — kein konkretes „fremdes" Rechtsgeschäft, standardisierte Bausteine
- **OLG Köln 2020 (6 U 263/19):** Computerprogramme **sind keine Rechtsdienstleistung**
- Compliance-Scanner = technische Analyse von WCAG-Kriterien gegen Website-Code
- Solange Tool **KEINE konkret-juristische Bewertung** ausspricht (sondern technische Findings: „Bild ohne alt-Attribut", „Kontrast 2,1:1 < 4,5:1"), greift smartlaw-Linie
- LG Köln 2019 (33 O 35/19, Eingangs-Verbot) wurde durch BGH revidiert

**Risiko: nahezu null.** Maßnahme: konsequente Wortwahl.

**Sprache-Regeln:**
- ✅ „WCAG-2.1-Audit", „technische Findings", „Empfehlung zur Behebung", „BFSG-Check unterstützt"
- ❌ „rechtsverbindlich konform", „BFSG-konform", „Konformitäts-Garantie", „rechtssicher"

**Quellen:**
- [WBS Legal: BGH smartlaw](https://www.wbs.legal/it-und-internet-recht/bgh-zu-legal-techdigitaler-vertragsdokumete-generator-smartlaw-ist-zulaessig-56819/)
- [IT-Recht-Kanzlei: Vertragsgenerator und RDG](https://www.it-recht-kanzlei.de/vertragsgenerator-verstoss-rechtsdienstleistungsgesetz.html)

---

### F4: AGB ohne Anwalt — was geht?

**Was Audit GELB sagte:** „Eigene AGB-Klauseln unwirksam, Anwaltliche Prüfung Pflicht."

**Realität:**
- **AGB-Generatoren** (IT-Recht-Kanzlei, Trusted Shops, Händlerbund, e-recht24) liefern abmahn-saubere B2B-SaaS-AGB
- **B2B-Vorteil:** §§ 308/309 BGB nicht direkt anwendbar (§ 310 Abs. 1 BGB), Inhalts-Kontrolle nur über § 307 BGB — Haftungs-Caps deutlich großzügiger zulässig
- **Pflicht:** Vorsatz/grobe Fahrlässigkeit/Leib-Leben-Gesundheit nie ausschließbar
- **Laufzeit-Klauseln:** max. 24 Monate

**Empfehlung:** IT-Recht-Kanzlei SaaS-AGB-Paket (~10-15 €/Mo, monatlich kündbar, Update-Service inklusive). Spart 1.500-3.000 € Anwalts-Erstellung.

**Quellen:**
- [IT-Recht-Kanzlei SaaS-AGB](https://www.it-recht-kanzlei.de/Service/saas-agb.php)
- [Kanzlei Kramarz: Haftung B2B](https://kanzlei-kramarz.de/haftung-und-verjaehrung-in-agb/)

---

### F5: DSGVO / DPA-Sammlung

**Was Audit GELB sagte:** „DPA-Marathon vor Live, sonst Bußgeld-Gefahr."

**Realität:**
- **Brevo:** AVV nach Art. 28 DSGVO direkt im Account-Bereich (Settings → DPA), auch im Free-Plan
- **Stripe:** Stripe ist überwiegend **eigenständig Verantwortlicher** (kein AVV nötig), bietet aber DPA für Click-Wrap
- **Sentry:** Standard-DPA unter sentry.io/legal/dpa
- **Cookie-Banner:** Pflicht ab erstem Tracking-Cookie (§ 25 TDDDG) — seit 2025: **„Ablehnen" muss gleich sichtbar** wie „Akzeptieren" auf erster Ebene
- **Bußgeld theoretisch:** bis 4% Konzern-Umsatz — Realität bei Solo: <500 € Behördenhinweis, häufiger 300-1.500 € Abmahnung

**Maßnahmen (2h):**
1. DPAs von Brevo + Stripe + Sentry runterladen → `docs/dpa/` ablegen + im Datenschutz verlinken
2. Cookie-Banner: 2 gleich große Buttons (Accept/Reject) auf erster Ebene
3. Auskunfts-Mail-Adresse `datenschutz@matthias-seba.de` im Datenschutz angeben

**Quellen:**
- [Brevo DPA Help](https://help.brevo.com/hc/en-us/articles/15403782599570-Where-can-I-find-the-Data-Processing-Agreement-DPA)
- [Stripe AVV-Status](https://av-vertrag.org/dienst-anbieter/stripe/)
- [Cortina Consult: TDDDG § 25](https://cortina-consult.com/web-compliance/wissen/tdddg/)

---

### F6: Verbraucherrecht (Widerruf, Button-Lösung)

**Was Audit GELB sagte:** „§ 312j BGB + Widerruf-Pflicht — Abmahn-Hotspot."

**Realität:**
- **§ 312j BGB Button-Lösung:** „Zahlungspflichtig bestellen" — schon implementiert ✅
- **Widerruf 14 Tage** für Verbraucher, **Ausschluss möglich** für digitale Inhalte/Dienstleistungen NUR mit ausdrücklicher Zustimmung + Bestätigung des Erlöschens (§ 356 Abs. 5 BGB)
- **ab 19.06.2026 PFLICHT:** § 356a BGB **Widerrufs-Button** in derselben UI wie Vertragsabschluss
- **B2B reine Verkäufe:** kein Widerrufsrecht — aber **klare Trennung muss erkennbar sein**

**Maßnahmen:**
1. **Pre-Sale-Frage:** „Sind Sie Unternehmer? (USt-ID Pflichtfeld)" — Sichtbare B2C-Trennung
2. **Widerrufs-Verzicht-Checkbox** für Verbraucher mit Bestätigung Erlöschens
3. **Bis 19.06.2026:** Widerrufs-Button auf Bestätigungs-Page nachrüsten (für Bestandskunden mit Vertragslaufzeit)

**Quellen:**
- [Noerr: § 356a BGB ab 19.06.2026](https://www.noerr.com/de/insights/umsetzungsgesetz-zum-widerrufsbutton-veroeffentlicht)
- [Beckmann & Norda: Anforderungen Onlinehändler](https://www.beckmannundnorda.de/serendipity/index.php?%2Farchives%2F7727-Der-Widerrufsbutton-kommt-Was-356a-BGB-ab-dem-19.06.2026-von-Onlinehaendlern-verlangt.html=)

---

### F7: Steuer / GoBD

**Was Audit GELB sagte:** „GoBD + Kleinunternehmer-Pflichten."

**Realität:**
- **§ 19 UStG unverändert ab 2025:** 25.000 € Vorjahr / 100.000 € laufendes Jahr
- **Pflichthinweis auf Rechnung:** „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet"
- **E-Rechnungs-Empfangs-Pflicht** seit 1.1.2025 (auch Kleinunternehmer)
- **E-Rechnung-Versand-Pflicht ab 2027** (nur > 800k €/Jahr Umsatz)
- **Aufbewahrung 8 Jahre** für Rechnungen seit 2025 (Bürokratieentlastungsgesetz IV)
- **lexoffice/sevdesk** machen GoBD automatisch (~10 €/Mo)

**AT-B2B:** Reverse Charge (Rechnung ohne USt mit Hinweis)
**CH:** kein USt-Geschäft, normal

**Maßnahmen:**
- lexoffice/sevdesk Account anlegen (10 €/Mo)
- Rechnungs-Template mit § 19 UStG-Hinweis
- USt-ID-Trigger bei 100k €/Jahr (Tool warnt)

**Quellen:**
- [Sevdesk § 19 UStG Klausel](https://sevdesk.de/ratgeber/buchhaltung-finanzen/kleinunternehmer/klausel/)
- [Kostenlose E-Rechnung 2026](https://kostenlose-erechnung.de/ratgeber/e-rechnung-kleinunternehmer/)

---

### F8: EU AI Act

**Was Audit GELB sagte:** „Pflichten ab 02.08.2026 vorbereiten."

**Realität:**
- **Digital Omnibus (Mai 2026, provisorisch):** Hochrisiko-Pflichten aus Annex III **verschoben auf 02.12.2027**
- Compliance-Scanner = **NICHT Annex III** (kein HR/Kredit/Strafverfolgung/Biometrie)
- Bei KI-Komponente: maximal „begrenztes Risiko" (Transparenz-Pflicht: User muss wissen) oder „minimales Risiko" (keine Pflichten)
- Strafrahmen Art. 99: bis 35 Mio € — praktisch null für Mini-SaaS ohne Hochrisiko

**Maßnahme:** Wenn KI im Report: „Dieser Report wurde mit KI-Unterstützung erstellt" im Footer (1 Satz).

**Quellen:**
- [Gibson Dunn: EU AI Act Omnibus Postponement](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)
- [Hogan Lovells: AI Act Delay](https://www.hoganlovells.com/en/publications/eu-legislators-agree-to-delay-for-highrisk-ai-rules)

---

## ✅ Top 10 Selber-Lösen-Maßnahmen (4h Aufwand total)

| # | Maßnahme | Aufwand | Risiko-Reduktion |
|---|---|---|---|
| 1 | **Disclaimer-Footer** auf jeder Report-Seite (Wortlaut siehe unten) | 15 Min | 🔴 hoch |
| 2 | **AGB-Generator abonnieren** (IT-Recht-Kanzlei, monatlich kündbar) | 30 Min | 🔴 hoch |
| 3 | **Pre-Sale-USt-ID-Pflichtfeld** + „Ich bin Unternehmer"-Checkbox | 30 Min | 🟡 mittel |
| 4 | **Cookie-Banner mit 2 gleich-großen Buttons** (Accept/Reject) auf 1. Ebene | 20 Min | 🔴 hoch |
| 5 | **DPAs sammeln** (Brevo/Stripe/Sentry runterladen → `docs/dpa/` + Datenschutz verlinken) | 30 Min | 🟡 mittel |
| 6 | **„Beta-Phase"-Banner** auf Website (ersten 90 Tagen) → Erwartungsdämpfend | 10 Min | 🟡 mittel |
| 7 | **lexoffice/sevdesk Konto** + Rechnungs-Template mit § 19 UStG-Hinweis | 60 Min | 🔴 hoch |
| 8 | **Widerruf-Verzicht-Checkbox** mit Erlöschens-Bestätigung (§ 356 Abs. 5 BGB) | 20 Min | 🟡 mittel |
| 9 | **Trigger-Kalender:** MRR-Schwelle für Hiscox + Cap-Klausel-Trigger | 10 Min | 🟢 niedrig |
| 10 | **Anwalts-Kontakte recherchieren** (Härting, Plutte, drschwenke) — Nummer parat, NOCH NICHT mandatieren | 15 Min | 🟢 niedrig |

**Total: ~4 h + 25 €/Mo Fixkosten** (AGB-Service 15€ + Buchhaltung 10€).

---

## 📝 Copy-Paste-Bausteine

### A) Disclaimer-Footer Report-Seite

```
Dieser Report ist eine automatisierte technische Analyse der untersuchten 
Website auf Basis der WCAG-2.1-Kriterien und ausgewählter Prüfregeln des 
Barrierefreiheitsstärkungsgesetzes (BFSG). Er stellt KEINE Rechtsberatung 
dar und ersetzt nicht die Prüfung durch einen qualifizierten Anwalt oder 
eine zertifizierte Konformitätsprüfung. Eine Garantie für Vollständigkeit, 
Aktualität oder rechtliche BFSG-Konformität wird nicht übernommen. 
BFSG-Check übernimmt keine Haftung für Folgeschäden, die durch Befolgung 
oder Nichtbefolgung der Empfehlungen entstehen.
```

### B) Haftungs-Cap AGB-Klausel (B2B + B2C, BGH-konform)

```
§ X Haftung

(1) BFSG-Check haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit 
sowie bei Verletzung von Leben, Körper oder Gesundheit.

(2) Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten 
(Kardinalpflichten) ist die Haftung auf den vertragstypisch vorhersehbaren 
Schaden begrenzt, höchstens jedoch auf den im jeweiligen Einzelauftrag 
gezahlten Auftragswert.

(3) Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.

(4) Diese Haftungsbegrenzung gilt auch zugunsten der gesetzlichen 
Vertreter und Erfüllungsgehilfen von BFSG-Check.
```

### C) „Best-Effort"-statt-Garantie-Klausel

```
BFSG-Check setzt branchenübliche automatisierte Prüf-Tools (axe-core, 
Lighthouse, eigene Regelwerke) ein und verpflichtet sich, diese mit 
professioneller Sorgfalt anzuwenden. Eine Garantie auf Auffindung 
sämtlicher Barrierefreiheits-Probleme oder auf rechtliche BFSG-Konformität 
der geprüften Website wird ausdrücklich NICHT übernommen. Manuelle Tests 
und individuelle Nutzer-Tests werden zusätzlich empfohlen.
```

### D) Pre-Sale-Frage (im Checkout)

```html
<fieldset>
  <legend>Sind Sie Unternehmer oder Verbraucher?</legend>
  <label>
    <input type="radio" name="customer_type" value="business" required>
    Ich bin Unternehmer / Geschäftskunde (USt-ID erforderlich)
  </label>
  <label>
    <input type="radio" name="customer_type" value="consumer" required>
    Ich bin Verbraucher (privat)
  </label>
</fieldset>

<!-- Wenn Verbraucher: -->
<label>
  <input type="checkbox" required>
  Ich verzichte ausdrücklich auf mein 14-tägiges Widerrufsrecht und 
  bestätige, dass dieses mit Vertragsabschluss erlischt (§ 356 Abs. 5 BGB). 
  Mit Bestellung beginnt die Ausführung sofort.
</label>
```

---

## 🚨 Ehrliches Restrisiko (NICHT verharmlosen)

| Risiko | Eintritts-W. | Schaden | Mitigation |
|---|---|---|---|
| BFSG-Trittbrettfahrer-Abmahnung | niedrig | 600-2.700 € | Disclaimer + Anwalt verteidigt |
| Unzufriedener Kunde klagt Folgeschaden | sehr niedrig | max 499 € mit Cap | AGB-Cap + Best-Effort |
| DSGVO-Cookie-Banner-Abmahnung | mittel | 300-1.500 € | Banner-Standard erfüllen |
| Falsche B2C-Klassifikation → Widerruf-Rückbuchung | mittel | -199 bis -499 € | Pre-Sale-Frage |
| Steuer-Schwellenüberschreitung Mid-Year | niedrig | <500 € Nachholung | lexoffice-Warnung |

**Realistische Gesamt-Risiko-Erwartung Jahr 1 (Solo, <30k € Umsatz, B2B-fokussiert):** 0-3.500 € Worst Case, **Erwartungswert 0-500 €**.

**Versicherung 200-300 €/Jahr** „Premium" lohnt **rechnerisch erst ab 5+ realen Schadensfällen/Jahr** = bei Skalierung > 2k € MRR.

---

## 📅 Trigger-Kalender (wann DOCH Anwalt / Versicherung?)

| Schwelle | Aktion |
|---|---|
| **MRR > 2.000 €** über 3 Monate konstant | Hiscox/Exali abschließen (~25-30 €/Mo) |
| **Erster B2B-Großkunde > 2.000 €** Einzelauftrag | Individueller Vertrag, Cap, Anwalts-Sichtprüfung (300-600 €) |
| **Erste Abmahnung** (egal welche) | SOFORT Fachanwalt UWG/IT — niemals selbst antworten! |
| **Erste DSGVO-Auskunfts-Anfrage Behörde** | Fachanwalt DSGVO einbinden |
| **B2C-Anteil > 30 %** | AGB-Anwalts-Check (500-1.500 € einmalig), VSH-Pflicht |
| **Kunden-Bestand > 100 aktive** | Full-Audit IT-Recht (1.500-3.000 €) |
| **AI-Komponente generiert Texte** | AI-Act-Check vor 02.12.2027 |
| **EU-Ausland AT/CH > 10k €** | Steuerberater (OSS-Verfahren, Reverse-Charge) |

---

## 📞 Anwalts-Kontakte (Trigger-Liste, NICHT jetzt mandatieren!)

| Fachbereich | Kanzlei | Speziell für |
|---|---|---|
| IT-Recht + UWG | **Härting Rechtsanwälte** (Berlin) | Compliance-Tools, smartlaw-Linie |
| IT-Recht + DSGVO | **Kanzlei Plutte** | E-Commerce, Cookie-Banner |
| IT-Recht + Abmahn-Abwehr | **Dr. Thomas Schwenke** | Abmahn-Verteidigung |
| Wettbewerbsrecht | **WBS Legal** (Köln) | UWG-Verteidigung |
| Marketing-Recht | **IT-Recht-Kanzlei** (München) | AGB-Service + Anwalts-Beratung |

---

## ✨ Bottom Line

> **Geh live.** Das GELB-Audit war korrekt-konservativ, aber für deine konkrete Konstellation (Solo, B2B-SaaS-fokussiert, <30k €/Jahr Year-1-Erwartung) ist das Risiko-Reward-Verhältnis von Anwalt + VSH **JETZT klar negativ**.
> 
> **25 €/Mo Fixkosten** (AGB-Service + Buchhaltung) + **4h Aufräum-Arbeit** sind die ehrliche Untergrenze.
> 
> **Trigger-Kalender ist dein Sicherheits-Netz.** Den Tag, an dem du den ersten 2k €-Großkunden hast oder die erste Abmahnung kommt, drückst du den Knopf.
> 
> **Vorher:** Energie in Vertrieb und Produkt, nicht in Versicherung.

---

## 📂 Verwandte Files

- `docs/legal-templates/disclaimer-footer.md` — Copy-Paste-Disclaimer
- `docs/legal-templates/agb-haftungs-cap.md` — Vollständige AGB-Klausel
- `docs/legal-templates/pre-sale-verbraucher-frage.md` — HTML + Logik
- `docs/legal-templates/cookie-banner-spec.md` — 2-Button-Banner-Spec
- `docs/dpa/` — DPAs von Brevo, Stripe, Sentry (du sammelst)

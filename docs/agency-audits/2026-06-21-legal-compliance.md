# Legal / Marketing Compliance Audit — BFSG-Check

**Audit-Datum:** 2026-06-21
**Auditor:** Compliance Auditor (Agency-Agent, read-only)
**Scope:** Live-Site-Copy + Marketing-Assets gegen UWG §5/§5a, TDDDG §25, §356a BGB Widerruf, §5 DDG/TMG Impressum
**Quelle der Wahrheit:** `origin/main` (= deployter Live-Stand). Das Audit prüft den LIVE-Stand, nicht den ausgecheckten Branch.

> ⚠️ **Kein Rechtsrat.** Dies ist eine technische Compliance-Risiko-Bewertung gegen die projekteigenen, dokumentierten Regeln (CLAUDE.md + `docs/LEGAL-REALITY-CHECK-2026.md` + `docs/legal-templates/`). Eine anwaltliche Endabnahme ersetzt das nicht.

---

## ⚠️ Branch-Befund vorab (methodisch wichtig)

Der aktuell ausgecheckte Branch **`docs/handover-final-2026-06-21`** enthält die Legal-Fix-PRs **#40, #41, #44 NICHT** (verifiziert via `git merge-base --is-ancestor`). Diese PRs sind aber auf **`origin/main` gemerged und damit live**. Konsequenz:

- Wer dieses Audit gegen die ausgecheckten Working-Tree-Dateien fährt, sieht **bereits behobene Verstöße** (Fake-Presseleiste, „5.247 Websites geprüft", Preis-Toggle, LinkedIn-Assets in `marketing/`) und hält sie fälschlich für offen.
- **Alle Befunde unten sind gegen `origin/main` validiert.** Wo Branch ≠ Live, ist das vermerkt.
- **Eigenständiges Risiko (F-13):** Der Handover-Branch reintroduziert entfernte Verstöße, falls je von ihm deployt/gemergt wird.

---

## Executive Summary

**Befunde nach Severity (Live-Stand origin/main):**

| Severity | Anzahl | Bedeutung |
|---|---|---|
| 🔴 Critical (abmahnfähig jetzt) | 0 | — |
| 🟠 High | 3 | vor Paid-Traffic-Skalierung beheben |
| 🟡 Medium | 5 | zeitnah, nicht launch-blockierend |
| 🟢 Low | 4 | Hygiene / Nice-to-have |

**Gesamt-Ampel: 🟡 GELB** — Der Live-Stand ist nach PRs #40/#41/#44 in einem vertretbaren Zustand. Es gibt **keinen sofort abmahnfähigen Hard-Stopper** mehr in der Live-Copy. Die drei High-Findings sind reale UWG-§5-Angriffsflächen, die vor dem Hochfahren von Google/Bing Ads geschärft werden sollten.

### Top 3 Abmahn-Risiken vor Launch

1. **F-01 (High, UWG §5):** Hero-H1 + `<title>` = „Ist Ihre Website **BFSG-konform?**". Als Frage formuliert (projekteigene Audit-Linie wertet das als zulässig), aber der Begriff „BFSG-konform" als dominantes Seitenversprechen ist die wahrscheinlichste Angriffsfläche, sobald Paid-Traffic + Wettbewerber-Aufmerksamkeit dazukommen. → auf „BFSG-fit?" / „WCAG-2.1-AA-geprüft?" entschärfen.
2. **F-02 (High, UWG §5):** `TrustSection` Badge **„DSGVO-konform"** + StatsBar **„Audit-Methodik, die vor Gericht standhält."** — pauschale, nicht belegte Konformitäts-/Eignungs-Zusage. „konform"/„vor Gericht standhält" sind Garantie-nahe Aussagen ohne Beleg.
3. **F-08 (High, TrustSection):** Badge **„BFSG / WCAG 2.1 — Prüfung nach EN 301 549 mit menschlicher Sichtung"** beim kostenlosen Auto-Scan suggeriert manuelle Sichtung auch im Gratis-Pfad; tatsächlich gilt menschliche Sichtung nur bei bezahlten Reports (siehe FAQ). Irreführung über den Leistungsumfang (§5 Abs. 1 Nr. 1 UWG).

### Verdict § 356a BGB Widerrufs-Button (Frist war 19.06.2026)

**✅ ERFÜLLT — Button + Belehrung existieren und sind für das Digital-Sofort-Szenario korrekt aufgesetzt.** Der Handover markiert den Button als „OVERDUE / Risiko mittel", aber das ist **veraltet**: Es existieren `/widerruf` (Online-Formular-Button „Widerruf erklären", Backend `/api/widerruf`), `/widerrufsbelehrung` (mit Sektion „Vorzeitiges Erlöschen" für digitale Inhalte + Muster-Formular) und die Checkout-Erlöschens-Checkbox (§356 Abs.5 BGB-Wortlaut). Die § 356a-Pflicht (gut sichtbarer, leicht zugänglicher Widerrufs-Button) ist über die im Footer verlinkte `/widerruf`-Seite umgesetzt. **Restpunkt (Medium, F-05):** Widerrufsbelehrung ist nicht 1:1 der amtliche Wortlaut Anlage 1 EGBGB → Privilegierungswirkung nur bei wörtlicher Übernahme; anwaltliche 5-Min-Sichtung empfohlen. **Kein Critical, kein Blocker.**

---

## Findings

### F-01 — Hero-H1 + Page-Title „BFSG-konform?"
- **Risk-Type:** UWG §5 (Irreführung) / Pflicht-Sprache
- **Severity:** 🟠 High
- **Location:** `landingpage-next/lib/config.ts:31` (`title`), `:57` (`headlineEmph: "BFSG-konform?"`), gerendert in `components/Hero.tsx:76`
- **Offending text:** `title: "BFSG-Check — Ist Ihre Website BFSG-konform? | Kostenlose Sofort-Prüfung"` und H1-Emphasis-Zeile `BFSG-konform?`
- **Bewertung:** Als **Frage** formuliert — die projekteigene `docs/archive/RECHTSSICHERHEITS-AUDIT.md` §A wertet „Frage statt Versprechen" ausdrücklich als zulässig. Daher nicht Critical. ABER: CLAUDE.md listet „BFSG-konform" als verbotene Marketing-Sprache; der Begriff ist als dominantes H1 + SEO-Title das wahrscheinlichste UWG-Ziel bei Wettbewerber-/Kanzlei-Aufmerksamkeit.
- **Concrete Fix:** H1-Emphasis → `WCAG-2.1-AA-geprüft?` oder `BFSG-fit?`; Title → `BFSG-Check — Website auf Barrierefreiheit prüfen | Kostenlose Sofort-Analyse`. Mindestens den werblichen Anspruch durch „automatisierte technische Analyse" stützen.
- **Already-fixed?** N (unverändert auf origin/main)

### F-02 — „DSGVO-konform" Badge + „vor Gericht standhält"
- **Risk-Type:** UWG §5 (unbelegte Konformitäts-/Eignungs-Zusage)
- **Severity:** 🟠 High
- **Location:** `components/TrustSection.tsx:19-20` („DSGVO-konform" / „Hosting in Deutschland, keine Drittland-Übermittlung"); `components/StatsBar.tsx:40` („Audit-Methodik, die vor Gericht standhält.")
- **Offending text:** Badge-Titel **„DSGVO-konform"** als pauschale Selbstzusage; Headline **„Audit-Methodik, die vor Gericht standhält."**
- **Bewertung:** „konform" ist nach den eigenen No-Gos (CLAUDE.md, disclaimer-footer.md „Was du NICHT schreibst") ein zu vermeidender Garantie-Begriff. „vor Gericht standhält" ist eine nicht belegbare Wirkungs-Zusage (kein Tool/Report „hält vor Gericht stand").
- **Concrete Fix:** „DSGVO-konform" → „Datenschutz nach DSGVO" / „DSGVO-orientiert". „Audit-Methodik, die vor Gericht standhält." → „Audit-Methodik nach denselben Normen, auf die sich Behörden und Kanzleien berufen." (entfernt die Wirkungs-Garantie, behält die Authority).
- **Already-fixed?** N

### F-03 — Hero-Pill „Erste Abmahnungen rollen an"
- **Risk-Type:** UWG §5a (Angstwerbung / Irreführung durch Unterlassen Kontext)
- **Severity:** 🟡 Medium
- **Location:** `lib/config.ts:55` (`pill`), gerendert `Hero.tsx:63`; analog RiskBand `lib/config.ts:99-106`
- **Offending text:** „BFSG seit 28.06.2025 in Kraft · **Erste Abmahnungen rollen an**"
- **Bewertung:** `docs/LEGAL-REALITY-CHECK-2026.md` F1 stuft die reale Abmahnlage selbst als „angreifbar / Netto-Erwartungswert 0-500 €/Jahr" ein. „Abmahnungen rollen an" ist als Dringlichkeits-Trigger grenzwertig (Angst-Verkauf), aber faktisch belegbar (CLAIM RA / Kanzlei MK Abmahnwelle Aug 2025). RiskBand selbst ist bewusst neutral gehalten („KEINE Drohung" laut Code-Kommentar) — gut.
- **Concrete Fix:** Optional entschärfen zu „BFSG seit 28.06.2025 in Kraft · Frist verstrichen" — entfernt den Angst-Hebel, behält die Faktenlage. Niedrige Priorität, da faktisch wahr und nicht-quantifiziert (keine konkreten Bußgeld-Summen).
- **Already-fixed?** Teilweise (RiskBand wurde bereits neutralisiert; Pill noch nicht)

### F-04 — Footer enthält Disclaimer-Kurzform, nicht die Template-Langform
- **Risk-Type:** Pflicht-Sprache / Disclaimer-Vollständigkeit (`disclaimer-footer.md` B)
- **Severity:** 🟡 Medium
- **Location:** `components/Footer.tsx:195-197` rendert `LEGAL_NOTE` aus `lib/config.ts:323`
- **Offending/Ist-Zustand:** `LEGAL_NOTE = "Automatisierte, KI-gestützte Erstprüfung mit menschlicher Sichtung — keine Rechtsberatung, keine Konformitätsgarantie. Ergebnisse ersetzen keine vollständige manuelle Prüfung."`
- **Bewertung:** Der Kern ist da („keine Rechtsberatung", „keine Konformitätsgarantie", „automatisierte … Prüfung") — die drei schutzkritischen Phrasen aus `disclaimer-footer.md` sind abgedeckt. Die Template-Variante B nennt zusätzlich explizit „WCAG 2.1 AA" und „ersetzen keine anwaltliche Beratung … Fachanwalt für IT-Recht". **Substanziell ausreichend**, formal nicht 1:1 das Template.
- **Concrete Fix:** `LEGAL_NOTE` um den Halbsatz ergänzen: „… Für rechtliche Fragen konsultieren Sie einen Fachanwalt für IT-Recht." — schließt die letzte Template-Lücke.
- **Already-fixed?** Überwiegend Y (Kern vorhanden), Rest-Delta N

### F-05 — Widerrufsbelehrung nicht im amtlichen Wortlaut (Anlage 1 EGBGB)
- **Risk-Type:** §356a/§355 BGB Verbraucherrecht (Privilegierungswirkung)
- **Severity:** 🟡 Medium
- **Location:** `app/widerrufsbelehrung/page.tsx:18-63`
- **Offending element:** Eigene Formulierung der Belehrung. Inhaltlich vollständig (Widerrufsrecht, Frist ab Vertragsschluss, Folgen, vorzeitiges Erlöschen bei digitalen Inhalten, B2B-Ausschluss, Muster-Formular), aber **nicht wortgleich** mit Anlage 1 zu Art. 246a §1 Abs.2 S.2 EGBGB.
- **Bewertung:** Nur die wörtliche Übernahme der amtlichen Musterbelehrung garantiert die gesetzliche Privilegierungswirkung (Schutz vor Belehrungs-Fehler-Abmahnung). Inhaltlich korrekt → niedriges Praxis-Risiko, aber formal angreifbar.
- **Concrete Fix:** Amtlichen Wortlaut Anlage 1 EGBGB übernehmen (Gestaltungshinweise für Dienstleistung/digitale Inhalte einsetzen). 1× anwaltliche 5-Min-Sichtung (steht als offener Punkt in `docs/archive/LEGAL-REVIEW-CHECKLIST.md` Frage 1).
- **Already-fixed?** N

### F-06 — Newsletter-Anmeldung im Footer ist UI-only (kein Double-Opt-in)
- **Risk-Type:** UWG §7 Abs.2 (Werbe-E-Mail ohne Einwilligung) / DSGVO
- **Severity:** 🟡 Medium
- **Location:** `components/Footer.tsx:49-54, 89-124`
- **Offending element:** Newsletter-Formular setzt nur lokal `submitted=true` („UI-only: kein Backend angebunden"). Aktuell harmlos. Risiko entsteht, **sobald** ein Backend angeschlossen wird und Mails ohne Double-Opt-in-Bestätigung rausgehen.
- **Concrete Fix:** Vor Backend-Anbindung Double-Opt-in (Brevo DOI-Flow) erzwingen; Einwilligungstext + Datenschutz-Link am Formular ergänzen. Bis dahin: kein Live-Risiko, aber als Implementierungs-Guard dokumentieren.
- **Already-fixed?** N/A (noch kein Versand)

### F-07 — Testimonials-Section ohne echte Testimonials (korrekt gelöst)
- **Risk-Type:** UWG §5 (gefälschte Bewertungen — Negativ-Kontrolle)
- **Severity:** 🟢 Low (vorbildlich, kein Verstoß)
- **Location:** `components/Testimonials.tsx:15, 74-77`
- **Befund:** Bewusst **keine** Fake-Quotes („Echte Kunden-Stimmen folgen nach Launch — bis dahin zeigen wir lieber harte Differentiators als Pseudo-Quotes."). Stattdessen sachliche Differentiatoren. **Genau richtig** — verhindert §5-Abs.1-Nr.… Fake-Review-Verstoß. Keine Aktion.
- **Already-fixed?** Y (so designt)

### F-08 — „Menschliche Sichtung" Badge suggeriert manuelle Prüfung im Gratis-Scan
- **Risk-Type:** UWG §5 Abs.1 Nr.1 (Irreführung über Leistungsumfang)
- **Severity:** 🟠 High
- **Location:** `components/TrustSection.tsx:24-25` („BFSG / WCAG 2.1 — Prüfung nach EN 301 549 **mit menschlicher Sichtung**"); Hero-Badge `lib/config.ts:67-69` („KI-gestützt + menschlich geprüft")
- **Offending text:** „Prüfung nach EN 301 549 mit menschlicher Sichtung" als generische Trust-Aussage neben dem **kostenlosen Sofort-Check**, obwohl menschliche Sichtung laut FAQ/DIFFERENTIATORS nur bei **bezahlten** Reports erfolgt (`config.ts:266` „Menschliche Sichtung vor Auslieferung" = Paid).
- **Bewertung:** Der kostenlose Auto-Scan ist rein automatisiert (ResultCard zeigt „Sofort-Prüfung", keine menschliche Sichtung). Die pauschale Trust-Badge kann so verstanden werden, dass jeder Scan menschlich gesichtet wird → Irreführung.
- **Concrete Fix:** Badge präzisieren: „Bezahlreports mit menschlicher Sichtung" oder Trennung „Auto-Scan (kostenlos) / kuratierter Report (kostenpflichtig)". Hero-Badge „KI-gestützt + menschlich geprüft" nur am Paid-Produkt zeigen.
- **Already-fixed?** N

### F-09 — Cookie-Banner: 2-Button-Balance (TDDDG) — erfüllt
- **Risk-Type:** TDDDG §25 (Consent-Gleichgewicht)
- **Severity:** 🟢 Low (konform)
- **Location:** `components/CookieBanner.tsx:167-185`
- **Befund:** „Nur notwendige" (variant=outline) und „Alle akzeptieren" (default) stehen **nebeneinander, gleiche Größe** (beide `size="lg" min-h-11`), beide auf erster Ebene, kein Dark-Pattern. Marketing-Tags laden erst nach Opt-in (`bfsgLoadTrackers` nach Consent). **TDDDG-konform.** Einziger Mini-Hinweis: „Alle akzeptieren" hat Default-(Solid-)Styling, „Nur notwendige" Outline — visuell minimal stärker, aber Größe/Position gleich → im grünen Bereich. Optional beide gleich stylen für maximale Sicherheit.
- **Already-fixed?** Y

### F-10 — Impressum vollständig (§5 DDG)
- **Risk-Type:** §5 DDG / §5 TMG Anbieterkennzeichnung
- **Severity:** 🟢 Low (konform)
- **Location:** `app/impressum/page.tsx`
- **Befund:** Name (Matthias Seba), Anschrift (Lange Straße 20, 27449 Kutenholz), E-Mail (info@matthias-seba.de), §19-UStG-Kleinunternehmer-Hinweis, §18 Abs.2 MStV redaktionell Verantwortlicher, EU-ODR-Hinweis + Disclaimer alle vorhanden. **Vollständig.** Anmerkung: Keine Telefonnummer — §5 DDG verlangt „schnelle elektronische Kontaktaufnahme", E-Mail genügt nach h.M., Telefon nicht zwingend. OK.
- **Already-fixed?** Y

### F-11 — Preis-Toggle auf Einmal-Paketen (#44) — behoben auf live
- **Risk-Type:** PAngV / UWG §5 (irreführende Preisdarstellung)
- **Severity:** 🟢 Low (behoben)
- **Location:** `components/PricingCards.tsx:46` (origin/main: `const showToggle = showAnnualToggle && hasEnabledSub;`)
- **Befund:** Auf **origin/main** wird der Monatlich/Jährlich-Toggle nur noch angezeigt, wenn ein aktivierbares Abo existiert. Auf Einmal-Paketen (Basis/Profi/Cookie) erscheint kein irreführender Toggle mehr. ⚠️ **Auf dem ausgecheckten Handover-Branch ist diese Korrektur NICHT vorhanden** (dort `showAnnualToggle = true` ohne `hasEnabledSub`-Guard) → siehe F-13.
- **Already-fixed?** Y (auf live/origin/main via PR #44)

### F-12 — Fake-Presseleiste + „5.247 Websites geprüft" (#40) — behoben auf live
- **Risk-Type:** UWG §5 (irreführende Eindruck echter Berichterstattung / erfundene Stat)
- **Severity:** 🟢 Low (behoben)
- **Location:** `app/page.tsx` (origin/main: LogoCloud aus Komposition entfernt); `lib/config.ts:70` (origin/main: Hero-Stat = „80+ Prüfregeln (EN 301 549)")
- **Befund:** Auf **origin/main** ist die Platzhalter-Presseleiste „Bald berichtet in" (TechCrunch/heise/t3n/OMR/Computerwoche) von der Startseite entfernt und die erfundene „5.247 Websites geprüft"-Zahl durch belegbares „80+ Prüfregeln" ersetzt (PR #40). Rest-Hygiene: Der `LOGO_CLOUD`-Export in `config.ts:154` existiert noch (Dead Code, nicht gerendert) → optional entfernen. ⚠️ Auf dem Handover-Branch ist LogoCloud noch in `page.tsx` eingebunden + „5.247" noch aktiv → F-13.
- **Already-fixed?** Y (auf live via PR #40)

### F-13 — Handover-Branch reintroduziert behobene Verstöße
- **Risk-Type:** Prozess / Release-Hygiene (Wiedereinschleppen von UWG-§5-Verstößen)
- **Severity:** 🟠 High (prozessual) / nur relevant falls Branch deployt wird
- **Location:** Branch `docs/handover-final-2026-06-21` vs. `origin/main`
- **Offending state:** Branch enthält PRs #40/#41/#44 nicht. Working-Tree zeigt daher wieder: gerenderte Fake-Presseleiste (`page.tsx` importiert `LogoCloud`), „5.247 Websites geprüft" (`config.ts`), Preis-Toggle ohne Sub-Guard (`PricingCards.tsx`), und die UWG-Risiko-Assets (`marketing/linkedin-launch-posts.md`, `partner-targets.md`, `partner-warm-dms.md`) liegen wieder unter `marketing/` statt `marketing/_obsolete/`.
- **Concrete Fix:** Branch vor jeglichem Merge auf `origin/main` rebasen (`git rebase origin/main`) oder verwerfen. **Niemals** von diesem Branch deployen. Da Deploy nur via main-Merge läuft (CLAUDE.md), ist das aktuell latent, nicht akut — aber ein scharfer Fußangel.
- **Already-fixed?** N (offen, branch-spezifisch)

---

## Marketing-Assets-Scan

| Datei | Befund | Severity | Already-fixed? |
|---|---|---|---|
| `marketing/google-ads.md` | Verbotene Begriffe nur in **Warn-/Negativ-Kontext** („keine Konformitätsgarantie", „abmahnsicher → ersetzt durch …"). PR #41 ersetzte „rechtssicherste" → „niedrigstem Rechtsrisiko". Sauber. | 🟢 Low | Y (#41) |
| `marketing/google-ads-rsa-headlines.md` | „cookie banner rechtssicher 2026" (Z24) = **Keyword-Target**, kein Ad-Text → unkritisch. Regel-Hinweis „Keine BFSG-konform-Garantien" (Z61) explizit dokumentiert. RSA-Headlines selbst clean. | 🟢 Low | Y |
| `marketing/press-release-launch.md` | „Es geht nicht um Garantien — die kann kein Tool seriös abgeben" (Z53) = korrekte Negativ-Aussage. PR #41 markierte unbelegte Stats mit `[BELEG NÖTIG]`. | 🟢 Low | Y (#41) |
| `marketing/show-hn-launch-post.md` | PR #41: V1 ohne Dataset-Claims (launchbar), V2 mit `[BELEG NÖTIG]`-Markern. „100% MRR-pursuit" (Z139) = Founder-Slang, kein Konformitäts-Claim. | 🟢 Low | Y (#41) |
| `marketing/seo-content-plan.md` | „garantiert sicher" nur als **zu vermeidende** Phrase gelistet (Z191). „Warum kein Auto-Tool 100% findet" = ehrliche Aufklärung. | 🟢 Low | Y |
| `marketing/STRATEGY-2026.md` | „verbotene Heils-/Garantieversprechen" nur im Risiko-Register. Sauber. | 🟢 Low | Y |
| `marketing/_obsolete/linkedin-launch-posts.md` | **Auf origin/main nach `_obsolete/` verschoben** (PR #41) + enthält „9 von 10 … NICHT BFSG-konform" + LinkedIn-Strategie (Handover: NICHT nutzen). Solange in `_obsolete/` = geparkt, kein Live-Risiko. ⚠️ Auf Handover-Branch noch unter `marketing/` (F-13). | 🟡 Medium (falls genutzt) | Y auf live (#41) |
| `marketing/_obsolete/partner-targets.md`, `partner-warm-dms.md` | LinkedIn/Xing-DM-Vorlagen (OLG Hamm 18 U 154/22-Risiko). **Auf origin/main nach `_obsolete/`** (PR #41). Geparkt = ok. Nicht reaktivieren. | 🟡 Medium (falls genutzt) | Y auf live (#41) |

---

## Evidence Matrix (Live = origin/main)

| Regel (CLAUDE.md / Reality-Check) | Soll | Live-Ist | Status |
|---|---|---|---|
| Keine „BFSG-konform"-Garantie | nur als Frage / „technische Analyse" | H1 + Title „BFSG-konform?" (Frage) | 🟡 F-01 |
| Keine „rechtssicher/garantiert/100%" in UI | — | „DSGVO-konform" Badge, „vor Gericht standhält" | 🟠 F-02 |
| Pflicht-Sprache „automatisierte technische Analyse" | durchgängig | in AGB/Footer/FAQ vorhanden | ✅ |
| Disclaimer-Footer (disclaimer-footer.md B) | Langform | Kurzform mit Kern-Phrasen | 🟡 F-04 |
| Cookie-Banner 2-Button-Balance (TDDDG) | gleich prominent | „Nur notwendige" + „Alle akzeptieren" gleich groß | ✅ F-09 |
| Kein irreführender Preis-Toggle (#44) | nur bei Abo | `hasEnabledSub`-Guard live | ✅ F-11 |
| Keine Fake-Trust-Claims (#40) | entfernt | Presseleiste raus, „80+ Prüfregeln" | ✅ F-12 |
| §356a Widerruf-Button | sichtbar + erreichbar | `/widerruf`-Formular-Button + Footer-Link | ✅ |
| Impressum §5 DDG vollständig | alle Pflichtangaben | vollständig | ✅ F-10 |
| Keine Fake-Testimonials | keine | bewusst keine | ✅ F-07 |

---

## Empfohlene Reihenfolge (Remediation)

1. **F-13** — Handover-Branch rebasen/verwerfen, nie von ihm deployen (verhindert Wiedereinschleppen). *Effort: 5 Min.*
2. **F-02 + F-08** — „DSGVO-konform" / „vor Gericht standhält" / „menschliche Sichtung"-Badge in `TrustSection.tsx` + `StatsBar.tsx` + `config.ts` entschärfen. *Effort: 20 Min.*
3. **F-01** — Hero-H1 + Title von „BFSG-konform?" auf „WCAG-2.1-AA-geprüft?"/„BFSG-fit?" umstellen. *Effort: 10 Min.*
4. **F-04** — `LEGAL_NOTE` um Fachanwalt-Satz ergänzen. *Effort: 2 Min.*
5. **F-05** — Widerrufsbelehrung auf amtlichen Anlage-1-EGBGB-Wortlaut + anwaltliche 5-Min-Sichtung. *Effort: 30 Min + Anwalt.*
6. **F-03, F-06, F-12-Resthygiene** — Pill entschärfen, Newsletter-DOI-Guard, `LOGO_CLOUD` Dead Code entfernen. *Effort: je <15 Min.*

---

*Read-only Audit. Keine Quelldateien geändert, kein Commit, kein Push. Befunde sind Compliance-Risiko-Flags, keine abschließende Rechtsbewertung.*

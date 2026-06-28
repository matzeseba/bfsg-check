# Handover — Marken-Maskottchen „Filo" (Fuchs) · Roll-out-Plan

> **Stand:** 29.06.2026 · Erstellt aus der 10-Agenten-Workflow-Analyse (Run `wf_f7ad724d-f45`).
> **Zweck:** sauberer Start in den Marken-Vollumbau in der nächsten Session.
> **Lies zuerst** `CLAUDE.md` + `docs/HANDOVER-NEXT-SESSION.md`, dann diese Datei.

---

## 1. Entscheidung (verifiziert, hohe Konfidenz)

- **Verdikt: CONDITIONAL_GO** — eine Markenfigur ist die richtige Wette, ihr Wert hängt aber **strikt an Ausführungsdisziplin** (Kill-the-Mascot-Red-Team: 3,5/10, Reconciliation: 8/10, IP-Linse: 9/10).
- **Gewinner: der Fuchs** (`bfsg-fuchs.de`). Alle Linsen Fuchs 7–8 vs. Held 4–5.
  - **Held verliert** an: (1) **Ableismus-Landmine** — „Retter/Held" im Behinderungs-Kontext kollidiert mit dem „disability saviorism"-Diskurs; (2) **Generik/Inflation** — „IT-Held/Software-Helden/UnternehmerHeld" ist überfüllt; (3) **schwacher Bildschutz** — abstrakter Superheld ist generisches Bildvokabular.
  - **`bfsg-held.de`** wird nur **Defensiv-/Redirect-Domain**.
- **Figurname: „Filo"** (Phantasiename) — **bewusst keyword-frei, KEIN „BFSG-Fuchs"** (sonst Rückfall in den überfüllten „BFSG-…"-Look-alike-Namensraum + reaktivierte Nähe zum Wettbewerber bfsg-check.de).
- **Strategischer Kern-Hebel (IP):** Das Maskottchen ist die **einzige günstige Lösung** für die echte Schwäche des letzten Rebrands — „Barrierefrei-Prüfen" ist rein beschreibend = schwacher Markenschutz. Ein distinktives **Bild-Element macht die Wort-/Bildmarke eintragbar** (DPMA-Praxis). **Das ist der eigentliche Return.**

## 2. Marken-Architektur (Architektur B: Descriptive-Primary + Mascot-as-Figure)

| Element | Rolle |
|---|---|
| **barrierefrei-pruefen.de** | bleibt **Haupt-/Money-/Canonical-Domain** (Exact-Match-SEO für Buyer-Intent). Unverändert. |
| **„Filo" (Fuchs)** | distinktiver **Marken-Layer obendrauf** (Logo-Figur + Bildmarke). Erscheint nur auf der Zielseite. |
| **bfsg-fuchs.de / bfsg-held.de / bfsg-fix.de** | **ausschließlich 301-Redirects** auf barrierefrei-pruefen.de. NIE als Zweitmarke kommuniziert. |

> **Kein Widerspruch zur letzten Session:** Wir sind weg von der *kollidierenden Marke* bfsg-check.de, nicht weg vom *BFSG-Keyword* (bleibt SEO-Anker/Paketname/Title). Filo neutralisiert die Verwechslung über das **Bild** statt über das Keyword.

## 3. Reihenfolge — ZWINGEND (nicht vermischen)

1. **PR #92 unverändert zuerst mergen** (nach DNS-Cutover, siehe `docs/REBRAND-CUTOVER-RUNBOOK.md`). Die Maskottchen-Entscheidung **ändert an PR #92 NICHTS** — nicht blockieren, nicht erweitern, nicht zurückrollen. Filo kommt als **separater, nachgelagerter Branding-PR** in eigenem Branch mit eigenem Merge-Trigger.
2. **Priorität ehrlich:** Erst die echten Engpässe — DNS-Cutover (PR #92), der offene **bezahlte-Scan-TLS-Bug** ([[paid-scan-strict-tls]]) und **erste Sales**. Filo ist hoch-hebelnd, aber **nicht** vor diesen Punkten. Budget-Cap setzen (KI-Bildpipeline + einmaliges Brand-Kit, **kein** Agentur-Retainer).
3. **A/B-Test vor Vollintegration:** Filo-Hero vs. nüchterne Variante messen, bevor flächig integriert wird.

## 4. Roll-out-Schritte (für den Branding-PR)

**Schritt 0 — Markenrecht-Pflichtcheck (vor Design-Invest):**
- DPMAregister + EUIPO/TMview auf **Fuchs-Bildmarken** (Wiener-Bildklasse **03.01**) in **Nizza-Klassen 42 (SaaS/Analyse) + 35 (Werbung) + 41 (Schulung)**.
- Bewusste Abgrenzung zum **Schwäbisch-Hall-Fuchs** (Klasse 36 Finanz, ~90 % Bekanntheit) über Pose/Farbe/Reduktion. Optional 1 h Fachanwalt-Eintragungsprognose.
- Designer-Vertrag mit **voller Rechteübertragung**. Phantasie-Eigenname „Filo" auf Wortschutz prüfen.

**Schritt 1 — Design finalisieren:**
- Aus dem Konzept + den KI-Renders dieser Session 1 **Master-Pose** + 3–4 Kontext-Posen ableiten (Hero / Scan-Lade / Report-Guide / Fehler / Erfolg / Leerzustand).
- Liefern als **SVG (logo-tauglich) + PNG-Set**, inkl. **Favicon/einfarbige Silhouette** (Mint-Schweifspitze als Marken-Mal, funktioniert in 16 px).

**Schritt 2 — Charakter-Charta committen** (`docs/brand/filo-charter.md`): Persönlichkeit, Do's/Don'ts, Voice (siehe Abschnitt 6). Verbindlich für alle Copy/Assets.

**Schritt 3 — Domain-Redirects** (Owner-Infra): bfsg-fuchs.de / bfsg-held.de / bfsg-fix.de → **301** auf barrierefrei-pruefen.de (Caddy-Block + DNS A-Records auf 178.105.83.0). DNS-abhängig → nach Cutover.

**Schritt 4 — Landingpage-Integration** (`landingpage-next/`, eigener Branch):
- Hero (Filo neben Scan-Visual, mint Scan-Beam = bestehendes `--animate-scan-beam`), Scan-Ladeanimation, Report-Guide, Fehler-/404-Zustände, Erfolgszustand.
- Brevo-Mail-Header-Visual (Filo als Absender-Persona).
- **A/B-Test** (Schritt 3 oben) zuerst. `legal-copy-grep` auch auf Maskottchen-Copy.

**Schritt 5 — Wort-/Bildmarke anmelden** (DPMA, Klassen 42/35/41), sobald Design final — **das schützbare Asset**, das den beschreibenden Namen absichert.

**Schritt 6 — Asset-Pipeline:** KI-Bild-Pipeline + manuelle Nachbearbeitung; kleines robustes Set statt Agentur. Budget-Cap einhalten.

## 5. Top-Risiken & Mitigations

| Risiko | Mitigation |
|---|---|
| **Trickster-/List-Fehlwahrnehmung** des Fuchses (fatal im Rechtssicherheits-Produkt) | Charakter-Charta mit No-Go-Liste: kein Zwinkern/Grinsen/Eckzahn/Schlitzohr. Erlaubt: aufmerksam, loyal, führend (Spürsinn-Profi). Voice „Verbündeter, nicht Schlitzohr". |
| **Regression in den „BFSG-…"-Namensraum** (wenn Figurname „BFSG" trägt) | Guardrail: kein „BFSG" im Figur-/Markennamen. bfsg-*-Domains nur als 301. |
| **Gesetz-Verharmlosung** durch die Figur (UWG §5) | Narrativ immer Risiko→Sicherheit; Filo entdramatisiert den *Weg*, nie das Gesetz. Disclaimer bleibt sichtbar, Filo immer **neben** WCAG-Score/Report-Sample. |
| **Solo-Founder-Asset-Last / Bikeshedding** | Budget-Cap, KI-Pipeline, Timing NACH Cutover/TLS-Fix/erste Sales. |
| **IP-Lücke** (DPMA prüft keine älteren Rechte; Schwäbisch-Hall-Fuchs) | Pflicht-Eigenrecherche (Schritt 0) + bewusste grafische Abgrenzung. |

## 6. Charakter-Charta „Filo" (Kurzfassung)

- **Archetyp:** kompetenter **Guide / aufmerksamer Verbündeter** (Mentor — NICHT Held). Kunde = Held, Filo = Lotse/Spürsinn.
- **Persönlichkeit:** aufmerksam & gründlich · ruhig & souverän (senkt den Angst-Puls) · ehrlich & klar (beschönigt das Gesetz nie) · verbündet auf Augenhöhe · erwachsen & kompetent · pragmatisch-lösungsorientiert.
- **Voice:** ruhig, klar, erwachsen, Du-Ansprache, kurze konkrete Sätze. „Das ist machbar, ich gehe es mit dir durch." Pflicht-Sprache: „automatisierte technische Analyse", „WCAG-2.1-AA-Audit", „keine Rechtsberatung". Nie marktschreierisch/schelmisch/pathetisch.
- **DON'Ts:** kein Zwinkern/Schlitzohr-Pose; keine Held-/Cape-/Retter-Inszenierung; kein Chibi/Kawaii; keine Sprechblasen mit „BFSG-konform/rechtssicher/garantiert"; keine Siegel/Plaketten; kein „BFSG" im Namen; keine Angst-/Alarm-Figur; Mint nie als Vollflächen-Fellfarbe.
- **Visual:** moderner flacher Vektor, „soft 2.5D", erwachsene schlanke Proportionen, logo-tauglich (16 px/einfarbig). **Palette:** Fell warmes gedämpftes Terrakotta-Orange `#C8703C–#B25E32`; Bauch/Schweifspitze Off-White `#F4EDE2`; Akzent **Mint `#34d99a`** (Augen-Glanz, Kragen/Schal, Scan-Beam, Häkchen); Umgebung Indigo/Near-Black `#0b0d18/#050609`. Signatur: **Mint-Schweifspitze** + mint Scan-Beam als Filos Werkzeug.

## 7. Claim-Optionen (Pflicht-Sprache-konform)

- „Wir zeigen dir, wo deine Website steht."
- „Sieht, was übersehen wird. Erklärt, was zu tun ist."
- „Barrierefreiheit ist machbar. Wir fangen beim ersten Befund an."
- „Verständlicher Report statt 200 Seiten Norm."
- „Dein aufmerksamer Begleiter durch die Barrierefreiheit."

## 8. Assets aus dieser Session

- Vollständige Analyse + Konzept (JSON): Workflow-Output `tasks/wse9h62va.output` (Run `wf_f7ad724d-f45`).
- KI-Renders „Filo" (nano_banana_pro, 2 Varianten) — in dieser Session erzeugt; für den Branding-PR als Design-Referenz exportieren.
- Diese Handover-Datei + Eintrag im Memory ([[mascot-filo-decision]]).

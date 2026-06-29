# Handover — Marken-Vollumbau auf „BFSG-Fuchs" (Option B) · Roll-out-Plan

> **Stand:** 29.06.2026 · **ERSETZT** die frühere Empfehlung „Architektur B = Fuchs nur als Layer auf barrierefrei-pruefen.de". Owner-Entscheid ist jetzt **Option B**: die Figur IST die Marke.
> **Lies zuerst** `CLAUDE.md` + `docs/HANDOVER-NEXT-SESSION.md`, dann diese Datei.

---

## 1. Finale Entscheidung (vom Owner getroffen, 29.06.2026)

- **Marke = „BFSG-Fuchs"** (mit Fuchs-Werbefigur). **Hauptdomain = `bfsg-fuchs.de`.**
- **`barrierefrei-pruefen.de` bleibt erhalten** als **301-Redirect + SEO-/Lead-Kanal** auf bfsg-fuchs.de (der „barrierefrei prüfen"-Such-Match geht nicht verloren, er wird auf die Marke gebündelt).
- `bfsg-held.de` + `bfsg-fix.de` = reine Defensiv-/Redirect-Domains.
- „BFSG" im Markennamen ist **erlaubt** — nur die exakte Kombination „BFSG-Check" war zu meiden (Wettbewerber `bfsg-check.de` / Fast Forward IT). „Fuchs" liefert die arbiträre, schützbare Unterscheidungskraft.
- Grundlage: unvoreingenommene **6-Linsen-Analyse** (3:3 A/B, C abgeschlagen) → `docs/brand/domain-fox-3way-reports.md`. Owner wählte B (stärkste eigenständige, markenrechtlich schützbare, empfehlbare Marke).

## 2. Konsequenz für PR #92 (wichtig!)

PR #92 hat die Marke auf „Barrierefrei-Prüfen" + Domain `barrierefrei-pruefen.de` umbenannt — als **Markenname jetzt überholt** (Marke = „BFSG-Fuchs"). **ABER** die Datei-/Stellen-Landkarte + Such-Ersetzen-Mechanik von PR #92 ist 1:1 wiederverwendbar.
**Plan:** PR #92 **nicht so mergen**. Stattdessen denselben Rebrand mit identischem Mapping auf das neue Ziel **„BFSG-Fuchs" / `bfsg-fuchs.de`** ausführen (nur das Ersetzungs-Ziel tauschen). `barrierefrei-pruefen.de` wird Redirect statt Primär. „BFSG" als Gesetz/Keyword bleibt überall erhalten — nur **Marke + Primärdomain** ändern.

## 3. Design-Entscheidungen (verbindlich)

- **Outfit: Business-Casual** — navy Polo + dunkle Anthrazit-Chino + braune Lederschuhe. **KEIN Anzug/Krawatte** (Anzug = „Kanzlei/teuer" gegen unsere Positionierung „ohne Kanzlei-Honorar" + Fuchs-im-Anzug = Schlitzohr-Trope = Trust-Killer).
- **Figur = erwachsener, kompetenter Lotse/Verbündeter** (Mentor, nicht Held, nicht Clown): warm-aufmerksame Augen (NIE listig/verengt), ruhiges Lächeln, hält Tablet („ich zeig dir, wo du stehst").
- **Mint `#34d99a`** als Akzent (Haken, Tablet-UI, Schweifspitze) → Tie-in zur Live-LP (dunkles Indigo + Mint).
- **Accessibility-Mal = Mint-Haken / a11y-Mark statt Rollstuhl-Piktogramm** (Rollstuhl = zu enge A11y-Darstellung + Paternalismus-Risiko bei den BFSG-Multiplikatoren).
- **Tablet-UI auf Deutsch:** „Barrierefreiheits-Score", „Report", „Umsetzungsplan", „Re-Check-Abo" (= unsere Pakete). Keine „BFSG-konform/garantiert"-Claims (UWG §5).
- **Logo:** Kunden-Lockup = Fuchs-Emblem + klare Wortmarke **„BFSG-Fuchs"**; „a11y" nur als sekundäres Insider-/Favicon-Mark (für KMU-Käufer opak); Esports-Stil entschärft → korporativ-vertrauenswürdig; warme Augen.
- **Referenz-Renders** (diese Session, Higgsfield): `docs/brand/bfsg-fuchs-logo-*.png` + `docs/brand/bfsg-fuchs-mascot-*.png`. **Generator-Text ist nur indikativ** — finale Typografie/Tablet-UI im Vektor-/Design-Tool sauber setzen.
- **Optionaler Eigenname** der Figur: „Filo, der BFSG-Fuchs" (für die Voice; optional).

## 4. Reihenfolge (zwingend)

1. **Erst der echte Engpass:** bezahlter-Scan-TLS-Bug ([[paid-scan-strict-tls]]) + erste Sales. Branding blockiert das nicht, ist aber nachrangig.
2. **Markenrecht-Pflichtcheck:** DPMA/EUIPO auf „BFSG-Fuchs" (Wortmarke Klassen **42/35/41**) + Fuchs-Bildmarke (Wiener-Bildklasse **03.01**); Abgrenzung Schwäbisch-Hall-Fuchs (Kl. 36); Kollision vs. „BFSG CHECK" (gering, da „BFSG" kennzeichnungsschwach — anwaltlich bestätigen). DPMA prüft ältere Rechte NICHT.
3. **ü/ue-IDN-Domain** (`barrierefrei-prüfen.de` mit Umlaut) Besitz klären/sichern → Redirect.
4. **Rebrand-Code-Umbau:** PR-#92-Mechanik retargeten auf „BFSG-Fuchs" / `bfsg-fuchs.de`. „BFSG" als Gesetz bleibt; nur Marke + Primärdomain + Mail-Domain ändern.
5. **DNS/Caddy/Infra (Owner):** `bfsg-fuchs.de` = neue Primär (TLS); `barrierefrei-pruefen.de` + `bfsg-held.de` + `bfsg-fix.de` → 301 auf bfsg-fuchs.de. Brevo-Sender-Domain `bfsg-fuchs.de` (DKIM). Stripe success/cancel + Webhook → neue Domain. Server-`.env` (`PUBLIC_URL`/`FROM_*`/`INVOICE_CONTACT_EMAIL` → bfsg-fuchs.de). Catch-all `*@bfsg-fuchs.de → matze.seba@outlook.de`.
6. **Mascot-Integration** (`landingpage-next/`, eigener Branch): Logo + Filo-Figur (Hero, Scan-Lade-Animation, Report-Guide, Fehler/404, Mail-Header). **A/B-Test** (Fuchs-Hero vs. nüchtern) vor Vollintegration. `legal-copy-grep` auch auf Mascot-Copy.
7. **Wort-/Bildmarke anmelden** (BFSG-Fuchs + Fuchs-Logo, Kl. 42/35/41) — das schützbare Asset.

## 5. Guardrails

- Fuchs IMMER erwachsener, kompetenter Guide — nie verspielt/listig (Trickster-Risiko im Rechtsthema). Immer **neben harten Proofs** (WCAG-Score, Beispiel-Report). Gesetz nie verharmlosen. Pflicht-Sprache (keine „BFSG-konform"/„rechtssicher"/„garantiert"/Siegel).
- Kein blindes Suchen-Ersetzen: „BFSG" (Gesetz/Keyword, Paketnamen „BFSG-Report") bleibt; nur die Marke + Domain wechseln.

## 6. Assets / Status

- 6-Linsen-Berichte (Entscheidungsgrundlage): `docs/brand/domain-fox-3way-reports.md`
- Referenz-Renders (refined, Option B): `docs/brand/bfsg-fuchs-logo-*.png`, `docs/brand/bfsg-fuchs-mascot-*.png`
- Charakter-Konzept (Charta/Visual/Voice/Claims): `docs/brand/filo-concept.json` — **Architektur-Teil darin überholt** (galt für die Layer-Variante), Charakter-/Voice-/Visual-Teil weiter gültig.
- Memory: [[mascot-filo-decision]], [[rebrand-barrierefrei-pruefen]].
- PR #93 (Branch `brand/filo-mascot-concept`) trägt Entscheidung + diesen Handover.

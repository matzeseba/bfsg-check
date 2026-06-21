---
type: resource
created: 2026-06-21
tags: [business, bfsg-check, kontext]
links: ["[[INDEX]]", "[[03-RESOURCES/Preise-und-Pakete]]", "[[06-LEGAL/Compliance-Uebersicht]]"]
---

# BFSG-Check — Business-Kontext

## Was ist BFSG-Check?

Automatisierter Compliance-Scanner für deutsche Websites — prüft auf BFSG (Barrierefreiheitsstärkungsgesetz), WCAG 2.1 AA und TDDDG-Konformität.

**Positionierung:** B2B SaaS, Solo-Betrieb (Matthias Seba, Kutenholz).  
**Steuer:** § 19 UStG Kleinunternehmer (unter 30k€/Jahr).  
**Domain:** bfsg-fix.de — Hetzner Cloud CPX22, Nürnberg, Ubuntu 24.04.

## Tech-Stack (Produkt)

- **Backend:** Node.js + Express + Playwright + axe-core + Stripe
- **Landing:** Next.js (Tailwind v4 + shadcn, base-nova style)
- **Admin:** Next.js Admin-Dashboard
- **Scanner:** Playwright-basiert, axe-core für WCAG-Checks

## Status (Stand 21.06.2026)

Live. Health-Endpoint: `GET https://bfsg-fix.de/health` → `{ok:true, stripe:true, live:true, mailer:aktiv}`.

Stripe ist im **Live-Mode** (Restricted Key `rk_live_*`).

## Verbindungen

- Preise & Pakete: [[03-RESOURCES/Preise-und-Pakete]]
- Was darf vermarktet werden: [[06-LEGAL/Compliance-Uebersicht]]
- Technische Architektur: [[02-AREAS/Technik]]
- Strategie: [[01-PROJECTS/BFSG-Check-Launch]]

---

## Gegenrede

*Welches Risiko wird unterschätzt?* — Der BFSG tritt für neue Produkte ab 28.06.2025 in Kraft. Für bestehende Produkte gilt eine Übergangsfrist bis 2030. Der Markt-Urgency-Druck ist real, aber zeitlich begrenzt — wir müssen skalieren, bevor der Hype abflaut oder Wettbewerber die SEO-Rankings belegen.

---
*Links: [[INDEX]] · [[03-RESOURCES/Preise-und-Pakete]] · [[06-LEGAL/Compliance-Uebersicht]]*

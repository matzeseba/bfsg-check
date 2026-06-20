# Legal-Templates — Selber-Lösen-Bausteine

> **Disclaimer:** Vorlagen basierend auf Recherche der aktuellen DACH-Praxis 2026.
> **KEIN Rechtsrat.** Bei Unsicherheit Fachanwalt fragen.
> Quellen: siehe `docs/LEGAL-REALITY-CHECK-2026.md`

---

## Files in diesem Ordner

| File | Was | Wo einbauen |
|---|---|---|
| `disclaimer-footer.md` | Disclaimer für jeden Report + Landing-Footer | scanner/lib/pdf-template, landingpage-next |
| `agb-haftungs-cap.md` | Haftungs-Cap-Klausel (B2B + B2C) | AGB-Seite |
| `agb-best-effort.md` | „Best-Effort"-statt-Garantie-Klausel | AGB-Seite |
| `pre-sale-verbraucher-frage.md` | Checkout-HTML für Unternehmer/Verbraucher | landingpage-next/checkout |
| `cookie-banner-spec.md` | 2-Button-Banner-Spec (TDDDG-konform) | landingpage-next/components |
| `widerrufsbutton-356a.md` | Widerrufs-Button-Implementation für 19.06.2026 | landingpage-next/account-page |
| `dpa-checkliste.md` | DPA-Sammlung-Checkliste (Brevo/Stripe/Sentry) | docs/dpa/ Ordner |
| `rechnungs-template.md` | § 19 UStG Rechnungs-Pflichtangaben | scanner/lib/invoice.js |
| `wortwahl-rdg-safe.md` | Sprach-Regeln gegen RDG-Risiko | überall (Marketing, Reports) |
| `trigger-kalender.md` | Schwellen für VSH/Anwalt | Notion-Dashboard |

---

## Reihenfolge der Implementation (Tag 1-3, 4h total)

| # | Wann | Was | Aufwand |
|---|---|---|---|
| 1 | Tag 1, 30 Min | `disclaimer-footer.md` in PDF + Landing | 30 Min |
| 2 | Tag 1, 30 Min | `wortwahl-rdg-safe.md` Suche+Ersetze in Marketing-Texten | 30 Min |
| 3 | Tag 2, 60 Min | `agb-haftungs-cap.md` + `agb-best-effort.md` in AGB-Seite | 60 Min |
| 4 | Tag 2, 30 Min | `pre-sale-verbraucher-frage.md` in Checkout | 30 Min |
| 5 | Tag 3, 30 Min | `cookie-banner-spec.md` Reject-Button-Gleichgewicht | 30 Min |
| 6 | Tag 3, 30 Min | `dpa-checkliste.md` abarbeiten (Brevo/Stripe/Sentry DPA download) | 30 Min |
| 7 | Tag 3, 30 Min | `rechnungs-template.md` lexoffice-Account + Pflichtangaben | 30 Min |
| 8 | Tag 4 (optional) | `widerrufsbutton-356a.md` — Deadline 19.06.2026 | später |
| 9 | Tag 5 (sofort fertig) | `trigger-kalender.md` in Notion einrichten | 10 Min |

**Total: ~4h Founder-Zeit + 25 €/Monat Fixkosten (AGB-Service 15€ + Buchhaltung 10€)**

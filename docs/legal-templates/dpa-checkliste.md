# DPA-Sammlung-Checkliste

> **Zeit:** 30 Minuten
> **Zweck:** Alle DSGVO Art. 28 Auftragsverarbeitungs-Verträge (AVV/DPA) als PDF sammeln + in `docs/dpa/` ablegen + in Datenschutz-Seite verlinken.

---

## Anbieter-Liste

### 1. Brevo (E-Mail-Versand)

**URL:** https://help.brevo.com/hc/en-us/articles/15403782599570-Where-can-I-find-the-Data-Processing-Agreement-DPA

**So gehts:**
1. Brevo-Web-UI einloggen
2. **Settings → Compliance & Privacy → Data Processing Agreement**
3. Click **„Download DPA"** → PDF wird generiert
4. Speichern als `docs/dpa/brevo-dpa-YYYY-MM.pdf`

**Verlinken in Datenschutz:**
```
"E-Mail-Versand und Newsletter: Sendinblue SAS (Brevo), 7 rue de Madrid, 
75008 Paris, Frankreich. Wir haben einen Auftragsverarbeitungs-Vertrag 
nach Art. 28 DSGVO abgeschlossen."
```

---

### 2. Stripe (Zahlungsabwicklung)

**URL:** https://stripe.com/legal/dpa

**Besonderheit:** Stripe ist überwiegend **eigenständig Verantwortlicher** (nicht Auftragsverarbeiter). Dennoch bietet Stripe eine DPA für die Teile, in denen sie als Verarbeiter agieren.

**So gehts:**
1. https://stripe.com/legal/dpa öffnen
2. DPA als PDF herunterladen (oben rechts „Download PDF")
3. Speichern als `docs/dpa/stripe-dpa-YYYY-MM.pdf`

**Verlinken in Datenschutz:**
```
"Zahlungsabwicklung: Stripe Payments Europe, Limited, 1 Grand Canal Street 
Lower, Grand Canal Dock, Dublin, Irland. Stripe agiert teils als 
eigenständiger Verantwortlicher, teils als Auftragsverarbeiter; wir haben 
die Stripe-DPA akzeptiert (https://stripe.com/legal/dpa)."
```

---

### 3. Hetzner (Hosting)

**URL:** https://www.hetzner.com/AV/

**So gehts:**
1. https://www.hetzner.com/AV/ öffnen
2. Es gibt 2 Versionen: „Auftragsverarbeitungs-Vereinbarung" und „Anlage zur AV"
3. BEIDE als PDF runterladen
4. Speichern als `docs/dpa/hetzner-av-YYYY-MM.pdf` und `docs/dpa/hetzner-anlage-YYYY-MM.pdf`

**Verlinken in Datenschutz:**
```
"Server-Hosting: Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, 
Deutschland. Auftragsverarbeitungs-Vereinbarung nach Art. 28 DSGVO 
abgeschlossen (verfügbar unter hetzner.com/AV)."
```

---

### 4. Sentry (Fehler-Tracking) — falls aktiviert

**URL:** https://sentry.io/legal/dpa

**So gehts:**
1. https://sentry.io/legal/dpa öffnen
2. Falls Sentry-Account: in **Settings → Organization → Legal & Compliance** signing-link
3. Click „Sign DPA" (Click-Wrap, kein PDF-Download nötig)
4. Bestätigungs-Mail erscheint → archivieren als `docs/dpa/sentry-confirmation.eml`

**Verlinken in Datenschutz:**
```
"Fehler-Tracking: Functional Software, Inc. d/b/a Sentry, 132 Hawthorne 
Street, San Francisco, CA 94107, USA. Click-Wrap-DPA akzeptiert (siehe 
sentry.io/legal/dpa). Datenübermittlung in die USA auf Basis 
Standardvertragsklauseln + EU-US Data Privacy Framework."
```

**Wichtig:** Sentry wird oft mit PII-Filtern (`beforeSend`) konfiguriert. Bei Barrierefrei-Prüfen: pii-redaction in `scanner/lib/logger.js` aktiv lassen.

---

### 5. Cloudflare (CDN, falls aktiv)

**URL:** https://www.cloudflare.com/cloudflare-customer-dpa/

**So gehts:**
1. https://www.cloudflare.com/cloudflare-customer-dpa/ öffnen
2. PDF runterladen, signieren (digital oder ausgedruckt)
3. Speichern als `docs/dpa/cloudflare-dpa-YYYY-MM.pdf`

**Verlinken in Datenschutz:**
```
"Content Delivery Network: Cloudflare Germany GmbH, Rosental 7, c/o 
Mindspace, 80331 München. DPA gemäß Art. 28 DSGVO abgeschlossen."
```

---

### 6. Google Analytics 4 (falls aktiv für Conversion-Tracking)

**URL:** https://support.google.com/analytics/answer/9019185

**So gehts:**
1. Google Analytics Admin → Konto-Einstellungen → **Datenverarbeitungsänderungs-Vereinbarungen**
2. „Ich akzeptiere die Bedingungen" anklicken (Click-Wrap)
3. Screenshot der Bestätigung speichern als `docs/dpa/ga4-acceptance.png`

**Verlinken in Datenschutz:**
```
"Web-Analyse: Google Analytics 4 (Google Ireland Limited, Gordon House, 
Barrow Street, Dublin 4, Irland). DPA via DSGVO-Vertragszusatz 
akzeptiert. IP-Anonymisierung aktiv. Daten-Transfer in die USA auf 
Basis SCC + EU-US Data Privacy Framework."
```

---

### 7. INWX (DNS-Registrar) — keine DPA nötig

INWX ist nur DNS-Provider, verarbeitet keine personenbezogenen Daten unserer Endkunden. **Skip.**

---

## docs/dpa/ Ordner-Struktur

```
docs/
└── dpa/
    ├── README.md                          # Diese Übersicht
    ├── brevo-dpa-2026-06.pdf
    ├── stripe-dpa-2026-06.pdf
    ├── hetzner-av-2026-06.pdf
    ├── hetzner-anlage-2026-06.pdf
    ├── sentry-confirmation.eml             # falls aktiv
    ├── cloudflare-dpa-2026-06.pdf         # falls aktiv
    └── ga4-acceptance.png                  # falls aktiv
```

---

## Datenschutz-Seite (landingpage-next/app/datenschutz/page.tsx)

In der Sektion „Auftragsverarbeiter" einfügen:

```tsx
<h2>Auftragsverarbeiter nach Art. 28 DSGVO</h2>
<p>Wir setzen folgende externe Dienstleister ein, mit denen 
   Auftragsverarbeitungs-Verträge geschlossen wurden:</p>

<table>
  <thead>
    <tr>
      <th>Dienstleister</th>
      <th>Zweck</th>
      <th>Sitz</th>
      <th>DPA-Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Hetzner Online GmbH</td>
      <td>Server-Hosting</td>
      <td>Deutschland</td>
      <td><a href="https://www.hetzner.com/AV/">Hetzner AV</a></td>
    </tr>
    <tr>
      <td>Stripe Payments Europe Ltd</td>
      <td>Zahlungsabwicklung</td>
      <td>Irland</td>
      <td><a href="https://stripe.com/legal/dpa">Stripe DPA</a></td>
    </tr>
    <tr>
      <td>Sendinblue SAS (Brevo)</td>
      <td>E-Mail-Versand</td>
      <td>Frankreich</td>
      <td>im Brevo-Account verfügbar</td>
    </tr>
    <!-- ggf. Sentry, Cloudflare, GA4 ergänzen -->
  </tbody>
</table>

<p>Alle Verträge sind als PDF archiviert und können auf Anfrage 
   (datenschutz@matthias-seba.de) eingesehen werden.</p>
```

---

## Audit-Trail

Nach Abschluss:
```
- [ ] Brevo DPA Stand YYYY-MM-DD
- [ ] Stripe DPA Stand YYYY-MM-DD
- [ ] Hetzner AV Stand YYYY-MM-DD
- [ ] Sentry DPA Stand YYYY-MM-DD (falls aktiv)
- [ ] Cloudflare DPA Stand YYYY-MM-DD (falls aktiv)
- [ ] GA4-Acceptance Screenshot YYYY-MM-DD (falls aktiv)
- [ ] Alle 6 Files in docs/dpa/ committed
- [ ] Datenschutz-Seite mit Auftragsverarbeiter-Tabelle aktualisiert
- [ ] Alle 6 DPAs in physisch oder Cloud-Backup (10 Jahre Aufbewahrungspflicht)
```

---

## Renewal-Reminder

DPAs werden manchmal aktualisiert. Setze einen Kalender-Reminder:

| Anbieter | Frequenz | Trigger |
|---|---|---|
| Alle DPAs | jährlich | 1. Werktag im Januar |

Bei Anbieter-Update: Original-PDF behalten, neue Version als `_v2` ablegen, Datenschutz-Seite anpassen.

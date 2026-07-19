# AOS Live-Anbindung — Master-Blueprint (One-Shot fuer Agenten-Teams)

> Datum: 2026-07-15 · Chef-Architekt-Konsolidierung von drei Feature-Specs (E-Mail-Inbound, Stripe-Live, Live-Tracking) gegen den realen Code auf `origin/main` (HEAD `d556d34`).
> SSOT der AOS-Architektur: `aos/ARCHITECTURE.md`. Dieser Blueprint ist verbindlich; wo er von den Einzel-Specs abweicht, GILT DIESER BLUEPRINT (die Abweichungen loesen verifizierte Konflikte auf, siehe §0.3).

---

## 1. Executive Summary + Zielbild

Das AOS-Business-Dashboard (`aos.bfsg-fuchs.de`) wird von Demo-Daten auf drei echte Live-Datenquellen umgestellt, ohne einen einzigen neuen Container und ohne Caddyfile-Aenderung. **Feature 1 (E-Mail-Inbound):** eingehende Mails an `info@bfsg-fix.de` erscheinen ueber einen IMAP-Poll eines Kopie-Postfachs als `InboxItem(source="live")` im CRM-Hub und lassen sich per Klick ueber Brevo beantworten. **Feature 2 (Stripe-Live):** das Finanzmodul liest Umsatz, Gebuehren, MRR, Paket-Split und §19-Jahres-Ist direkt aus Stripe, sobald der Restricted Key die noetigen Read-Scopes hat, mit sauberem Demo-Fallback + entprellter Scope-Notification. **Feature 3 (Live-Tracking):** ein cookieloses, consent-freies First-Party-Beacon plus serverseitige Funnel-Instrumentierung im Scanner speist eine Besucher-/Funnel-Ansicht (Pageviews, Gratis-Check-Starts, DOI-Funnel, Conversion, Quellen). Zielbild: Der Owner sieht nach Abschluss auf einem Blick echte Anfragen, echten Umsatz und echten Traffic — DSGVO-/UWG-konform, RAM-neutral, deploybar ueber genau zwei PRs.

---

## 2. Verbindliche Vorab-Fakten (Ist-Stand verifiziert)

### 2.1 Server & RAM
- Hetzner `178.105.83.0`, Ubuntu 24.04, 2 vCPU, 3,8 GB RAM + 2G-Swapfile (seit 09.07., wird von `deploy-aos.yml` idempotent gesichert). AOS-Gesamtbudget laut `aos/ARCHITECTURE.md` §0/§2: **≤ 1,2 GB, strikte `mem_limit` pro Container.** Scan-Container spiked bis 3g.
- **RAM-Budget je neuem Prozess dieses Blueprints: 0.** Kein neuer Container, kein neuer Daemon-Prozess. Alle drei Features laufen in bereits laufenden Prozessen:
  - IMAP-Poll + Traffic-Poll = APScheduler-Jobs im bestehenden `aos-backend` (`mem_limit: 512m`, unveraendert). `imaplib` ist Python-Stdlib → keine neue Dependency.
  - Stripe-Live = reine Code-Aenderung in `aos-backend`.
  - Scanner-Tracking = In-Prozess-JSONL im bestehenden `bfsg-app` (wenige KB In-Memory + Append-Datei im `bfsg_data`-Volume).
- **Regel:** Jedes zusaetzliche RAM-Budget muss begruendet + minimal sein. Dieser Blueprint braucht keins.

### 2.2 Deploy-Regeln
- Deploy **nur** via PR-Merge auf `main`.
  - `deploy.yml` triggert bei `scanner/**`, `landingpage-next/**`, `deployment/**` u. a. (Live-SaaS-Stack, Compose-Projekt `deployment`).
  - `deploy-aos.yml` triggert bei `aos/**` und `.github/workflows/deploy-aos.yml` (Compose-Projekt `aos`).
- Agenten haben **KEINEN** SSH-/Prod-Zugriff (classifier-gated). Server-Schritte NUR als CI-Script-Erweiterung (in `deploy-aos.yml`) oder als dokumentierte Owner-Aktion (§3).
- PR-Gate: `.github/workflows/pr-ci.yml` (aktuell 3 Jobs: `scanner-tests`, `landingpage-build`, `legal-grep`; laeuft secret-frei).

### 2.3 Legal-Leitplanken (STRIKT — im Design verankert)
- **DSGVO/TDDDG:** Tracking cookieless + consent-frei. Keine persistenten Identifier; IP nur als `sha256(taeglich rotierendes In-Memory-Salt + IP + UA)[:16]` (die rohe IP wird NIE geschrieben); nur Aggregate verlassen den Scanner. DNT/GPC client- UND serverseitig respektiert. Kein Cookie/localStorage → kein §25-TDDDG-Consent, kein Cookie-Banner-Trigger.
- **UWG §7 (Cold-Mail-Verbot):** Das Postfach loest KEINE ausgehenden Auto-Mails aus. Antworten NUR per manuellem Klick (Endpunkt `POST /api/inbox/{id}/reply`). Kein LinkedIn/Scraping.
- **UWG §5 (Irrefuehrung):** In keinem generierten/gesendeten Text „BFSG-konform / rechtssicher / garantiert / TÜV / DEKRA". Antwort-Entwuerfe durchlaufen weiterhin den `ai.py`-Backstop (`_sanitize` + `_contains_forbidden`, `FORBIDDEN_TERMS`).
- Datenminimierung: 90-Tage-Retention fuer geschlossene Live-Anfragen; Roh-Events 30 Tage (Compact-on-Read); langfristig nur Tages-Aggregate.

### 2.4 P0-Caddy-Lehre (09.07.)
- Caddyfile-Inline-`handle`-Syntax hat die Live-Site gekillt; der AOS-Vhost wurde per Hotfix (PR #143, `6abca4f`) mit Multi-Line-`handle`-Bloecken repariert.
- **Dieser Blueprint aendert `deployment/Caddyfile` an KEINER Stelle.** Alle Routen existieren bereits:
  - Hauptdomain `/api/*` + `/admin/*` → `app:8080` (Scanner). CSP `connect-src 'self'` deckt das same-origin `sendBeacon`.
  - `aos.bfsg-fuchs.de` `/api/*` → `aos-backend:8100`.
- **Break-glass (nur falls eine Caddyfile-Aenderung doch unvermeidbar wird — dann PFLICHT-Verify):**
  ```bash
  docker run --rm -v ./Caddyfile:/etc/caddy/Caddyfile:ro caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile
  ```

### 2.5 Ist-Stand `main` (verifiziert)
- **PR #144 IST GEMERGT** (`d556d34`, `f75770c`): Tabelle `auth_credential` (Modell `AuthCredential` in `aos/backend/app/models.py`) existiert, `/set-password`-Flow + `auth.setPassword` im Frontend live. Der Bootstrap-Token `AOS_ADMIN_TOKEN` bleibt Recovery-Zugang. **Kein Feature dieses Blueprints fasst Auth an.**
- AOS-Stack (PR #142/#143) live auf `aos.bfsg-fuchs.de`.
- `aos/backend/requirements.txt` enthaelt bereits `pytest>=8.0` + `pytest-asyncio>=0.24` → im CI genuegt `pip install -r requirements.txt` (KEIN separates `pip install pytest`).
- `aos/frontend/package-lock.json` existiert → `npm ci` funktioniert.
- Tests laufen im Demo-Modus: `aos/backend/tests/conftest.py` entfernt `ANTHROPIC_API_KEY/STRIPE_SECRET_KEY/BREVO_API_KEY/PERPLEXITY_API_KEY`, setzt `AOS_DISABLE_SCHEDULER=true`, und die Autouse-Fixture `_reset_auth_credential` leert `auth_credential` vor jedem Test.
- Verankerte Regressionstests, die GRUEN bleiben MUESSEN: `test_dashboard.py::test_dashboard_summary_shape` (`services_total==9`, exakt 9 Summary-Keys), `test_adapters.py::test_health_services_shape` (9 Services), `test_inbox.py::test_list_inbox_seeded` (8 Seeds, `_SUMMARY_KEYS`), `test_adapters.py::test_finance_thresholds_shape` (Shape unveraendert).

### 2.6 Build-Umgebung naechste Session
- Windows-Host, Node 24, Python 3.14 lokal, KEIN lokales Docker. Lokale Verifikation = `npm run build`/`tsc` + `pytest`. Docker-Builds macht ausschliesslich CI/Server. CI-Runner: Python 3.12 (Code nutzt nur stdlib `zoneinfo`/`imaplib` → 3.12-kompatibel), Node 22.

---

## 3. Owner-Aktionen VOR der Session (Blocker-Checkliste)

> Alles hier Aufgefuehrte kann die Session sonst blockieren oder das Live-Ergebnis unsichtbar lassen. Reihenfolge egal, aber alle vor dem finalen Merge/Live-Test erledigen. Die Session selbst braucht KEINE dieser Aktionen zum Bauen/Testen (alles faellt sauber auf Demo zurueck) — sie sind fuer den Live-Betrieb.

### 3.1 INWX — dediziertes Kopie-Postfach fuer E-Mail-Inbound (Feature 1)
1. Einloggen unter `kundenlogin.inwx.de` (Achtung: `.de`-Account ≠ `.com`-Account).
2. Domain `bfsg-fix.de` → Menue **E-Mail** → **„E-Mail-Konto/Postfach anlegen"** (NICHT nur Weiterleitung). Empfohlene Adresse: `crm@bfsg-fix.de`, starkes Passwort setzen.
   - HINWEIS: „Mail Easy" kann nur Weiterleitung. Erscheint kein „Konto anlegen", im selben Menue auf ein Paket mit echten Postfaechern upgraden (INWX Mailspace/Hosting, wenige Euro/Monat).
3. In den Postfach-/Programm-Einstellungen den **exakten IMAP-Server-Namen + Port (SSL 993)** notieren.
4. Bestehende Weiterleitung `info@bfsg-fix.de → matze.seba@outlook.de` um einen **ZWEITEN Empfaenger** `crm@bfsg-fix.de` ergaenzen (Outlook-Ziel NICHT entfernen). **MX-Records NICHT anfassen.**
5. Test-Mail an `info@bfsg-fix.de` senden und pruefen, dass sie SOWOHL im Outlook-Postfach ALS AUCH im neuen `crm@`-Postfach ankommt.

### 3.2 GitHub — 3 neue Repository-Secrets (Feature 1)
`Repo matzeseba/bfsg-check → Settings → Secrets and variables → Actions → „New repository secret"`, exakte Namen:
| Secret-Name | Wert |
|---|---|
| `AOS_IMAP_HOST` | der notierte INWX-IMAP-Server (z. B. `imap.ispgateway.de` — realen Wert aus 3.1.3 einsetzen) |
| `AOS_IMAP_USER` | `crm@bfsg-fix.de` |
| `AOS_IMAP_PASSWORD` | das Postfach-Passwort aus 3.1.2 |

Diese greifen erst NACH dem Merge beim naechsten `aos`-Deploy (upsert in Server-`.env`).

### 3.3 Stripe — Restricted-Key-Scopes erweitern (Feature 2)
Am EIGENEN Geraet (Stripe-Dashboard ist im Server-Browser gesperrt):
`Stripe-Dashboard → Entwickler → API-Schluessel → den produktiven Restricted Key (`rk_live_…`) oeffnen → „Berechtigungen bearbeiten"` → je auf **Lesen (Read)** setzen:
| Stripe-Resource | Level | Wofuer |
|---|---|---|
| **Charges** | Read | gross/net/refund/sparkline/invoices/YTD |
| **Balance transactions** | Read | echte Gebuehren (sonst geschaetzt 1,9 %) |
| **Subscriptions** | Read | MRR, aktive Abos |
| **Checkout Sessions** | Read | exakte Paketzuordnung (`metadata.pkg`) |

NICHT noetig: Balance, Refunds, Invoices, irgendein Write. Speichern — **der Key-Wert aendert sich NICHT** (kein `.env`-/Secret-Update noetig). Danach max. 10 Min warten (Cache-TTL) oder `aos`-Deploy anstossen.

### 3.4 Brevo (Feature 1, meist keine Aktion)
Nur pruefen, dass in Brevo der Absender `no-reply@bfsg-fuchs.de` weiterhin aktiv/DKIM-verifiziert ist (`Brevo → Senders & IP → Senders`). Reply-To `info@bfsg-fix.de` braucht keine Verifizierung (nur Header).

### 3.5 Landingpage-Copy-Freigabe (Feature 3)
Auf `landingpage-next/components/ScanForm.tsx:200` steht „ohne Tracker". Bestaetigen, dass ein cookieloser, DNT/GPC-respektierender Aggregat-Zaehler damit vereinbar ist (juristisch unkritisch, aber Owner-Entscheidung). Sonst Wortlaut vor Merge auf z. B. „ohne Cookies, ohne Werbe-Tracker" anpassen (dann als Mini-Edit im Scanner/Landing-PR mitnehmen).

### 3.6 Merge-Timing (Feature 3 / PR-1)
PR-1 aendert `scanner/**` UND `landingpage-next/**` → Merge loest den LIVE-SaaS-Redeploy aus. In verkehrsarmer Zeit mergen, danach `https://bfsg-fuchs.de/health` auf `ok:true` beobachten (GitHub → Actions → „Deploy"-Run gruen abwarten).

---

## 4. Die 3 Feature-Specs (integriert & konsistent)

> Alle Datei-Pfade repo-relativ. „Content-Anker" = die eindeutige Codestelle; Zeilennummern sind Stand `origin/main` und koennen um wenige Zeilen abweichen — IMMER am Content-Anker orientieren, nicht blind an der Nummer.

### 4.A Feature 1 — E-Mail-Inbound (`info@bfsg-fix.de` → AOS-CRM)

**Mechanismus (entschieden):** IMAP-Poll eines dedizierten Kopie-Postfachs. Kein MX-Eingriff, reine User/Pass-Auth, providerneutral. Brevo-Inbound (MX+Plus-Tarif) und Outlook-OAuth (Consumer-only, kein Dauerbetrieb) verworfen.

#### A.1 DB — additive InboxItem-Felder + Migration
`aos/backend/app/models.py`, Content-Anker: `class InboxItem` (aktuelle Felder bis `updated_at`). Drei **nullable** Felder ergaenzen:
```python
    external_id: Optional[str] = Field(default=None, index=True)   # RFC822 Message-ID (Dedup)
    reply_to: Optional[str] = Field(default=None)                  # Ziel-Adresse fuer Antworten
    sent_reply_at: Optional[datetime] = Field(default=None)        # Zeitpunkt gesendeter Antwort
```
`aos/backend/app/db.py`, Content-Anker: `def init_db()`. **PFLICHT** (SQLModel `create_all` erweitert bestehende Tabellen NICHT):
```python
def init_db() -> None:
    from . import models  # noqa: F401
    SQLModel.metadata.create_all(engine)
    _ensure_inbox_columns()

def _ensure_inbox_columns() -> None:
    """Idempotente additive Migration (SQLite ALTER TABLE ADD COLUMN)."""
    additive = {"external_id": "VARCHAR", "reply_to": "VARCHAR", "sent_reply_at": "DATETIME"}
    with engine.begin() as conn:
        existing = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(inbox_items)")}
        for col, sqltype in additive.items():
            if col not in existing:
                conn.exec_driver_sql(f"ALTER TABLE inbox_items ADD COLUMN {col} {sqltype}")
        conn.exec_driver_sql(
            "CREATE INDEX IF NOT EXISTS ix_inbox_items_external_id ON inbox_items(external_id)"
        )
```
> ⚠️ Konflikt-Hinweis: `init_db()` legt auch die NEUE Tabelle `traffic_daily` (Feature 3) via `create_all` an — Reihenfolge `create_all` DANN `_ensure_inbox_columns` ist korrekt. `db.py` gehoert **Paket 0** (§5), damit Feature 1 und Feature 3 nicht kollidieren.

#### A.2 Ingestion-Service (neu) — `aos/backend/app/services/mailbox.py`
Muster: Adapter-`is_live()` + Demo-Fallback; nutzt intern `session_scope()`.
- `is_live(settings) -> bool` = `bool(settings.imap_host and settings.imap_user and settings.imap_password)`.
- `poll_inbox() -> int` (Scheduler-Job, Zahl neu importierter Mails):
  1. `settings = get_settings()`; wenn nicht `is_live` → `return 0` (kein Verbindungsversuch).
  2. `imaplib.IMAP4_SSL(host, port, timeout=20)` → `login` → `select(mailbox)` (nicht readonly).
  3. `imap.uid("SEARCH", None, "UNSEEN")`; **max. `_MAX_PER_POLL = 50`** pro Zyklus, Rest naechster Lauf.
  4. Pro UID `FETCH (BODY.PEEK[])` → `email.message_from_bytes`; Verarbeitung je Mail in **eigenem try/except** (eine kaputte Mail kippt die anderen nicht); danach `STORE +FLAGS \Seen`.
  5. `_is_junk(msg, from_email) -> bool` verwirft (nur `\Seen`, kein Insert). **Verbindliche Logik (NICHT allein am no-reply-Localpart droppen — sonst gehen Kontaktformular-/Relay-Leads still verloren, deren echte Kundenadresse nur im `Reply-To`/Body steht):**
     - `auto_signal = (Header "Auto-Submitted" vorhanden und Wert-Localpart != "no") ODER (Header "Precedence" (lowercased) in {"bulk","auto_reply","junk"}) ODER (Header "X-Autoreply" ODER "X-Autorespond" vorhanden)`.
     - `local = from_email.split("@",1)[0].lower()`.
     - **Hard-System-Absender (IMMER Junk, tragen nie eine Kundenanfrage):** `local in {"mailer-daemon","postmaster","bounce","bounces"}` → `return True`.
     - **Auto-generierte Mail (IMMER Junk):** `auto_signal` → `return True`.
     - **`no-reply`/`noreply`-Absender:** `local in {"no-reply","noreply"}` → NUR Junk, wenn `auto_signal` (oben bereits abgefangen) → hier also `return False` (INSERT). Solche Formular-Relays/Benachrichtigungen tragen die eigentliche Anfrage im Body; die echte Antwort-Adresse kommt aus `Reply-To` (siehe `_build_item`). Die spätere KI-Priorisierung + 90-Tage-Retention (§4.A.3) filtern etwaigen Rest-Lärm, ohne echte Leads zu verwerfen.
     - Sonst `return False`.
  6. Dedup: `select(InboxItem).where(InboxItem.external_id == mid).first()` → vorhanden → ueberspringen.
  7. `prio, reason = ai.priorisiere_inbox(settings, item_dict)` (existiert, Signatur `(settings, item)`; ohne Key Heuristik-Fallback).
  8. Insert `InboxItem(source="live", channel="email", status="open", priority=prio, priority_reason=reason, subject, sender, reply_to, external_id, body, preview)` + `commit`.
  9. Pro importierter Mail eine `Notification(level="lead" if prio==1 else "info", title=f"Neue Anfrage: {subject}", body=preview)`.
  10. `imap.logout()` in `finally`. Bei `imaplib.IMAP4.error`/`OSError`/`socket.timeout`: `log.warning(...)` + `return <bisheriger Count>`.
- `_build_item(msg) -> dict`:
  - `from_name, from_email = parseaddr(msg.get("From",""))` → `sender = from_email.lower()` (**nur Adresse**, kein Display-Name — sonst bricht `_collect_lead_candidates` in `scheduler.py` bei `sender.split("@")[-1]`).
  - `reply_to = (parseaddr(msg.get("Reply-To",""))[1] or from_email).lower()`.
  - `external_id = (msg.get("Message-ID") or "").strip()`; leer → `f"nomid:{sha1(from+subject+date)}"` (verhindert Endlos-Reimport).
  - `subject`: `email.header.make_header(decode_header(...))`, max 300 Zeichen.
  - Body: erster `text/plain`-Part (nicht-Attachment), `get_content_charset()` mit utf-8-Fallback, `errors="replace"`; nur HTML → Tags grob strippen; auf **20.000** Zeichen kappen.
  - Attachments v1 = ignorieren + Hinweiszeile: `Content-Disposition: attachment`-Parts zaehlen; `> 0` → ans Body-Ende: `"\n\n[Hinweis: <n> Anhang/Anhaenge in der Original-Mail — im Dashboard nicht dargestellt. Original im Postfach crm@bfsg-fix.de.]"`.
  - `preview`: erste 140 Zeichen, Zeilenumbrueche → Leerzeichen.
- `_ingest_message(session, settings, msg) -> InboxItem | None` (Test-Hook, kapselt Schritte 5–9 ohne IMAP).
- `_MAX_PER_POLL = 50` als Modulkonstante.

#### A.3 Scheduler (Content-Anker `build_scheduler()` / `job_cleanup()`) — **gehoert Paket 0**
Neuer Job vor `return sched`:
```python
    sched.add_job(
        job_mailbox_poll, IntervalTrigger(minutes=settings.imap_poll_minutes),
        id="mailbox_poll", max_instances=1, coalesce=True,
    )
```
Neue Modul-Funktion (Muster `job_healthchecks`, lazy Import):
```python
def job_mailbox_poll() -> None:
    from . import mailbox
    try:
        mailbox.poll_inbox()
    except Exception:  # noqa: BLE001
        log.exception("Mailbox-Poll fehlgeschlagen")
```
Retention in `job_cleanup()` (nach dem HealthCheck-Cleanup, im selben `session_scope`):
```python
    live_cutoff = utcnow() - timedelta(days=90)
    stale = session.exec(
        select(InboxItem).where(InboxItem.source == "live")
        .where(InboxItem.status == "closed").where(InboxItem.updated_at < live_cutoff)
    ).all()
    for row in stale:
        session.delete(row)
```
(`InboxItem`, `select`, `timedelta` sind in `scheduler.py` bereits importiert.)

#### A.4 Brevo-Adapter erweitern (abwaertskompatibel) — `aos/backend/app/adapters/brevo_adapter.py`
Content-Anker: `def send_transactional(...)`. Signatur um optionale Parameter erweitern (bestehende Aufrufer in `scheduler.py` bleiben unveraendert, Defaults `None`):
```python
def send_transactional(settings, to_email, subject, html, text=None,
                       reply_to: str | None = None, sender: dict | None = None,
                       headers: dict | None = None) -> dict[str, Any]:
    ...
    payload = {"sender": sender or _SENDER, "to": [{"email": to_email}],
               "subject": subject, "htmlContent": html}
    if text: payload["textContent"] = text
    if reply_to: payload["replyTo"] = {"email": reply_to}
    if headers: payload["headers"] = headers
    ...
```

#### A.5 Reply-Endpunkt (neu, manuell) — `aos/backend/app/routers/inbox.py`
Neu nach `draft_inbox`, vor `patch_inbox`. `require_auth` gilt via Router-Dependency. `Notification` + `from ..adapters import brevo_adapter` + `import html as _html` importieren.
```python
class ReplyBody(BaseModel):
    body: Optional[str] = None
    subject: Optional[str] = None

@router.post("/{item_id}/reply")
def reply_inbox(item_id: int, body: ReplyBody,
                session: Session = Depends(get_session),
                settings: Settings = Depends(get_settings)) -> dict:
    item = session.get(InboxItem, item_id)
    if item is None: raise HTTPException(404, "Anfrage nicht gefunden")
    text = (body.body or item.draft or "").strip()
    if not text: raise HTTPException(422, "Kein Antworttext oder Entwurf vorhanden")
    target = item.reply_to or (item.sender if "@" in (item.sender or "") else None)
    if not target: raise HTTPException(422, "Keine gueltige Antwort-Adresse vorhanden")
    subject = (body.subject or "").strip() or _re_subject(item.subject)
    html_body = "<p>" + _html.escape(text).replace("\n", "<br>") + "</p>"
    hdrs = {"In-Reply-To": item.external_id, "References": item.external_id} if item.external_id else None
    res = brevo_adapter.send_transactional(
        settings, target, subject, html_body, text=text,
        reply_to=settings.reply_to_email,
        sender={"name": settings.reply_from_name, "email": settings.reply_from_email},
        headers=hdrs,
    )
    out = {"sent": bool(res.get("sent")), "source": res.get("source", "demo"),
           "detail": res.get("detail"), "message_id": res.get("message_id"), "status": item.status}
    if res.get("sent"):
        item.status = "replied"; item.sent_reply_at = utcnow(); item.updated_at = utcnow()
        session.add(item)
        session.add(Notification(level="info", title=f"Antwort gesendet: {item.subject[:80]}",
                                 body=f"An {target}"))
        session.commit()
        out["status"] = "replied"
    return out
```
`_re_subject(s)`: `s` wenn schon (case-insensitiv) mit `re:` beginnend, sonst `"Re: " + s`.
**From/Reply-To:** Von = `no-reply@bfsg-fuchs.de` (DKIM-verifiziert). Reply-To = `info@bfsg-fix.de` → Kundenantworten laufen wieder in den info@-Kanal → Outlook + crm@-Kopie → erneut als neuer `InboxItem` (geschlossener Kreis).
**Fehlerfaelle:** kein `BREVO_API_KEY` → `sent=false, source="demo"`, HTTP 200, Status UNVERAENDERT. Brevo-HTTP-Fehler → `sent=false, source="live"`, `detail` sichtbar, Status unveraendert. Item nicht gefunden → 404. Kein Text/Entwurf → 422. Keine Adresse → 422.
**Detail-Response:** in `get_inbox()` und `patch_inbox()` je `data["reply_to"] = item.reply_to` ergaenzen. `_item_summary` (Liste) **NICHT** anfassen (haelt `_SUMMARY_KEYS`/`test_list_inbox_seeded` stabil; Demo-Seeds haben `reply_to=None`).

#### A.6 Config (Content-Anker: Mail-Block `stripe_secret_key`/`brevo_api_key`/`admin_email`) — **gehoert Paket 0**
Nach `self.admin_email` ergaenzen:
```python
        # --- Eingehende Mail (IMAP-Poll info@bfsg-fix.de-Kopie) ---
        self.imap_host: str = os.getenv("AOS_IMAP_HOST", "")
        self.imap_port: int = int(os.getenv("AOS_IMAP_PORT", "993"))
        self.imap_user: str = os.getenv("AOS_IMAP_USER", "")
        self.imap_password: str = os.getenv("AOS_IMAP_PASSWORD", "")
        self.imap_mailbox: str = os.getenv("AOS_IMAP_MAILBOX", "INBOX")
        self.imap_poll_minutes: int = int(os.getenv("AOS_IMAP_POLL_MINUTES", "5"))
        # --- Ausgehende Antworten (Brevo) ---
        self.reply_from_email: str = os.getenv("AOS_REPLY_FROM_EMAIL", "no-reply@bfsg-fuchs.de")
        self.reply_from_name: str = os.getenv("AOS_REPLY_FROM_NAME", "BFSG-Fuchs Kundenservice")
        self.reply_to_email: str = os.getenv("AOS_REPLY_TO_EMAIL", "info@bfsg-fix.de")
```
`aos/deploy/aos.env.example` (Owner-Doku, Content-Anker: Ende der Datei) neuer Block:
```
# --- Eingehende Mail (IMAP-Poll der info@bfsg-fix.de-Kopie) ---
AOS_IMAP_HOST=            # INWX-IMAP-Server, leer = Demo
AOS_IMAP_PORT=993
AOS_IMAP_USER=            # z.B. crm@bfsg-fix.de
AOS_IMAP_PASSWORD=        # Postfach-Passwort (GitHub-Secret)
AOS_IMAP_MAILBOX=INBOX
AOS_IMAP_POLL_MINUTES=5
# --- Ausgehende Antworten ---
AOS_REPLY_FROM_EMAIL=no-reply@bfsg-fuchs.de
AOS_REPLY_FROM_NAME=BFSG-Fuchs Kundenservice
AOS_REPLY_TO_EMAIL=info@bfsg-fix.de
```
`docker-compose.aos.yml` braucht **keine** Aenderung (`aos-backend` laedt alles via `env_file: .env`).

#### A.7 Frontend (`aos/frontend/src/components/inbox/InboxView.tsx`, Content-Anker: Detail-Drawer unter dem KI-Antwortentwurf-Block)
- api.ts-Aenderungen (Typ `reply_to`, `ReplyResponse`, `inboxApi.reply`) gehoeren **Paket 0** (§4.D).
- State: `replyText`, `sending`, `replyNote`. Bei `openDetail`/`onDraft`: `setReplyText(detail.draft ?? "")`.
- `<textarea className="input mono">` (editierbar, vorbelegt mit Entwurf) + Button „Antwort senden" (`className="btn btn-primary"`, `disabled={sending || !replyText.trim()}`) → `inboxApi.reply(selected.id, { body: replyText })`:
  - `res.sent === true` → lokalen Status auf `"replied"`, `replyNote = "Antwort an "+ (selected.reply_to ?? selected.sender) +" gesendet."`.
  - `res.sent === false && source === "demo"` → `replyNote = "Demo-Modus: kein Versand (BREVO_API_KEY fehlt)."`.
  - `res.sent === false && source === "live"` → `replyNote = res.detail ?? "Versand fehlgeschlagen."`.
- Zieladresse als `micro`-Text: `Antwort geht an: {selected.reply_to ?? selected.sender}`. Kein Auto-Versand. Kein neuer Nav-Eintrag (lebt in `/inbox`).

#### A.8 Deploy (`deploy-aos.yml`) — **gehoert Paket 0** (siehe §7.2 fuer exakten Shell-Snippet)

---

### 4.B Feature 2 — Stripe-Live (Finanzmodul komplett aus Stripe)

**Scope:** `GET /api/finance/summary|invoices|thresholds` live aus Stripe, sobald der Restricted Key die Read-Scopes hat. DEMO-Badge verschwindet automatisch (`source=="stripe"`). Fehlender Scope → kontrollierter Demo-Fallback + entprellte Notification, die den Scope benennt. **Betrifft nur `aos/backend`/`aos/frontend` — kein neuer Container/Env/Secret, keine Compose-/Caddy-/deploy-aos-Aenderung** (STRIPE_SECRET_KEY ist in `deploy-aos.yml` bereits gemappt).

#### B.1 `aos/backend/app/adapters/stripe_adapter.py` (Kern-Umbau, Team B)
Modul-Konstanten: `_STRIPE_BASE`, `_CACHE_TTL_RAW = timedelta(minutes=10)`, `_CACHE_TTL_YTD = timedelta(minutes=60)`, `_MAX_PAGES = 20`, `_FEE_RATE = 0.019`, `_BERLIN = ZoneInfo("Europe/Berlin")`. Cache-Keys **neu**: `stripe_raw_30d`, `stripe_ytd` (die alten `stripe_summary`/`stripe_sparkline` entfallen; alte Cache-Zeilen laufen per TTL aus — harmlos).
- HTTP-Client-Factory `_client(settings)` mit optionalem Test-Hook `_TEST_TRANSPORT: httpx.MockTransport | None = None` (nur Tests setzen es):
  ```python
  kwargs = {"base_url": _STRIPE_BASE, "headers": {"Authorization": f"Bearer {settings.stripe_secret_key}"}, "timeout": 10.0}
  if _TEST_TRANSPORT is not None: kwargs["transport"] = _TEST_TRANSPORT
  return httpx.Client(**kwargs)
  ```
- `class StripeScopeError(Exception)` mit `.resource`.
- `_get_paginated(client, path, params) -> list[dict]`: cursor-Paging (`limit=100`, `has_more` → `starting_after=data[-1]["id"]`, Cap `_MAX_PAGES`). **Bei `resp.status_code in (401,403)` VOR `raise_for_status()`** `raise StripeScopeError(<Resource-Name>)`.
- `_fetch_raw_30d(session, settings) -> dict | None`: `gte = int((datetime.now(_BERLIN) - timedelta(days=30)).timestamp())`.
  1. `/charges` (Resource „Charges"): `StripeScopeError` → `_notify_once(session, "Stripe-Scope fehlt: Charges", ...)`, `return None`.
  2. `_fetch_fee_map`: `/balance_transactions?type=charge` → Map `bt["source"]→int(bt["fee"])`, `(map, False)`. `StripeScopeError("Balance transactions")` → `_notify_once(...,"Stripe-Scope fehlt: Balance transactions","Gebuehren werden geschaetzt (1,9 %).")`, `({}, True)`.
  3. `/subscriptions?status=active` (Resource „Subscriptions"): Scope-Fehler → wie 1., `return None`.
  4. `/checkout/sessions?created[gte]=…`: `try/except StripeScopeError("Checkout sessions")` → `sessions=None` + `_notify_once(...,"Stripe-Scope fehlt: Checkout sessions","Paketzuordnung erfolgt betragsbasiert.")`.
  Andere `httpx.HTTPError` in `_fetch_raw_30d` → `return None` (Demo, keine Scope-Notification). `/v1/balance` wird NICHT mehr abgefragt (Feld war ungenutzt → spart Scope Balance:Read).
- `_fetch_ytd_gross(settings) -> float | None`: `gte = int(datetime(now_b.year,1,1,tzinfo=_BERLIN).timestamp())`, `/charges`, `sum(amount for paid & not refunded)/100`. Bei Scope/HTTP-Fehler → `None`.
- Ableitungen: `_summary_from_raw(raw)` (echte Fees via `bt_map`, sonst `_FEE_RATE`, `fees_estimated: bool`; `refund_rate_pct`; MRR mit `interval=="year"` → `/12`; `by_package = _by_package(paid, raw["sessions"])`; `source="stripe"`). `_by_package`: Tier 1 = PaymentIntent→pkg aus `checkout/sessions` (`metadata.pkg` via `_PKG_LABEL`), Tier 2 = `_guess_package(amount)`; **Summe der eur == gross_30d**. `_sparkline_from_charges` (30 Berlin-Tage-Buckets). `_invoices_from_raw(raw, limit)` (nutzt dieselbe `pi2pkg`-Map).
- Kataloge erweitert: `_PACKAGES` += `("Re-Check-Abo",24.99), ("Re-Check-Abo Jahr",249.0)`. `_PKG_LABEL = {"basis":"Basis","profi":"Profi","cookie-basis":"Cookie-Basis","cookie-profi":"Cookie-Profi","abo":"Re-Check-Abo","abo-jahr":"Re-Check-Abo Jahr"}`.
- Cache (**verbindlicher Weg — KEINE offene Entscheidung**): `_cache_get` um einen optionalen `ttl`-Parameter erweitern: `def _cache_get(session, key, ttl: timedelta = _CACHE_TTL_RAW)` und die feste Vergleichszeile auf `if utcnow() - row.fetched_at > ttl` umstellen (die Modulkonstante `_CACHE_TTL` wird durch `_CACHE_TTL_RAW`/`_CACHE_TTL_YTD` aus B.1 ersetzt). `_cache_set` bleibt signatur-gleich (schreibt nur `fetched_at`, kein TTL nötig). Dann: `_raw_30d(session, settings)` cached `stripe_raw_30d` via `_cache_get(session, "stripe_raw_30d")` (Default = 10 min). **Neu** `get_ytd_gross(session, settings) -> float | None` mit Cache-Key `stripe_ytd`, gelesen via `_cache_get(session, "stripe_ytd", ttl=_CACHE_TTL_YTD)` (60 min). So cached YTD garantiert 60 min statt versehentlich 10 — im Demo-Modus nie live gecached, daher durch kein Demo-Test abgedeckt: die Parametrisierung ist Pflicht, nicht optional.
- Oeffentliche Signaturen UNVERAENDERT: `get_summary`, `get_sparkline`, `get_invoices` leiten alle aus `_raw_30d` ab (behebt Invoice-No-Cache). `_demo_summary()` bekommt zusaetzlich `"fees_estimated": False`.
- `_notify_once(session, title, body)`: entprellt 6h (`select(Notification).where(title==...).where(ts>=utcnow()-timedelta(hours=6))`), Level `warn`.

#### B.2 `aos/backend/app/routers/finance.py` (nur `thresholds()`, Team B)
`from zoneinfo import ZoneInfo` ergaenzen. `thresholds()`:
```python
ytd = stripe_adapter.get_ytd_gross(session, settings)
now_b = datetime.now(ZoneInfo("Europe/Berlin"))
if ytd is None:
    monthly = stripe_adapter.get_summary(session, settings)["gross_30d"]
    ytd = round(monthly/30 * now_b.timetuple().tm_yday, 2)
    projected = round(monthly/30 * 365, 2)
else:
    doy = now_b.timetuple().tm_yday
    projected = round(ytd/doy * 366, 2) if doy else ytd
pct_used = round(100.0*ytd/_LIMIT_CURRENT_YEAR, 1)
warn = projected >= _LIMIT_CURRENT_YEAR*0.8
```
Response-Shape (`kleinunternehmer{limit_prev_year, limit_current_year, ytd_revenue=ytd, pct_used, projected_year_end=projected, warn}`) **exakt wie bisher** → `test_finance_thresholds_shape` bleibt gruen.

#### B.3 Frontend (Team B): `api.ts` `FinanceSummary` += `fees_estimated?: boolean` (**Paket 0**). `finance/page.tsx` — unter der Gebuehren-Kachel:
```tsx
<KpiTile label="Gebühren 30 Tage" value={eur(summary.fees_30d)}
         sub={summary.fees_estimated ? "geschätzt (1,9 %)" : undefined} />
```
DemoBadge-Logik (`source === "demo"`) greift unveraendert und verschwindet bei `source==="stripe"`.

#### B.4 Benoetigte Restricted-Key-Scopes: siehe §3.3. Balance:Read NICHT noetig.

---

### 4.C Feature 3 — Live-Tracking + Funnel

**Datenfluss:** Landing-Beacon + serverseitige Funnel-Events → `scanner/lib/metrics.js` (JSONL im `bfsg_data`-Volume) → `GET /admin/metrics` (Bearer `ADMIN_TOKEN`) → `traffic_adapter` (AOS) → `TrafficDaily` (SQLite) + `/traffic`-Seite + Dashboard-Widget. **Null Caddyfile-Aenderung, keine neuen Env/Secrets** (`SCANNER_ADMIN_TOKEN` = `ADMIN_TOKEN` bereits in `deploy-aos.yml` gemappt).

#### C.1 Scanner (`scanner/**`) — ⚠️ **eigener PR (PR-1), triggert `deploy.yml`**
`scanner/lib/metrics.js` (neu, ESM, `"type":"module"`): `__dirname` MUSS wie in `lead-queue.js` via `path.dirname(fileURLToPath(import.meta.url))` abgeleitet werden; `import { randomBytes, createHash } from 'node:crypto'`.
- `const FILE = process.env.METRICS_EVENTS_FILE || path.join(__dirname, '..', 'out', 'metrics-events.jsonl');` · `const RETENTION_MS = 30*24*60*60*1000;`.
- Event-Schema (eine JSONL-Zeile): `{ ts, day, type, path?, refBucket?, vh? }`. `type ∈ pageview|scan_started|lead_requested|lead_confirmed`. `path/refBucket/vh` nur bei `pageview`; `scan_started` traegt `vh` aber KEIN `path`; `lead_requested`/`lead_confirmed` nur `type+ts+day`.
- `vh = sha256(dailySalt + ip + ua).slice(0,16)`. **Rohe IP wird NIE gespeichert.** Daily-Salt In-Memory rotierend (`randomBytes(16).hex`), NICHT persistiert.
- `isBot(ua)` via `BOT_RE` (bot|crawl|spider|slurp|headless|puppeteer|playwright|curl|wget|python-requests|axios|node-fetch|facebookexternalhit|ahrefs|semrush|uptime|pingdom|… ), leerer UA = Bot.
- `classifyReferrer(refRaw)` → `direct|google|bing|search|social|referral` (serverseitig, Client-Wert nie vertraut).
- Pfad-Sanitisierung: nur `string`, muss mit `/` beginnen, Query/Hash abschneiden, max 120 Zeichen, sonst Event verwerfen.
- Public API (alle async, fire-and-forget, intern try/catch): `recordPageview({ip,ua,path,ref})`, `recordScanStarted({ip,ua})`, `recordFunnel(type)`, `getMetrics()`, `_resetForTests()`.
- `getMetrics()` **Compact-on-Read**: Events `< now-RETENTION_MS` verwerfen; falls welche verworfen → Datei via tmp+rename neu schreiben (best-effort). Kein separater Cron.

`POST /api/track` (neu, PUBLIC — Content-Anker: nach dem `/api/lead/confirm`-Handler, vor `app.get('/health'…)`; `express.json({limit:'16kb'})` ist global aktiv, `app.set('trust proxy', 1)` gesetzt → `req.ip` echt):
```js
app.post('/api/track', rateLimit({ windowMs: 60_000, max: 60 }), (req, res) => {
  if (req.get('DNT') === '1' || req.get('Sec-GPC') === '1') return res.status(204).end();
  const ua = req.get('user-agent') || '';
  metrics.recordPageview({ ip: req.ip, ua, path: String(req.body?.path || ''), ref: String(req.body?.ref || '') }).catch(() => {});
  res.status(204).end();
});
```
`GET /admin/metrics` (neu, Content-Anker: nach `app.get('/admin/subscriptions', …)`, Muster identisch inkl. `rateLimit` + `requireAdminAuth`):
```js
app.get('/admin/metrics', rateLimit({ windowMs: 60_000, max: 30 }), requireAdminAuth, async (req, res) => {
  try { res.json(await metrics.getMetrics()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
```
**Response-Shape `getMetrics()` (camelCase, Scanner-intern):**
```json
{ "source":"live", "generatedAt":"…",
  "today":{"date":"…","visits":42,"uniqueVisitors":31,"scansStarted":18,"leadsRequested":6,"leadsConfirmed":4},
  "daily":[{"date":"…","visits":12,"uniqueVisitors":9,"scansStarted":4,"leadsRequested":1,"leadsConfirmed":1}],
  "byPage":[{"path":"/","visits":120}],
  "byReferrer":[{"bucket":"direct","visits":80}],
  "funnel30d":{"scansStarted":210,"leadsRequested":64,"leadsConfirmed":41,"leadsUnconfirmed":23} }
```
`daily` aufsteigend, max 30; `byPage` Top 15 (30 Tage); `byReferrer` alle Buckets; `leadsUnconfirmed = max(0, leadsRequested-leadsConfirmed)`; `uniqueVisitors` = distinct `vh` der `pageview`-Events des Tages.

Serverseitige Funnel-Instrumentierung (fire-and-forget, `import * as metrics from './lib/metrics.js';` oben):
| Event | Content-Anker | Einfuegung |
|---|---|---|
| `scan_started` | `GET /api/scan`, unmittelbar nach der erfolgreichen `safe = await assertPublicHttpUrl(target)` (nach deren catch-Block, vor dem `try {`-Scan-Block) | `if (!metrics.isBot(req.get('user-agent'))) metrics.recordScanStarted({ ip:req.ip, ua:req.get('user-agent') }).catch(()=>{});` |
| `lead_requested` | `POST /api/lead`, unmittelbar vor `return res.json({ ok: true, status: 'pending' });` (der 201/204-Erfolgszweig) | `metrics.recordFunnel('lead_requested').catch(()=>{});` |
| `lead_confirmed` | `GET /api/lead/confirm`, im geclaimten Zweig direkt nach `await leadQueue.markSent(id)` (NICHT der idempotente `status === 'SENT'`-Early-Return) | `metrics.recordFunnel('lead_confirmed').catch(()=>{});` |

`scanner/package.json` `"test"`-Script: **` ./test/metrics.test.js` anhaengen** (das Script listet jede Datei einzeln — sonst laeuft der Test in CI NICHT). Neuer Test `scanner/test/metrics.test.js` (Muster `lead-gate.test.js`, `node:test`+`supertest`, Env VOR Import): Testfaelle 1–13 (pageview visit/unique, zwei IPs, Bot-Verwurf, DNT/GPC 204+nichts geschrieben, scan_started, recordFunnel-Funnel/leadsUnconfirmed, classifyReferrer, Pfad-Sanitisierung, getMetrics-Shape, Retention >30d, Persistenz ueber `_resetForTests`, `POST /api/track`→204+visits, `GET /admin/metrics` 401 ohne / 200 mit ADMIN_TOKEN≥16).

#### C.2 Landing (`landingpage-next/**`) — ⚠️ **selber PR-1, triggert `deploy.yml`**
`components/TrafficBeacon.tsx` (neu, `"use client"`): `usePathname()`; wenn `navigator.doNotTrack==="1"` oder `globalPrivacyControl` → return; sonst `navigator.sendBeacon("/api/track", new Blob([JSON.stringify({path:pathname, ref:document.referrer})], {type:"application/json"}))` in try/catch; feuert bei Erst-Load + jeder Client-Navigation. Kein Cookie/localStorage/Identifier.
`app/layout.tsx` (Content-Anker: Import-Block Zeile 5–16; Body — `<CookieBanner />` … `<Toaster />` ~171/172): `import { TrafficBeacon } from "@/components/TrafficBeacon";` und `<TrafficBeacon />` direkt vor `<Toaster />`. (`@/` mappt auf `landingpage-next/`-Root — Layout ist Server-Component, das gemountete Child ist Client. Kein CSP-Konflikt.)

#### C.3 AOS-Backend (`aos/backend/**`, Team C)
`models.py` (Content-Anker: nach `class AuthCredential`) — neue Tabelle (**gehoert Paket 0**, da `models.py` shared):
```python
class TrafficDaily(SQLModel, table=True):
    __tablename__ = "traffic_daily"
    id: Optional[int] = Field(default=None, primary_key=True)
    day: str = Field(index=True, unique=True)   # "YYYY-MM-DD"
    visits: int = 0
    unique_visitors: int = 0
    scans_started: int = 0
    leads_requested: int = 0
    leads_confirmed: int = 0
    source: str = Field(default="live")
    updated_at: datetime = Field(default_factory=utcnow)
```
`adapters/traffic_adapter.py` (neu, Team C — **eigene** Cache-Helfer, um Kopplung an stripe_adapter zu vermeiden):
- `is_live(settings) = bool(settings.scanner_base_url and settings.scanner_admin_token)`.
- `get_traffic(session, settings) -> dict`: eigener 10-min-`FinanceCache`-Cache (Key `"traffic_summary"`, eigene `_cache_get/_cache_set` mit `_CACHE_TTL = timedelta(minutes=10)`; NICHT die stripe_adapter-Privaten importieren). Live: `GET {scanner_base_url}/admin/metrics` mit `Authorization: Bearer {scanner_admin_token}` (httpx, timeout 5s). Bei `httpx.HTTPError`/`ValueError`/Status≥400 → `_demo()`. Mapping camelCase→snake_case (`scansStarted`→`scans_started`, `daily[].date`→`day`, `funnel30d`→`funnel_30d`).
- Rueckgabe-Shape (snake_case): `{source, today{date,visits,unique_visitors,scans_started,leads_requested,leads_confirmed}, daily[{day,…}], funnel_30d{scans_started,leads_requested,leads_confirmed,leads_unconfirmed}, by_page[{path,visits}], by_referrer[{bucket,visits}]}`.
- `_demo()`: `source:"demo"`, 30-Tage-Serie mit realistischen deutschen Zahlen (visits ~8-40, scans 4-18, requested 1-5, confirmed 0-4), plausibles `by_page` (`/`, `/bfsg-frist`, `/mlbf-pruefstrategie`, `/bfsg-pruefung-kosten`), `by_referrer` (direct/google/bing/social/referral).

`routers/traffic.py` (neu, Team C): Prefix `/api/traffic`, `dependencies=[Depends(require_auth)]`.
- `GET /api/traffic/summary` → `get_traffic(...)` **plus** `conversion{scan_to_lead_pct, lead_to_confirm_pct, scan_to_confirm_pct}` (aus `funnel_30d`, Division-durch-0-Schutz=0.0, 1 Nachkommastelle).
- `GET /api/traffic/history?days=30` (`Query(default=30, ge=1, le=90)`): liest `TrafficDaily` der letzten `days` Tage aufsteigend → `{source, points:[{day,visits,unique_visitors,scans_started,leads_requested,leads_confirmed}]}`. Leere Tabelle → Fallback `traffic_adapter._demo()["daily"]` mit `source:"demo"` (Chart nie leer). `source="live"`, wenn mind. eine Zeile `source="live"` existiert.

`main.py` (Content-Anker: Router-Import-Block + `include_router`-Block) — **gehoert Paket 0**: `traffic` importieren + `app.include_router(traffic.router)`.

`services/scheduler.py` (**gehoert Paket 0**): `job_traffic()` (lazy `from ..adapters import traffic_adapter`) — ruft `get_traffic(session, settings)`; **nur bei `result["source"]=="live"`** je Eintrag in `daily` + `today` per `day` upserten (vorhandene Zeile updaten, sonst `session.add(TrafficDaily(...))`); bei `source=="demo"` NICHTS schreiben. Registrierung vor `return sched`: `sched.add_job(job_traffic, IntervalTrigger(minutes=15), id="traffic", max_instances=1, coalesce=True)`. Kein Cleanup (1 Zeile/Tag).

`test_traffic.py` (neu, Team C): `test_traffic_summary_demo_shape` (Keys `source,today,daily,funnel_30d,by_page,by_referrer,conversion`; `source=="demo"`), `test_traffic_history_shape`, `test_traffic_requires_auth` (401 ohne Header), `test_traffic_adapter_demo` (`is_live is False`, `source=="demo"`). Regression `test_dashboard_summary_shape`/`test_health_services_shape` bleiben unberuehrt (dieser Blueprint fasst `/api/dashboard/summary` und `service_targets()` NICHT an).

#### C.4 AOS-Frontend (`aos/frontend/**`, Team C)
- `api.ts` (**Paket 0**): `TrafficDay`, `TrafficSummary`, `TrafficHistory`-Interfaces + `trafficApi = { summary, history }` (siehe §4.D).
- `components/ui/Icon.tsx` (Team C): in `PATHS` `chart: "M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6",`.
- `components/layout/nav.ts` (Team C): `NAV_ITEMS` += `{ href: "/traffic", label: "Traffic", icon: "chart" }`.
- `src/app/(dash)/traffic/page.tsx` (neu, Team C): Client-Seite, `Promise.allSettled([trafficApi.summary(), trafficApi.history(30)])`; nutzt `Widget`, `KpiTile`, `DemoBadge`, `Sparkline`, `Loading`, `ErrorNote`, `Empty`. KPI-Reihe (Besucher heute, Unique heute, Gratis-Checks 30 T, DOI bestaetigt 30 T), Funnel-Widget (4 Stufen + `conversion`-Prozente), Tages-Chart (`Sparkline` ueber `history.points`), Tabellen Top-Seiten (`by_page`) + Quellen (`by_referrer`), `<DemoBadge show={summary?.source === "demo"} />` im Widget-Kopf.
- `components/dashboard/DashboardGrid.tsx` (Team C): Import `trafficApi, type TrafficSummary`; `DashData` += `traffic: TrafficSummary | null`; `Promise.allSettled` += `trafficApi.summary()` → `next.traffic` (fehlertolerant, kein `setError` bei Reject). **`DEFAULT_LAYOUT` neues Widget kollisionsfrei in neuer Zeile:** `{ i: "traffic-today", x: 0, y: 10, w: 3, h: 2, minW: 2, minH: 2 }` (die bestehende letzte Zeile belegt y:5 mit `inbox` x0w6 + `leads` x6w6 — NICHT ueberschreiben; `loadLayout()` merged neue Keys automatisch). Render-Block `<div key="traffic-today">`: `<Widget title="Besucher heute" action={<DemoBadge show={data.traffic?.source==="demo"} />}><KpiTile label="Heute" value={num(data.traffic?.today.visits ?? 0)} sub={`${num(data.traffic?.today.unique_visitors ?? 0)} unique · ${num(data.traffic?.today.scans_started ?? 0)} Checks`} /></Widget>`.

---

### 4.D Konsolidierte `api.ts`-Aenderungen (ALLE in **Paket 0**, damit nur EIN Team `api.ts` editiert)
`aos/frontend/src/lib/api.ts`:
1. `InboxItemDetail` += `reply_to?: string | null;`
2. `export interface ReplyResponse { sent: boolean; source: "live" | "demo"; detail: string | null; message_id: string | null; status: InboxStatus; }`
3. `inboxApi` += `reply: (id: number, payload: { body?: string; subject?: string }) => api.post<ReplyResponse>(\`/inbox/${id}/reply\`, payload),`
4. `FinanceSummary` += `fees_estimated?: boolean;`
5. Traffic-Interfaces + `export const trafficApi = { summary: () => api.get<TrafficSummary>("/traffic/summary"), history: (days = 30) => api.get<TrafficHistory>(\`/traffic/history?days=${days}\`) };` (exakt wie Feature-Spec §C.1).

---

## 5. Arbeitspaket-Zuschnitt (Teams, Ownership OHNE Ueberlappung)

> **Grundproblem:** Die drei AOS-Features editieren gemeinsam `models.py`, `db.py`, `config.py`, `main.py`, `scheduler.py`, `api.ts`, `pr-ci.yml`, `deploy-aos.yml`. Ohne Koordination = Merge-Kollisionen. **Loesung:** ein serielles **Paket 0 (Foundation)** fasst ALLE shared-file-Aenderungen zusammen; danach bauen **Paket A/B/C** ausschliesslich disjunkte Dateien parallel. **Paket S (Scanner+Landing)** ist ein SEPARATER PR und voellig unabhaengig.

### PR-Aufteilung (2 PRs)
- **PR-1 „Tracking-Erhebung" (Live-SaaS):** `scanner/**` + `landingpage-next/**`. Triggert `deploy.yml`. Enthaelt Paket S. Selbst-heilend: bis AOS live pollt, passiert nichts Schaedliches; ist der Scanner-Endpunkt beim ersten AOS-Poll noch nicht da, faellt `traffic_adapter` auf Demo.
- **PR-2 „AOS-Live-Anbindung" (AOS):** `aos/**` + `.github/workflows/pr-ci.yml` + `.github/workflows/deploy-aos.yml`. Triggert `deploy-aos.yml`. Enthaelt Paket 0 + A + B + C. Beruehrt `pr-ci.yml` als EINZIGER PR (kein Konflikt mit PR-1, das `pr-ci.yml` NICHT anfasst).

### Paket-Ownership (innerhalb PR-2, ausser Paket S)

| Paket | Reihenfolge | Dateien (EXKLUSIV) |
|---|---|---|
| **Paket 0 — Foundation** (seriell, zuerst) | 1 | `aos/backend/app/models.py` (InboxItem-Felder + `TrafficDaily`), `aos/backend/app/db.py` (`_ensure_inbox_columns`), `aos/backend/app/config.py` (IMAP/Reply-Block), `aos/backend/app/main.py` (traffic-Router-Mount), `aos/backend/app/services/scheduler.py` (`job_mailbox_poll`+`job_traffic`+`build_scheduler`-Jobs + `job_cleanup`-Retention), `aos/frontend/src/lib/api.ts` (alle §4.D-Aenderungen), `aos/deploy/aos.env.example` (IMAP-Block), `.github/workflows/pr-ci.yml` (1× `aos-backend-tests` + 1× `aos-frontend-build`), `.github/workflows/deploy-aos.yml` (IMAP-Secrets, §7.2) |
| **Paket A — Mail** (parallel nach 0) | 2 | `aos/backend/app/services/mailbox.py` (neu), `aos/backend/app/routers/inbox.py`, `aos/backend/app/adapters/brevo_adapter.py`, `aos/frontend/src/components/inbox/InboxView.tsx`, `aos/backend/tests/test_mailbox.py`, `aos/backend/tests/test_inbox_reply.py`, `aos/backend/tests/test_migration.py` |
| **Paket B — Stripe** (parallel nach 0) | 2 | `aos/backend/app/adapters/stripe_adapter.py`, `aos/backend/app/routers/finance.py`, `aos/frontend/src/app/(dash)/finance/page.tsx`, `aos/backend/tests/test_finance_live.py` |
| **Paket C — Traffic (AOS-Seite)** (parallel nach 0) | 2 | `aos/backend/app/adapters/traffic_adapter.py` (neu), `aos/backend/app/routers/traffic.py` (neu), `aos/frontend/src/app/(dash)/traffic/page.tsx` (neu), `aos/frontend/src/components/dashboard/DashboardGrid.tsx`, `aos/frontend/src/components/layout/nav.ts`, `aos/frontend/src/components/ui/Icon.tsx`, `aos/backend/tests/test_traffic.py` |
| **Paket S — Scanner+Landing** (eigener PR-1, voellig parallel) | jederzeit | `scanner/lib/metrics.js` (neu), `scanner/app.js` (3 Funnel-Anker + `/api/track` + `/admin/metrics`), `scanner/package.json` (Test-Script), `scanner/test/metrics.test.js` (neu), `landingpage-next/components/TrafficBeacon.tsx` (neu), `landingpage-next/app/layout.tsx` |

**Abhaengigkeiten:** Paket 0 MUSS abgeschlossen sein, bevor A/B/C committen (sonst greifen die Feature-Frontends ins Leere: `inboxApi.reply`, `FinanceSummary.fees_estimated`, `trafficApi` liegen in Paket 0). Backend-Feature-Dateien (mailbox.py, stripe_adapter.py, traffic_adapter.py, Router) haben KEINE api.ts-Abhaengigkeit → koennen unmittelbar nach 0 starten. `main.py`/`scheduler.py` (Paket 0) referenzieren `routers/traffic.py` (Paket C) und `mailbox`/`traffic_adapter` (A/C) — die Imports fuer die Router sind top-level (`from .routers import traffic`), fuer die Jobs LAZY. Deshalb: **finale lokale Verifikation (pytest + build) erst NACH A/B/C**, da erst dann alle importierten Module existieren. Paket S ist komplett unabhaengig (anderer PR, andere Verzeichnisse, gekoppelt nur ueber den dokumentierten `/admin/metrics`-Contract).

---

## 6. Verifikations-Gates (je Paket, lokal Windows / Node 24 / Python 3.14 / KEIN Docker)

### Pro Paket
- **Paket 0:** `cd aos/frontend && npm ci && npm run build` (tsc muss die neuen api.ts-Typen akzeptieren; Feature-Consumer existieren noch nicht → api.ts allein muss typ-sauber sein). Python-Import-Smoke NICHT moeglich, solange traffic-Router fehlt → Paket 0 gilt final erst nach C als gruen (siehe unten). Zwischenschritt: `python -c "import ast; ast.parse(open('aos/backend/app/models.py',encoding='utf-8').read())"` fuer Syntax.
- **Paket A/B/C Backend:** `cd aos/backend && pip install -r requirements.txt && python -m pytest -q` → ALLE (neuen + bestehenden) Tests gruen im Demo-Modus.
- **Paket A/B/C Frontend:** `cd aos/frontend && npm ci && npm run build` fehlerfrei.
- **Paket S:** `cd scanner && npm install --ignore-scripts && npm test` (deckt `metrics.test.js`, sobald in `package.json` eingetragen); `cd landingpage-next && npm ci && npm run lint && npm run build`.

### Integration (nach Paket 0+A+B+C, vor Commit PR-2)
1. `cd aos/backend && python -m pytest -q` → grun. Muss enthalten: neue Tests **und** alle Regressionen (`test_dashboard.py`, `test_adapters.py`, `test_inbox.py`, `test_auth.py`, `test_jarvis.py`).
2. `cd aos/frontend && npm ci && npm run build` → grun (tsc + Next-Build; alle neuen Seiten/Widgets typ-sauber).

### Cross-Checks (manuell reviewen)
- **Shape-Crosscheck Traffic:** Scanner `getMetrics()` liefert camelCase (`scansStarted`), AOS `traffic_adapter` mappt auf snake_case (`scans_started`) — im Adapter verifizieren.
- **Cookie-/Consent-Crosscheck:** `TrafficBeacon` setzt kein Cookie/localStorage; respektiert DNT/GPC; `/api/track` ehrt DNT/GPC serverseitig (204, kein Insert). Kein Identifier persistiert.
- **Regressions-Shape:** `_item_summary` (Inbox-Liste) UNVERAENDERT; `/api/dashboard/summary` UNVERAENDERT; `service_targets()` UNVERAENDERT (weiter 9 Services); `finance/thresholds`-Shape UNVERAENDERT.
- **scanner-tests:** `metrics.test.js` MUSS im `package.json`-`test`-Script stehen, sonst laeuft es nicht.
- **KEIN Caddyfile-Touch** in beiden PRs (Grep `git diff --name-only` gegen `deployment/Caddyfile` = leer). Falls doch unvermeidbar: `caddy validate`-Kommando aus §2.4 woertlich ausfuehren (auf Server/CI, nicht lokal — kein Docker).

---

## 7. Deploy-/Rollout-Plan

### 7.1 PR-Schnitt & Reihenfolge
- **PR-1 (Scanner+Landing):** in verkehrsarmer Zeit mergen → `deploy.yml` baut Scanner+Landing neu → `https://bfsg-fuchs.de/health` = `ok:true` abwarten. `/api/track` + `/admin/metrics` sind danach live (AOS pollt sie noch nicht → keine Wirkung, harmlos).
- **PR-2 (AOS):** nach gruenem PR-1-Deploy mergen → `deploy-aos.yml` baut AOS neu. Traffic wird beim naechsten 15-min-Poll `live`; IMAP/Stripe werden live, sobald die Owner-Secrets/Scopes (§3) gesetzt sind. Bis dahin: sauberer Demo-Modus.
- Beide Reihenfolgen sind self-healing; empfohlene Reihenfolge = PR-1 zuerst (dann existiert `/admin/metrics`, bevor AOS pollt).

### 7.2 `deploy-aos.yml` — CI-ensure-Block fuer neue Env-Vars (Paket 0, woertlich)
Am `SSH Deploy (aos-Stack)`-Step die IMAP-Secrets durchreichen. `with:`-Block um `envs:` ergaenzen und einen Step-`env:`-Block hinzufuegen:
```yaml
        env:
          IMAP_HOST: ${{ secrets.AOS_IMAP_HOST }}
          IMAP_USER: ${{ secrets.AOS_IMAP_USER }}
          IMAP_PASSWORD: ${{ secrets.AOS_IMAP_PASSWORD }}
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: root
          key: ${{ secrets.HETZNER_SSH_KEY }}
          port: 22
          script_stop: true
          request_pty: true
          envs: IMAP_HOST,IMAP_USER,IMAP_PASSWORD
          script: |
            ...
```
Im Script, Content-Anker: NACH dem `ensure TZ "Europe/Berlin"`-Block und VOR `chmod 600 "$ENV_FILE"` (nutzt die vorhandenen Helfer `upsert`/`ensure`):
```bash
            # IMAP-Secrets aus GitHub-Actions (nur upserten, wenn gesetzt — nie clobbern).
            [ -n "$IMAP_HOST" ]     && upsert AOS_IMAP_HOST "$IMAP_HOST"
            [ -n "$IMAP_USER" ]     && upsert AOS_IMAP_USER "$IMAP_USER"
            [ -n "$IMAP_PASSWORD" ] && upsert AOS_IMAP_PASSWORD "$IMAP_PASSWORD"
            ensure AOS_IMAP_PORT "993"
            ensure AOS_IMAP_MAILBOX "INBOX"
            ensure AOS_IMAP_POLL_MINUTES "5"
            ensure AOS_REPLY_FROM_EMAIL "no-reply@bfsg-fuchs.de"
            ensure AOS_REPLY_FROM_NAME "BFSG-Fuchs Kundenservice"
            ensure AOS_REPLY_TO_EMAIL "info@bfsg-fix.de"
```
**Keine** weiteren Env-Aenderungen: `STRIPE_SECRET_KEY` (Feature 2) und `SCANNER_ADMIN_TOKEN`/`SCANNER_BASE_URL` (Feature 3) sind bereits gemappt. Keine Compose-Aenderung, keine `mem_limit`-Aenderung, kein neues Volume.

### 7.3 `pr-ci.yml` — 2 neue Jobs (Paket 0, woertlich; requirements.txt hat pytest bereits → KEIN extra `pip install pytest`)
```yaml
  aos-backend-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - name: Deps
        run: pip install -r requirements.txt
        working-directory: aos/backend
      - name: Pytest
        run: python -m pytest -q
        working-directory: aos/backend

  aos-frontend-build:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: aos/frontend/package-lock.json }
      - run: npm ci
        working-directory: aos/frontend
      - run: npm run build
        working-directory: aos/frontend
```
(Laeuft secret-frei — conftest erzwingt Demo-Modus.)

### 7.4 Rollback je Feature
- **Feature 1 (Mail):** GitHub-Secrets `AOS_IMAP_*` leeren/entfernen → naechster Deploy laesst die Werte leer → `poll_inbox` = No-op (Demo), Reply = Demo. Vollstaendiger Revert = PR-2 zuruecknehmen; die 3 additiven `InboxItem`-Spalten bleiben harmlos in der DB.
- **Feature 2 (Stripe):** Key-Scopes im Dashboard reduzieren → Modul faellt automatisch auf Demo (Badge kehrt zurueck). Code-Revert = PR-2 zuruecknehmen; `stripe_raw_30d`/`stripe_ytd`-Cache-Zeilen laufen per TTL aus.
- **Feature 3 (Traffic):** PR-1 zuruecknehmen entfernt `/api/track`+Beacon+`/admin/metrics`; AOS faellt auf Demo. `TrafficDaily`-Tabelle bleibt harmlos. Alternativ nur Beacon deaktivieren (PR-1-Landing-Teil revert).

---

## 8. Risiko-Register (Top 8 + Gegenmassnahme im Plan)

| # | Risiko | Gegenmassnahme (im Blueprint verankert) |
|---|---|---|
| 1 | Caddyfile-Aenderung killt Live-Site (P0-Lehre 09.07.) | KEINE Caddyfile-Aenderung in beiden PRs; alle Routen existieren; §6-Cross-Check „KEIN Caddyfile-Touch"; break-glass `caddy validate` (§2.4) nur falls unvermeidbar. |
| 2 | Merge-Konflikt auf shared AOS-Dateien (`models.py`/`scheduler.py`/`api.ts`/`pr-ci.yml`) durch parallele Teams | Serielles **Paket 0** buendelt alle shared-file-Edits; A/B/C editieren ausschliesslich disjunkte Dateien (§5). |
| 3 | 3× dupliziertes `aos-backend-tests` / redundantes `pip install pytest` | Genau EIN `aos-backend-tests` + EIN `aos-frontend-build` in Paket 0; `requirements.txt` liefert pytest → nur `pip install -r requirements.txt` (§7.3). |
| 4 | IMAP-Poll blockiert Eventloop / kippt bei kaputter Mail / RAM-Spike | `imaplib` stdlib (kein neuer Prozess), max 50 Mails/Zyklus, Body-Cap 20k, je Mail eigenes try/except, `return`-statt-crash bei IMAP-Fehler; 5-min-Interval schonend fuer 2-vCPU-Host (§4.A.2). |
| 5 | Stripe-Scope fehlt → stiller Fehlschlag / falsche Zahlen | 401/403 → definierter Demo-/Teil-Degrade + entprellte `_notify_once`-Warnung mit Resource-Name; Balance:Read entfernt; Owner-Aktion §3.3 (§4.B). |
| 6 | Tracking verletzt DSGVO/TDDDG (Cookie-Banner-Pflicht) | Cookieless, kein Identifier, taeglich rotierender In-Memory-Salt, IP nie gespeichert, DNT/GPC client+server, First-Party; Owner-Copy-Freigabe §3.5 (§4.C/§2.3). |
| 7 | Regression bricht verankerte Shapes (`services_total==9`, 8 Inbox-Seeds, Dashboard-Summary, thresholds) | `_item_summary`/`service_targets`/`/dashboard/summary`/`thresholds`-Shape UNVERAENDERT; §6-Integration laesst ALLE Regressionstests laufen. |
| 8 | Funnel-Event am falschen Anker (Doppelzaehlung / Spoofing) | Content-Anker exakt definiert: `scan_started` nach `assertPublicHttpUrl`, `lead_requested` nur im 201/204-Zweig, `lead_confirmed` nur im geclaimten Zweig (nicht der idempotente Doppelklick); `/api/track` akzeptiert NUR Pageviews, Funnel serverseitig = bot-resistent (§4.C.1). |

---

## 9. Abnahme-Checkliste fuer den Owner (was sichtbar sein wird)

Nach beiden Merges + gesetzten Secrets/Scopes:
1. **Posteingang (`aos.bfsg-fuchs.de/inbox`):** eine Test-Mail an `info@bfsg-fix.de` erscheint nach ~6 Min als Eintrag OHNE „DEMO"-Badge, mit KI-Prioritaet. „Antwort senden" verschickt eine Mail; der Kunde erhaelt sie, Reply-To zeigt auf `info@`; der Item-Status springt auf „Beantwortet".
2. **Finanzen (`/finance`):** das gelbe DEMO-Badge ist verschwunden (`source=="stripe"`). Umsatz/Gebuehren/MRR/Paket-Split zeigen echte Zahlen; Gebuehren-Kachel ohne „geschaetzt"-Hinweis (bei gesetztem Balance-Transactions-Scope). Erscheint oben rechts (Glocke) „Stripe-Scope fehlt: <Resource>", ist genau dieser Scope noch nicht gesetzt. §19-Kachel zeigt echten Jahres-Ist (nicht mehr die 30-Tage-Hochrechnung).
3. **Traffic (`/traffic`, neuer Nav-Eintrag):** Besucher gesamt/heute, Unique, Gratis-Check-Starts, DOI-Funnel (gestartet → angefordert → bestaetigt → nicht bestaetigt) mit Conversion-Prozenten, Tages-Chart, Top-Seiten + Quellen — ohne DEMO-Badge, sobald echter Traffic geflossen ist.
4. **Dashboard-Startseite:** neues Widget „Besucher heute" (Visits + unique + Checks).
5. **System (`/health`):** weiterhin 9/9 Dienste (unveraendert), `https://bfsg-fuchs.de/health` = `ok:true`.

---

## Anhang: verifizierte Anker-Referenzen (Stand `origin/main` `d556d34`)
- Scanner: `GET /api/scan` (app.js ~839), `POST /api/lead` (~1007, Erfolgs-`return` ~1049), `GET /api/lead/confirm` (~1105, `markSent` im claimed-Zweig ~1138), Admin-Routen ~1189–1213, `express.json({limit:'16kb'})` ~810, `app.set('trust proxy', 1)` ~224. `scanner/lib/lead-queue.js` = ESM-Muster (`__dirname` via `fileURLToPath`).
- AOS-Backend: `InboxItem`/`AuthCredential` in `models.py`; `init_db()` in `db.py`; `build_scheduler()`/`job_cleanup()` in `scheduler.py`; `send_transactional()` in `brevo_adapter.py`; `get_summary/get_sparkline/get_invoices/_live_raw` in `stripe_adapter.py`; `thresholds()` in `finance.py`; `require_auth` aus `..auth`; `service_targets()` = 9 Services in `healthcheck.py`.
- AOS-Frontend: `api.ts` (`inboxApi`/`financeApi`), `InboxView.tsx` (Detail-Drawer), `finance/page.tsx` (Gebuehren-Kachel), `DashboardGrid.tsx` (`DEFAULT_LAYOUT`/`loadLayout`), `nav.ts` (`NAV_ITEMS`), `Icon.tsx` (`PATHS`).
- CI/Deploy: `pr-ci.yml` (3 Jobs, Node 22), `deploy-aos.yml` (appleboy, `upsert`/`ensure`/`getval`-Helfer), `deploy.yml` (Live-SaaS). `aos/frontend/package-lock.json` vorhanden.
- Landing: `landingpage-next/app/layout.tsx` (`@/`→Root, Body `<CookieBanner/>`/`<Toaster/>`), „ohne Tracker" in `components/ScanForm.tsx:200`.

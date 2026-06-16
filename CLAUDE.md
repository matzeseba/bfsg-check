# CLAUDE.md — Arbeits-Regeln für dieses Projekt

## 🚀 Express-Modus (FESTE REGEL)
**Immer den schnellsten Weg gehen. Maximal viel selbst erledigen.**

Konkret heißt das:
- **Keine Klick-Anleitungen** für den User, wenn ich es per API/CLI selbst machen kann.
- **Aktiv nach Zugängen fragen** (API-Tokens, Credentials), statt User durch UIs zu schicken.
- **Sofort handeln** nach Erhalt der Credentials — nicht erst lange erklären, was ich vorhabe.
- **Knappe Status-Updates** statt langer Tutorials. User will Ergebnisse, keine Lehrstunden.
- **Parallele Tool-Calls** wo immer möglich (Bash + Read + Write gleichzeitig).
- **Self-cleanup**: Credentials nach Nutzung `shred`-en, aus Repo raushalten, User zur Rotation auffordern.
- **Bei Hindernissen**: Eigenständig Plan B/C wählen, nicht mit klärenden Fragen blockieren (außer Entscheidungen sind echt nur vom User zu treffen).

## Projekt-Kontext
- **Produkt:** BFSG-Check (Compliance-Scan + Fix-Plan-Verkauf für deutsche Websites)
- **Server:** Hetzner Cloud, CPX22, Nürnberg, Ubuntu 24.04
- **Repo-Layout:** `scanner/` (Node-App), `landingpage/`, `deployment/` (Docker + cloud-init), `marketing/`, `legal/`
- **Deploy:** GitHub Actions → SSH zu Hetzner → `git pull` + `docker compose up -d`
- **Bezahlung:** Stripe (One-time + MRR-Abo via Subscription)
- **E-Mail:** Brevo SMTP

## Sensible Daten — Hygiene
- Niemals Live-Keys ins Repo (`.env` ist gitignored, `.env.example` als Template).
- Nach Nutzung von Live-Credentials im Chat: User aktiv zur Rotation auffordern.

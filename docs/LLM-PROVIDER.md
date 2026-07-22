# ADR: LLM-Provider-Abstraktion für den Report-QA-Agenten

**Status:** Akzeptiert (PR-P3a, dormant — `REPORT_QA_ENABLED` Default aus)
**Kontext:** `scanner/lib/anthropic-client.js`, `scanner/lib/report-qa.js`

## Entscheidung

Der LLM-Zugriff des Report-QA-Agenten liegt hinter einer kleinen
Provider-Abstraktion statt fest auf dem Anthropic-SDK. Zwei Pfade:

- **`anthropic`** (Default, unverändert): Anthropic-SDK, lazy geladen, strict
  Tool-Call via `messages.stream`.
- **`openai-compatible`**: schlanker HTTPS-POST auf
  `{LLM_BASE_URL}/chat/completions` mit stdlib `fetch` (Node ≥20) —
  **bewusst keine neue Dependency**.

## Gründe

- Der QA-Agent ist produktiv verdrahtet, aber dormant. Bevor er aktiviert
  wird, soll der Betreiber Modell und Endpunkt frei wählen können (Kosten,
  Datenhoheit, Self-Hosting via vLLM/LiteLLM), ohne Code zu ändern.
- Der OpenAI-kompatible De-facto-Standard (`/chat/completions`) deckt OpenAI
  und die meisten kompatiblen Gateways ab — ein stdlib-`fetch`-Call reicht,
  ein zweites SDK wäre totes Gewicht in der Dependency-Liste.
- Die Abstraktion ändert **nichts** am Bestandsverhalten: Kill-Switch,
  fail-open, lazy SDK-Import, Prompt und Claim-Regex-Katalog bleiben
  unverändert. Tests injizieren weiterhin Mocks über die bestehende DI-Naht.

## Konfiguration (Env-Vars)

| Variable | Default | Bedeutung |
|---|---|---|
| `LLM_PROVIDER` | `anthropic` | `anthropic` oder `openai-compatible` (unbekannte Werte → `anthropic`) |
| `LLM_API_KEY` | — | API-Key; Fallback: `ANTHROPIC_API_KEY` (Rückwärtskompatibilität) |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | Basis-URL für OpenAI-kompatible Endpunkte |
| `LLM_MODEL` | `claude-sonnet-4-6` | Modellname; Zwischen-Fallback: `REPORT_QA_MODEL` (legacy) |
| `REPORT_QA_ENABLED` | `false` | Kill-Switch (unverändert) |

## Verhalten ohne Key / ohne Aktivierung

Ohne `REPORT_QA_ENABLED=true` **und** gesetzten Key (`LLM_API_KEY` oder
`ANTHROPIC_API_KEY`) ist die QA vollständig **inert**: kein Netzwerk-Call,
keine Kosten, keine Änderung am verkauften Report. Jeder Laufzeitfehler
(Timeout, HTTP-Fehler, Refusal, ungültige Antwort) führt fail-open zu
`null` — der Report geht unverändert raus („nie ohne Report").

## Konsequenzen

- Bestehende QA-Tests laufen unverändert weiter (DI-Naht `deps.client`
  erzwingt den Anthropic-Pfad).
- Neue Tests (`scanner/test/llm-provider.test.js`) decken Provider-Auswahl,
  OpenAI-Request-Shape (via `deps.fetch`-Mock, kein Netzwerk) und das inerte
  Verhalten ohne Key ab.
- `.env.example`-Dokumentation der neuen Variablen erfolgt separat
  (außerhalb dieses PRs).

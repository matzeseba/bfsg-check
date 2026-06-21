#!/usr/bin/env python3
"""
memory_extractor.py — Claude-Code Stop-Hook → Obsidian Vault AI-Session-Notiz

Schreibt nach jeder Claude-Code-Session eine atomare Notiz in den Obsidian-Vault
(08-AI-SESSIONS/YYYY-MM-DD-TITEL.md). Nur stdlib, keine pip-Abhängigkeiten.

EINRICHTUNG ALS STOP-HOOK in .claude/settings.json:
------------------------------------------------------
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /c/Users/Administrator/bfsg-check/scripts/memory_extractor.py"
          }
        ]
      }
    ]
  }
}

Auf Windows (git-bash): Pfad mit /c/Users/... oder mit \\ escapen.
Alternativ: PowerShell-Hook mit python statt python3.

UMGEBUNGSVARIABLEN (optional):
  VAULT_PATH      Pfad zum Obsidian-Vault (Default: C:\\Users\\Administrator\\bfsg-vault)
  CLAUDE_SESSION  Session-ID (wird von Claude Code als Env-Var gesetzt, falls verfügbar)

STDIN:
  Claude Code übergibt beim Stop-Hook das Session-Ergebnis als JSON via stdin.
  Format (Claude Code 1.x):
    {"session_id": "...", "stop_hook_active": true, "transcript_path": "..."}
  Falls stdin leer oder kein JSON: Skript erstellt trotzdem eine leere Notiz.
"""

import json
import os
import sys
import re
import datetime
import pathlib
import textwrap

# ---------------------------------------------------------------------------
# Konfiguration
# ---------------------------------------------------------------------------

DEFAULT_VAULT = r"C:\Users\Administrator\bfsg-vault"  # noqa: W605 (raw string)
SESSIONS_DIR = "08-AI-SESSIONS"
TEMPLATE = """\
---
type: ai-session
date: {date}
tool: claude-code
session-id: "{session_id}"
tags: [ai-session, auto-generated]
links: ["[[08-AI-SESSIONS/INDEX-Sessions]]", "[[01-PROJECTS/BFSG-Check-Launch]]"]
---

# AI-Session {date} — {title}

> Auto-generiert durch `scripts/memory_extractor.py` (Stop-Hook).

## Was wurde getan
{was_getan}

## Entscheidungen
{entscheidungen}

## Geänderte Dateien
{geaenderte_dateien}

## Offene Punkte
{offene_punkte}

## Nächster Schritt
{naechster_schritt}

---
*Links: [[08-AI-SESSIONS/INDEX-Sessions]] · [[01-PROJECTS/BFSG-Check-Launch]]*
"""

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def sanitize_filename(text: str, max_len: int = 40) -> str:
    """Wandelt beliebigen Text in einen dateisystem-sicheren Slug um."""
    text = text.lower().strip()
    # Umlaute ersetzen
    text = text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    # Alles außer Buchstaben, Zahlen, Bindestrich durch Bindestrich ersetzen
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return text[:max_len] if text else "session"


def extract_from_transcript(transcript_path: str) -> dict:
    """
    Liest das Transkript (JSONL) und extrahiert relevante Informationen.
    Gibt ein Dict mit Feldern zurück, das für die Notiz genutzt wird.
    Robust: bei Fehlern werden leere Platzhalter zurückgegeben.
    """
    result = {
        "title": "Unbenannte Session",
        "was_getan": "*(nicht extrahierbar — Transkript nicht verfügbar)*",
        "entscheidungen": "- *(keine erkannt)*",
        "geaenderte_dateien": "*(keine Datei-Änderungen erkannt)*",
        "offene_punkte": "- [ ] *(manuell ergänzen)*",
        "naechster_schritt": "*(manuell ergänzen)*",
    }

    if not transcript_path or not os.path.isfile(transcript_path):
        return result

    try:
        lines = []
        with open(transcript_path, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    lines.append(json.loads(line))
                except json.JSONDecodeError:
                    pass

        # Alle Assistant-Textnachrichten sammeln
        assistant_texts = []
        # Alle Tool-Use-Einträge sammeln (für geänderte Dateien)
        tool_uses = []
        # User-Nachrichten für erste Nachricht (ergibt Titel)
        user_first = None

        for entry in lines:
            role = entry.get("role", "")
            content = entry.get("content", "")

            if role == "user" and user_first is None:
                # Erste User-Nachricht als Titel-Kandidat
                if isinstance(content, str):
                    user_first = content[:120]
                elif isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "text":
                            user_first = block.get("text", "")[:120]
                            break

            if role == "assistant":
                if isinstance(content, str):
                    assistant_texts.append(content)
                elif isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict):
                            if block.get("type") == "text":
                                assistant_texts.append(block.get("text", ""))
                            elif block.get("type") == "tool_use":
                                tool_uses.append(block)

        # Titel aus erster User-Nachricht
        if user_first:
            # Ersten Satz extrahieren
            first_sentence = re.split(r"[.!?\n]", user_first)[0].strip()
            result["title"] = sanitize_filename(first_sentence[:60]).replace("-", " ").title() or "Session"

        # Was wurde getan: erste 2 Assistenten-Textnachrichten zusammenfassen
        if assistant_texts:
            summary_text = " ".join(assistant_texts[:2])
            # Auf 400 Zeichen kürzen, sauber am Wortende
            if len(summary_text) > 400:
                summary_text = summary_text[:397] + "…"
            result["was_getan"] = textwrap.fill(summary_text, width=100)

        # Geänderte Dateien aus Tool-Use extrahieren (Write/Edit-Tools)
        changed = []
        for tool in tool_uses:
            name = tool.get("name", "")
            inp = tool.get("input", {})
            if name in ("Write", "Edit", "str_replace_based_edit_tool"):
                path = inp.get("file_path") or inp.get("path", "")
                if path:
                    changed.append(f"- `{path}`")
        if changed:
            # Deduplizieren
            seen = set()
            unique = []
            for c in changed:
                if c not in seen:
                    seen.add(c)
                    unique.append(c)
            result["geaenderte_dateien"] = "\n".join(unique[:20])  # max 20 Dateien

        # Entscheidungen: Zeilen mit "Entscheidung", "entschieden", "gewählt" suchen
        entsch_lines = []
        decision_pattern = re.compile(
            r"(entscheid|gewählt|beschlossen|festgelegt|wir (bauen|nutzen|verwenden)|HARTE REGEL)",
            re.IGNORECASE
        )
        for text in assistant_texts:
            for line in text.split("\n"):
                if decision_pattern.search(line):
                    clean = line.strip().lstrip("#-*> ").strip()
                    if len(clean) > 10:
                        entsch_lines.append(f"- {clean[:160]}")
            if len(entsch_lines) >= 5:
                break
        if entsch_lines:
            result["entscheidungen"] = "\n".join(entsch_lines[:5])

    except Exception as e:
        # Robustheit: Fehler protokollieren aber nicht crashen
        result["was_getan"] = f"*(Extraktion fehlgeschlagen: {type(e).__name__}: {e})*"

    return result


def write_session_note(vault_path: pathlib.Path, session_id: str, data: dict) -> pathlib.Path:
    """Schreibt die Session-Notiz in den Vault."""
    today = datetime.date.today().strftime("%Y-%m-%d")
    slug = sanitize_filename(data.get("title", "session"), max_len=40)
    filename = f"{today}-{slug}.md"

    sessions_dir = vault_path / SESSIONS_DIR
    sessions_dir.mkdir(parents=True, exist_ok=True)

    note_path = sessions_dir / filename

    # Eindeutigkeit: falls Datei bereits existiert, Suffix anhängen
    counter = 1
    while note_path.exists():
        filename = f"{today}-{slug}-{counter}.md"
        note_path = sessions_dir / filename
        counter += 1

    content = TEMPLATE.format(
        date=today,
        session_id=session_id or "unbekannt",
        title=data.get("title", "Unbenannte Session"),
        was_getan=data.get("was_getan", "*(nicht erfasst)*"),
        entscheidungen=data.get("entscheidungen", "- *(keine erkannt)*"),
        geaenderte_dateien=data.get("geaenderte_dateien", "*(keine)*"),
        offene_punkte=data.get("offene_punkte", "- [ ] *(manuell ergänzen)*"),
        naechster_schritt=data.get("naechster_schritt", "*(manuell ergänzen)*"),
    )

    note_path.write_text(content, encoding="utf-8")
    return note_path


# ---------------------------------------------------------------------------
# Hauptprogramm
# ---------------------------------------------------------------------------

def main() -> int:
    # Vault-Pfad aus ENV oder Default
    vault_str = os.environ.get("VAULT_PATH", DEFAULT_VAULT)
    vault_path = pathlib.Path(vault_str)

    if not vault_path.exists():
        # Vault existiert nicht — kein Fehler, nur still beenden
        # (Vault vielleicht noch nicht eingerichtet)
        print(f"[memory_extractor] Vault-Pfad nicht gefunden: {vault_path} — übersprungen.", file=sys.stderr)
        return 0

    # Stop-Hook-Daten via stdin lesen (Claude Code übergibt JSON)
    raw_stdin = ""
    try:
        if not sys.stdin.isatty():
            raw_stdin = sys.stdin.read(8192)  # max 8KB lesen
    except Exception:
        pass

    hook_data = {}
    if raw_stdin.strip():
        try:
            hook_data = json.loads(raw_stdin)
        except json.JSONDecodeError:
            pass

    session_id = hook_data.get("session_id") or os.environ.get("CLAUDE_SESSION", "")
    transcript_path = hook_data.get("transcript_path", "")

    # Transkript auswerten
    extracted = extract_from_transcript(transcript_path)

    # Notiz schreiben
    note_path = write_session_note(vault_path, session_id, extracted)

    print(f"[memory_extractor] Session-Notiz erstellt: {note_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Team Gamma — Jarvis (KI-Betriebssystem, Text + Voice).

Enthaelt den WebSocket-Endpunkt (`ws.py`), die Anthropic-Streaming-Logik mit
Tool-Use-Loop (`brain.py`) und die Tool-Registry samt serverseitiger Ausfuehrung
(`tools.py`). Der Mount erfolgt optional in `app/main.py` (try/except ImportError).
"""

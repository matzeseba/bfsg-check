"""Pytest-Bootstrap: MCP-Wurzel auf sys.path, damit ``common`` und die
Agenten-Pakete (research_agent, ...) importierbar sind — unabhängig davon,
aus welchem Verzeichnis pytest gestartet wird.
"""

import os
import sys

_ROOT = os.path.dirname(os.path.abspath(__file__))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

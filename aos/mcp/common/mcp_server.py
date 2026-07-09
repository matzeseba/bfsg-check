"""Mini-MCP-Framework: JSON-RPC 2.0 über HTTP POST / (Team Beta-2).

Eine FastAPI-App-Factory ``create_mcp_app(name, version, tools)`` liefert einen
MCP-kompatiblen Agenten-Service. Es werden drei JSON-RPC-Methoden unterstützt:

* ``initialize``  -> protocolVersion, serverInfo, capabilities.tools
* ``tools/list``  -> JSON-Schema je Tool (inputSchema)
* ``tools/call``  -> Argumente validieren, Handler ausführen, Ergebnis als
                     ``{content:[{type:"text",text:<json>}]}``

Fehler folgen dem JSON-RPC-2.0-Standard (-32601 / -32602 / -32603 / -32700).
Außerdem: ``GET /healthz`` -> ``{"ok": true, "agent": <name>}``.

Kein Auth intern — die Services hängen ausschließlich im Docker-Netz
``aos_internal`` (siehe ARCHITECTURE.md §2/§8).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Iterable

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# --- Typen ------------------------------------------------------------------

Handler = Callable[[dict[str, Any]], Awaitable[Any]]


@dataclass
class ToolDef:
    """Definition eines MCP-Tools.

    ``handler`` ist eine async-Funktion, die die (validierten) Argumente als
    dict erhält und ein JSON-serialisierbares Ergebnis zurückgibt.
    """

    name: str
    description: str
    input_schema: dict[str, Any]
    handler: Handler


# --- JSON-RPC-Konstanten ----------------------------------------------------

PROTOCOL_VERSION = "2025-06-18"

PARSE_ERROR = -32700
INVALID_REQUEST = -32600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32603


def _rpc_error(req_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}


def _rpc_result(req_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": req_id, "result": result}


# --- Minimale JSON-Schema-Validierung ---------------------------------------

_TYPE_MAP: dict[str, Any] = {
    "string": str,
    "number": (int, float),
    "integer": int,
    "boolean": bool,
    "object": dict,
    "array": list,
}


def validate_arguments(schema: dict[str, Any], arguments: Any) -> str | None:
    """Prüft Argumente gegen ein (vereinfachtes) JSON-Schema.

    Rückgabe: Fehlermeldung (str) oder ``None`` wenn gültig.
    """
    if not isinstance(arguments, dict):
        return "Argumente müssen ein Objekt sein"

    for req in schema.get("required", []):
        if req not in arguments or arguments[req] is None:
            return f"Pflicht-Argument fehlt: {req}"

    props = schema.get("properties", {})
    for key, spec in props.items():
        if key not in arguments or arguments[key] is None:
            continue
        expected = spec.get("type")
        if not expected or expected not in _TYPE_MAP:
            continue
        value = arguments[key]
        # bool ist Subtyp von int -> für integer/number ausschließen
        if expected in ("integer", "number") and isinstance(value, bool):
            return f"Argument '{key}' muss vom Typ {expected} sein"
        if not isinstance(value, _TYPE_MAP[expected]):
            return f"Argument '{key}' muss vom Typ {expected} sein"
    return None


# --- App-Factory ------------------------------------------------------------


def create_mcp_app(name: str, version: str, tools: Iterable[ToolDef]) -> FastAPI:
    """Baut die FastAPI-App eines MCP-Agenten.

    :param name:    Agenten-Name (erscheint in serverInfo + /healthz).
    :param version: Server-Version (serverInfo.version).
    :param tools:   Liste von ToolDef.
    """
    tool_map: dict[str, ToolDef] = {t.name: t for t in tools}
    app = FastAPI(title=f"AOS MCP: {name}", version=version)

    @app.get("/healthz")
    async def healthz() -> dict[str, Any]:  # pragma: no cover - trivial
        return {"ok": True, "agent": name}

    async def _handle_initialize(req_id: Any, _params: dict[str, Any]) -> dict[str, Any]:
        return _rpc_result(
            req_id,
            {
                "protocolVersion": PROTOCOL_VERSION,
                "serverInfo": {"name": name, "version": version},
                "capabilities": {"tools": {}},
            },
        )

    async def _handle_tools_list(req_id: Any, _params: dict[str, Any]) -> dict[str, Any]:
        return _rpc_result(
            req_id,
            {
                "tools": [
                    {
                        "name": t.name,
                        "description": t.description,
                        "inputSchema": t.input_schema,
                    }
                    for t in tool_map.values()
                ]
            },
        )

    async def _handle_tools_call(req_id: Any, params: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(params, dict):
            return _rpc_error(req_id, INVALID_PARAMS, "params muss ein Objekt sein")
        tool_name = params.get("name")
        arguments = params.get("arguments")
        if arguments is None:
            arguments = {}
        if not tool_name or tool_name not in tool_map:
            return _rpc_error(
                req_id, INVALID_PARAMS, f"Unbekanntes Tool: {tool_name!r}"
            )
        tool = tool_map[tool_name]
        err = validate_arguments(tool.input_schema, arguments)
        if err is not None:
            return _rpc_error(req_id, INVALID_PARAMS, err)
        try:
            result = await tool.handler(arguments)
        except Exception as exc:  # noqa: BLE001 - in JSON-RPC-Fehler überführen
            return _rpc_error(
                req_id, INTERNAL_ERROR, f"Tool-Ausführung fehlgeschlagen: {exc}"
            )
        return _rpc_result(
            req_id,
            {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, ensure_ascii=False),
                    }
                ]
            },
        )

    @app.post("/")
    async def rpc(request: Request) -> JSONResponse:
        try:
            payload = await request.json()
        except Exception:  # noqa: BLE001
            return JSONResponse(_rpc_error(None, PARSE_ERROR, "Parse-Fehler: ungültiges JSON"))

        if not isinstance(payload, dict):
            return JSONResponse(
                _rpc_error(None, INVALID_REQUEST, "Ungültige Anfrage (kein Objekt)")
            )

        req_id = payload.get("id")
        method = payload.get("method")
        params = payload.get("params") or {}

        if method == "initialize":
            return JSONResponse(await _handle_initialize(req_id, params))
        if method == "tools/list":
            return JSONResponse(await _handle_tools_list(req_id, params))
        if method == "tools/call":
            return JSONResponse(await _handle_tools_call(req_id, params))

        return JSONResponse(
            _rpc_error(req_id, METHOD_NOT_FOUND, f"Methode nicht gefunden: {method!r}")
        )

    return app

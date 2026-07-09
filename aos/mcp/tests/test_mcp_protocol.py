"""JSON-RPC-2.0-Protokoll-Tests gegen die common-Factory mit Dummy-Tool."""

import json

from fastapi.testclient import TestClient

from common.mcp_server import (
    INTERNAL_ERROR,
    INVALID_PARAMS,
    METHOD_NOT_FOUND,
    PARSE_ERROR,
    PROTOCOL_VERSION,
    ToolDef,
    create_mcp_app,
)


async def _echo(args):
    return {"echo": args["text"], "n": args.get("n", 0)}


async def _boom(_args):
    raise RuntimeError("kaputt")


def _client():
    tools = [
        ToolDef(
            name="echo",
            description="Gibt den Text zurueck.",
            input_schema={
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "n": {"type": "integer"},
                },
                "required": ["text"],
            },
            handler=_echo,
        ),
        ToolDef(
            name="boom",
            description="Wirft immer einen Fehler.",
            input_schema={"type": "object", "properties": {}, "required": []},
            handler=_boom,
        ),
    ]
    return TestClient(create_mcp_app("dummy", "9.9.9", tools))


def test_healthz():
    client = _client()
    resp = client.get("/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"ok": True, "agent": "dummy"}


def test_initialize():
    client = _client()
    resp = client.post("/", json={"jsonrpc": "2.0", "id": 1, "method": "initialize"})
    body = resp.json()
    assert body["id"] == 1
    result = body["result"]
    assert result["protocolVersion"] == PROTOCOL_VERSION
    assert result["serverInfo"] == {"name": "dummy", "version": "9.9.9"}
    assert result["capabilities"] == {"tools": {}}


def test_tools_list():
    client = _client()
    resp = client.post("/", json={"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
    tools = resp.json()["result"]["tools"]
    names = {t["name"] for t in tools}
    assert names == {"echo", "boom"}
    echo = next(t for t in tools if t["name"] == "echo")
    assert echo["inputSchema"]["required"] == ["text"]
    assert "description" in echo


def test_tools_call_ok():
    client = _client()
    resp = client.post(
        "/",
        json={
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {"name": "echo", "arguments": {"text": "hallo", "n": 5}},
        },
    )
    result = resp.json()["result"]
    content = result["content"]
    assert content[0]["type"] == "text"
    payload = json.loads(content[0]["text"])
    assert payload == {"echo": "hallo", "n": 5}


def test_method_not_found():
    client = _client()
    resp = client.post("/", json={"jsonrpc": "2.0", "id": 4, "method": "does/not-exist"})
    assert resp.json()["error"]["code"] == METHOD_NOT_FOUND


def test_unknown_tool_is_invalid_params():
    client = _client()
    resp = client.post(
        "/",
        json={
            "jsonrpc": "2.0",
            "id": 5,
            "method": "tools/call",
            "params": {"name": "nope", "arguments": {}},
        },
    )
    assert resp.json()["error"]["code"] == INVALID_PARAMS


def test_missing_required_argument_is_invalid_params():
    client = _client()
    resp = client.post(
        "/",
        json={
            "jsonrpc": "2.0",
            "id": 6,
            "method": "tools/call",
            "params": {"name": "echo", "arguments": {"n": 1}},
        },
    )
    assert resp.json()["error"]["code"] == INVALID_PARAMS


def test_wrong_type_argument_is_invalid_params():
    client = _client()
    resp = client.post(
        "/",
        json={
            "jsonrpc": "2.0",
            "id": 7,
            "method": "tools/call",
            "params": {"name": "echo", "arguments": {"text": "x", "n": "nope"}},
        },
    )
    assert resp.json()["error"]["code"] == INVALID_PARAMS


def test_handler_exception_is_internal_error():
    client = _client()
    resp = client.post(
        "/",
        json={
            "jsonrpc": "2.0",
            "id": 8,
            "method": "tools/call",
            "params": {"name": "boom", "arguments": {}},
        },
    )
    assert resp.json()["error"]["code"] == INTERNAL_ERROR


def test_parse_error_on_invalid_json():
    client = _client()
    resp = client.post(
        "/",
        content=b"{not json",
        headers={"Content-Type": "application/json"},
    )
    assert resp.json()["error"]["code"] == PARSE_ERROR

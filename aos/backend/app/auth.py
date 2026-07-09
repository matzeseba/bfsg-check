"""Login + Session-Cookie-HMAC + require_auth-Dependency.

Cookie-Format (EXAKT mit Frontend-Middleware abgestimmt, ARCHITECTURE.md Paragraph 4):
    base64url(payload_json) + "." + base64url(hmac_sha256(payload_b64_string, AOS_SESSION_SECRET))
    payload = {"exp": <unix_ts>}   (Gueltigkeit 7 Tage)
base64url ohne Padding (JWT-Stil). HMAC-Nachricht ist der base64url-Payload-STRING.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

from fastapi import Depends, HTTPException, Request

from .config import INSECURE_SESSION_SECRET, Settings, get_settings

COOKIE_NAME = "aos_session"
TTL_DAYS = 7
_TTL_SECONDS = TTL_DAYS * 24 * 60 * 60


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(text: str) -> bytes:
    pad = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + pad)


def _sign(secret: str, payload_b64: str) -> str:
    digest = hmac.new(
        secret.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256
    ).digest()
    return _b64url_encode(digest)


def make_session_cookie(secret: str, ttl_seconds: int = _TTL_SECONDS) -> str:
    payload = {"exp": int(time.time()) + ttl_seconds}
    payload_json = json.dumps(payload, separators=(",", ":"))
    payload_b64 = _b64url_encode(payload_json.encode("utf-8"))
    return f"{payload_b64}.{_sign(secret, payload_b64)}"


def verify_session_cookie(secret: str, cookie: str) -> bool:
    # Fail-closed: ein leeres oder das oeffentlich bekannte Platzhalter-Secret darf
    # NIE eine Session validieren — sonst koennte jeder ein gueltiges Cookie faelschen
    # (Auth-Bypass, wenn AOS_SESSION_SECRET im Deploy fehlt).
    if not secret or secret == INSECURE_SESSION_SECRET:
        return False
    if not cookie or "." not in cookie:
        return False
    payload_b64, _, sig_b64 = cookie.partition(".")
    if not payload_b64 or not sig_b64:
        return False
    expected = _sign(secret, payload_b64)
    if not hmac.compare_digest(expected, sig_b64):
        return False
    try:
        payload = json.loads(_b64url_decode(payload_b64))
    except (ValueError, json.JSONDecodeError):
        return False
    exp = payload.get("exp")
    if not isinstance(exp, (int, float)):
        return False
    return time.time() < exp


def _bearer_ok(request: Request, settings: Settings) -> bool:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return False
    token = header[len("Bearer ") :]
    return bool(settings.admin_token) and hmac.compare_digest(
        token, settings.admin_token
    )


def require_auth(
    request: Request, settings: Settings = Depends(get_settings)
) -> bool:
    """Zugriff erlaubt bei gueltigem Session-Cookie ODER Bearer AOS_ADMIN_TOKEN."""
    if _bearer_ok(request, settings):
        return True
    cookie = request.cookies.get(COOKIE_NAME)
    if cookie and verify_session_cookie(settings.session_secret, cookie):
        return True
    raise HTTPException(status_code=401, detail="Nicht authentifiziert")

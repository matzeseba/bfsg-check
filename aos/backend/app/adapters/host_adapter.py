"""Host-Adapter — CPU/RAM/Disk via psutil, Container-Liste optional via Docker-Proxy.

Container-Liste nur wenn AOS_DOCKER_SOCK=true; die Abfrage laeuft ueber einen
read-only docker-socket-proxy (AOS_DOCKER_PROXY_URL, nur GET /containers/json) —
NICHT direkt gegen /var/run/docker.sock (voller Daemon-Zugriff = Root-Eskalation
auf dem Host). Jeder Fehler -> containers:null. Shape exakt nach
ARCHITECTURE.md Paragraph 4 (health/host).
"""

from __future__ import annotations

from typing import Any

import httpx
import psutil

from ..config import Settings


def host_metrics(settings: Settings) -> dict[str, Any]:
    cpu_pct = psutil.cpu_percent(interval=0.1)
    vm = psutil.virtual_memory()
    disk = psutil.disk_usage("/") if _has_root() else psutil.disk_usage(".")
    return {
        "cpu_pct": round(cpu_pct, 1),
        "mem_used_mb": round((vm.total - vm.available) / (1024 * 1024)),
        "mem_total_mb": round(vm.total / (1024 * 1024)),
        "disk_used_pct": round(disk.percent, 1),
        "containers": _containers(settings),
    }


def _has_root() -> bool:
    import os

    return os.path.exists("/var")


def _containers(settings: Settings) -> list[dict[str, Any]] | None:
    if not settings.docker_sock:
        return None
    try:
        base_url = settings.docker_proxy_url.rstrip("/")
        with httpx.Client(base_url=base_url, timeout=3.0) as c:
            resp = c.get("/containers/json", params={"all": "false"})
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, ValueError, OSError):
        return None

    out: list[dict[str, Any]] = []
    for item in data:
        names = item.get("Names") or []
        name = names[0].lstrip("/") if names else item.get("Id", "")[:12]
        out.append(
            {
                "name": name,
                "status": item.get("State", item.get("Status", "unknown")),
                "mem_mb": _container_mem_mb(item),
            }
        )
    return out


def _container_mem_mb(item: dict[str, Any]) -> int | None:
    # /containers/json liefert keine Live-Speicherwerte; ohne /stats bleibt es None.
    _ = item
    return None

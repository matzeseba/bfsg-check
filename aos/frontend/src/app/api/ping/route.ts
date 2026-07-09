/**
 * Interner Healthcheck-Endpunkt fuer den Docker-Healthcheck des Frontend-
 * Containers (node-fetch auf localhost:3100/api/ping, Spec §2).
 *
 * Hinweis: In Produktion proxyt Caddy /api/* an das Backend — dieser Pfad wird
 * daher NUR containerintern (localhost) getroffen und kollidiert nicht mit der
 * Backend-API.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json({ ok: true, service: "aos-frontend" });
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/**
 * Auth-Gate (Edge-Runtime).
 * Verifiziert das aos_session-Cookie via Web-Crypto-HMAC-SHA256 gegen
 * process.env.AOS_SESSION_SECRET (Format: siehe src/lib/auth.ts).
 *
 * /api/* wird in Produktion von Caddy direkt an das Backend geroutet und
 * erreicht die Middleware gar nicht — der matcher schliesst es zusaetzlich aus.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login-Seite ist oeffentlich.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AOS_SESSION_SECRET;
  const authenticated = await verifySession(cookie, secret);

  if (!authenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Alles ausser: API (Caddy->Backend), Next-Interna, statische Dateien mit Endung.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand|.*\\..*).*)"],
};

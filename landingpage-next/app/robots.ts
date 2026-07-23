import type { MetadataRoute } from "next";

import { SITE } from "@/lib/config";

// Domain aus lib/config.ts (SITE.url = Single Source of Truth für canonical/OG/sitemap).
const siteUrl = SITE.url;

// AI-Crawler-Policy (Stand 23.07.2026, Beschluss-Vorlage marketing/swarm-2026-07-23/agent-05-seo-aeo.md):
// Such-/User-Crawler explizit willkommen (AEO-Zitier-Sichtbarkeit ist Kernkanal).
// Trainings-Crawler ebenfalls erlaubt: Inhalte sind Marketing, Präsenz in Modell-Wissen
// stützt KI-Markenempfehlungen. Bei Policy-Wechsel: für GPTBot/ClaudeBot/
// Google-Extended/CCBot "allow: '/'" auf "disallow: '/'" ändern.
// HINWEIS: Google-Extended-Blockade schützt NICHT vor AI Overviews (die nutzen
// Googlebot) — deshalb hier bewusst erlaubt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

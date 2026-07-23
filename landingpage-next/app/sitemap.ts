import type { MetadataRoute } from "next";

import { SITE } from "@/lib/config";

// Domain aus lib/config.ts (SITE.url = Single Source of Truth für canonical/OG/sitemap).
const siteUrl = SITE.url;

// HINWEIS: /widerruf, /kuendigen und /datenschutz/anfrage tragen robots
// noindex (Formular-Seiten) und gehören deshalb NICHT in die Sitemap —
// eingereichte noindex-URLs erzeugen in der Search Console Konflikt-Meldungen.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/datenschutz`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/agb`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/impressum`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/widerrufsbelehrung`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // Partnerprogramm (Agentur-Inbound)
    {
      url: `${siteUrl}/partner`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // SEO Pillar Pages
    {
      url: `${siteUrl}/bfsg-checkliste-online-shop`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/bfsg-pruefung-kosten`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/barrierefreiheitserklaerung-muster`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cookie-banner-fehler`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/axe-lighthouse-wave-vergleich`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/wcag-2-1-vs-2-2`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/bfsg-frist`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/barrierefreiheit-testen`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/bfsg-fuer-webagenturen`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/pdf-barrierefrei-machen`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/mobile-barrierefreiheit`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/bfsg-software-anbieter-vergleich`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/bfsg-1-jahr-bilanz`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/mlbf-pruefstrategie`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // AEO-Sprint-Seiten (23.07.2026, marketing/swarm-2026-07-23/agent-05-seo-aeo.md):
    // Abmahnung-Kosten und Abmahnung-erhalten sind news-getrieben (Urteile zu § 3a UWG
    // und weitere Abmahnwellen erwartet) → weekly;
    // Ausnahmen und Scanner-vs-Audit sind Evergreen → monthly wie die übrigen Pillar-Pages.
    {
      url: `${siteUrl}/bfsg-abmahnung-kosten`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/abmahnung-erhalten`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/bfsg-ausnahmen`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/wcag-scanner-vs-audit`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

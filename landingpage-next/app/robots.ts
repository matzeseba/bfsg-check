import type { MetadataRoute } from "next";

import { SITE } from "@/lib/config";

// Domain aus lib/config.ts (SITE.url = Single Source of Truth für canonical/OG/sitemap).
const siteUrl = SITE.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

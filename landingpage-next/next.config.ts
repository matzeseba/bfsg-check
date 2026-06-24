import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // motion + lucide-react werden über benannte Imports (* as motion) in vielen
  // Client-Sektionen auf der LCP-Route genutzt. optimizePackageImports lädt nur
  // die tatsächlich verwendeten Module → kleinerer kritischer Client-JS-Pfad.
  // lucide-react ist in Next 16 bereits default-optimiert, motion nicht.
  experimental: {
    optimizePackageImports: ["motion", "lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

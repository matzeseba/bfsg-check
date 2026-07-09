import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // Standalone-Tracing deterministisch auf dieses Verzeichnis verankern
  // (verhindert, dass ein Eltern-Lockfile die Workspace-Root verschiebt).
  outputFileTracingRoot: here,
};

export default nextConfig;

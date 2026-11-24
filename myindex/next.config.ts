import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Stellt beim lokalen Entwickeln die Cloudflare-Bindungen (z. B. die D1-Datenbank) bereit.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  cacheComponents: false,
  // Temporäre öffentliche Adressen beim Entwickeln (Tunnel und Codespaces).
  allowedDevOrigins: ["**.trycloudflare.com", "**.app.github.dev"],
  experimental: {
    // Profilfotos und Projektbilder; der Browser verkleinert sie vorher.
    serverActions: { bodySizeLimit: "3mb" },
  },
  async rewrites() {
    // Profiladressen wie /@lena.mueller zeigen die Seite unter /u/lena.mueller.
    return [{ source: "/@:handle", destination: "/u/:handle" }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

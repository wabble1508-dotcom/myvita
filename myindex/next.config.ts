import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Footprint data changes on each action, so pages stay dynamic.
  cacheComponents: false,
  // Temporary public addresses for the running app (tunnel and Codespaces).
  allowedDevOrigins: ["**.trycloudflare.com", "**.app.github.dev"],
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

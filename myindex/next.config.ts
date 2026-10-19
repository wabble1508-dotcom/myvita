import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Footprint data changes on each action, so pages stay dynamic.
  cacheComponents: false,
  // The temporary public address used to send the running app.
  allowedDevOrigins: ["**.trycloudflare.com"],
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

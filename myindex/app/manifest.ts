import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyVita",
    short_name: "MyVita",
    description: "Deine Vita. Alles an einem Ort.",
    start_url: "/profil",
    scope: "/",
    display: "standalone",
    background_color: "#08090c",
    theme_color: "#08090c",
    lang: "de",
    icons: [
      { src: "/app-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

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
    icons: [{ src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}

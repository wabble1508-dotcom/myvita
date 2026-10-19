import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyVita",
    short_name: "MyVita",
    description: "Personenansicht für alles, was im Netz zu einem Namen liegt.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#070b14",
    theme_color: "#070b14",
    lang: "de",
  };
}

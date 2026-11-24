import { ImageResponse } from "next/og";
import { BrandTile } from "@/lib/brand-mark";

const SIZES = new Set([192, 512]);

/** App-Symbole zum Installieren auf dem Handy (192 und 512 Pixel). */
export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.has(size)) return new Response("Nicht gefunden", { status: 404 });
  // Etwas Rand, damit Android das Symbol beim Zuschneiden nicht anschneidet.
  return new ImageResponse(<BrandTile size={Math.round(size * 0.55)} radius={0} />, { width: size, height: size });
}

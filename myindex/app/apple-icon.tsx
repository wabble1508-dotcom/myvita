import { ImageResponse } from "next/og";
import { BrandTile } from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rundet die Ecken selbst ab.
export default function AppleIcon() {
  return new ImageResponse(<BrandTile size={112} radius={0} />, { ...size });
}

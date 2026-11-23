import { ImageResponse } from "next/og";
import { BrandTile } from "@/lib/brand-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandTile size={22} radius={8} />, { ...size });
}

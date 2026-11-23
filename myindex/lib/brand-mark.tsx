/** Fingerabdruck-Logo als reines SVG, für erzeugte Bilder (Icons, Vorschaubild). Form wie das Icon in der App. */
const PATHS = [
  "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",
  "M14 13.12c0 2.38 0 6.38-1 8.88",
  "M17.29 21.02c.12-.6.43-2.3.5-3.02",
  "M2 12a10 10 0 0 1 18-6",
  "M2 16h.01",
  "M21.8 16c.2-2 .131-5.354 0-6",
  "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",
  "M8.65 22c.21-.66.45-1.32.57-2",
  "M9 6.8a6 6 0 0 1 9 5.2v2",
];

export const BRAND_BLUE = "#2f6bff";

export function BrandMark({ size, color = "#ffffff" }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function BrandTile({ size, radius }: { size: number; radius: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_BLUE,
        borderRadius: radius,
      }}
    >
      <BrandMark size={size} />
    </div>
  );
}

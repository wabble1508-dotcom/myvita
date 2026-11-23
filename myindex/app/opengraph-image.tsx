import { ImageResponse } from "next/og";
import { BRAND_BLUE, BrandMark } from "@/lib/brand-mark";

export const alt = "MyVita – Deine Vita. Alles an einem Ort.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "radial-gradient(900px 400px at 15% -10%, rgba(47,107,255,0.35), #08090c 70%)",
          color: "#f4f4f5",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: BRAND_BLUE }}>
            <BrandMark size={44} />
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600 }}>MyVita</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 600, lineHeight: 1.05, maxWidth: 900 }}>Deine Vita. Alles an einem Ort.</div>
          <div style={{ display: "flex", gap: 12 }}>
            {["Lebenslauf", "Portfolio", "Alle Kanäle", "Bewerben per Link"].map((label) => (
              <div
                key={label}
                style={{ display: "flex", border: "1px solid rgba(126,166,255,0.35)", borderRadius: 999, padding: "10px 20px", fontSize: 24, color: "#cfe0ff" }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

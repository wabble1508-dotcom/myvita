import { ImageResponse } from "next/og";

export const alt = "MyVita";
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
          background: "#070b14",
          color: "#f8fafc",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#99f6e4" }}>MYVITA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 600, lineHeight: 1.05, maxWidth: 860 }}>
            Was im Netz zu einem Namen liegt.
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["Profile", "Videos", "Seiten"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: 999,
                  padding: "10px 18px",
                  fontSize: 24,
                  color: "#cbd5e1",
                }}
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
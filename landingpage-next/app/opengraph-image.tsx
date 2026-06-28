import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt =
  "Barrierefrei-Prüfen — Barrierefreiheit für Ihre Website prüfen. Automatischer Scan mit Fix-Plan.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0b1220 100%)",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#22d3ee",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Barrierefrei-Prüfen
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "#94a3b8",
              }}
            >
              barrierefrei-pruefen.de
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid #334155",
              fontSize: "20px",
              color: "#cbd5f5",
            }}
          >
            BFSG ab 28. Juni 2025 verpflichtend
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "1000px",
            }}
          >
            Barrierefreiheit für Ihre Website prüfen.
          </div>
          <div
            style={{
              fontSize: "30px",
              color: "#cbd5f5",
              maxWidth: "920px",
              lineHeight: 1.3,
            }}
          >
            Automatischer Scan, verständlicher Fix-Plan und laufendes
            Monitoring — bevor Bußgelder drohen.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "22px",
            color: "#94a3b8",
          }}
        >
          <span>WCAG 2.1 AA · Fix-Plan · Re-Check-Abo</span>
          <span style={{ color: "#22d3ee", fontWeight: 600 }}>
            barrierefrei-pruefen.de
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

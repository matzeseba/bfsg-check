import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt =
  "BFSG-Fuchs — Schlau wie ein Fuchs, bereit fürs BFSG. Automatischer WCAG-Scan mit Fix-Plan und menschlicher Sichtung.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Social-Share-Karte in der BFSG-Fuchs-Palette (warmes Braun-Schwarz + Orange-Akzent
// + Mint-Action). Bewusst ohne fs-Bild-Embed / Custom-Font / Emoji → keine Runtime-
// Fehlerquelle (Default-Satori-Font). WICHTIG (Satori): JEDES Element mit >1 Kind
// braucht display:flex — daher konsequent flex + eigene Spans. Domain = aktuell
// produktive bfsg-fix.de (Cutover folgt).
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
            "linear-gradient(135deg, #0f0b09 0%, #1a1007 55%, #0b0807 100%)",
          color: "#f7f1ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "#ED6A33",
              color: "#1c0d04",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              BFSG·Fuchs
            </span>
            <span style={{ fontSize: "18px", color: "#a99f93" }}>bfsg-fix.de</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(237,106,51,0.4)",
              color: "#f1a878",
              fontSize: "20px",
            }}
          >
            BFSG seit 28.06.2025 in Kraft · WCAG 2.1 AA · EN 301 549
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              fontSize: "70px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "1040px",
            }}
          >
            <span>Schlau wie ein Fuchs — bereit fürs&nbsp;</span>
            <span style={{ color: "#ED6A33" }}>BFSG?</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              color: "#b6a89d",
              maxWidth: "940px",
              lineHeight: 1.3,
            }}
          >
            Automatischer WCAG-Scan, priorisierter Fix-Plan und menschliche
            Sichtung — Premium-Audit ohne Kanzlei-Honorar.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "22px",
            color: "#a99f93",
          }}
        >
          <span>Report &amp; Erklärung · Cookie-Check · Re-Check-Abo</span>
          <span style={{ color: "#34d99a", fontWeight: 700 }}>
            der Fuchs prüft kostenlos →
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

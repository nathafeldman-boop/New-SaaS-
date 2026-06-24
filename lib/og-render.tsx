import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = `${siteConfig.name} — ${siteConfig.tagline}`;

/** Image de partage (réseaux sociaux / aperçu Google) — générée à la volée. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #FBF7F1 0%, #F1E4D3 60%, #E7D3BD 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "#2c211a",
              color: "#FBF7F1",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#2c211a" }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#2c211a",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            Ton coach capillaire IA
          </div>
          <div style={{ fontSize: 34, color: "#6b5440", lineHeight: 1.3, maxWidth: 900 }}>
            Diagnostic par photo, routine de 30 jours sur-mesure et essayage de
            coupes avant le coiffeur.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 28px",
              borderRadius: 999,
              background: "#2c211a",
              color: "#FBF7F1",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            capilatyx.website
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#8a6f53", fontSize: 26 }}>
            Sans installation · dès {siteConfig.price.amount}{siteConfig.price.period}
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}

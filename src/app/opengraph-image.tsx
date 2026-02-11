import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "ImpostoFacil - Guia da Reforma Tributaria Brasileira"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            🛡
          </div>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            ImpostoFacil
          </span>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Descubra em 2 minutos quanto a reforma tributaria vai custar para sua empresa
        </div>
        <div
          style={{
            marginTop: "40px",
            padding: "14px 32px",
            background: "white",
            color: "#0f172a",
            borderRadius: "12px",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Simular impacto agora
        </div>
      </div>
    ),
    { ...size }
  )
}

import { ImageResponse } from "next/og";
import path from "path";
import fs from "fs/promises";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function DefaultOpenGraphImage() {
  // Satori cannot parse GeistMonoVF.woff (variable WOFF). Use a static TTF.
  const fontPath = path.join(
    process.cwd(),
    "src",
    "app",
    "fonts",
    "boot",
    "DejaVuSansMono-Bold.ttf",
  );
  const fontData = await fs.readFile(fontPath);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          background: "#0a0e14",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'DejaVu Sans Mono'",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 72, marginBottom: 16, color: "#00d4ff" }}>
            witl@xyz:~$ whoami
          </div>
          <div style={{ display: "flex", fontSize: 48, color: "#94a3b8" }}>Tyler Witlin</div>
          <div style={{ display: "flex", fontSize: 28, marginTop: 16, color: "#3dd68c" }}>
            DevOps Engineer @ Cisco Systems
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "DejaVu Sans Mono",
          data: fontData,
          weight: 700,
        },
      ],
    }
  );
}

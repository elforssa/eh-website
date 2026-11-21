import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// WhatsApp link preview: the transparent logo on a white card, so it stays
// legible in WhatsApp dark mode. Same image as /enquete.
export const alt = "English Hills";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/eh-logo-new.png"), "base64");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={`data:image/png;base64,${logo}`} width={812} height={443} />
      </div>
    ),
    size,
  );
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(join(process.cwd(), "app/fonts/og/archivo-latin-800-normal.woff")),
  readFile(join(process.cwd(), "app/fonts/og/archivo-latin-500-normal.woff")),
]);

function sinePath(w: number, h: number, cycles: number, amp: number) {
  let d = "";
  for (let i = 0; i <= 240; i++) {
    const x = (i / 240) * w;
    const y = h / 2 - Math.sin((i / 240) * cycles * 2 * Math.PI) * amp;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/** Shared social card: the scope graticule, a CH1 trace and the page's title. */
export async function ogCard({ title, kicker, footer }: { title: string; kicker: string; footer: string }) {
  const [bold, medium] = await fonts;
  const W = ogSize.width;
  const H = ogSize.height;
  const size = title.length > 46 ? 64 : title.length > 28 ? 80 : 104;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0f1215", position: "relative" }}>
        <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`x${i}`} x1={i * 100} y1={0} x2={i * 100} y2={H} stroke="#1d2227" strokeWidth={1} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`y${i}`} x1={0} y1={i * 105} x2={W} y2={i * 105} stroke="#1d2227" strokeWidth={1} />
          ))}
          <path d={sinePath(W, 300, 2.5, 70)} transform="translate(0 255)" fill="none" stroke="#e8d44d" strokeOpacity={0.25} strokeWidth={14} />
          <path d={sinePath(W, 300, 2.5, 70)} transform="translate(0 255)" fill="none" stroke="#e8d44d" strokeWidth={4} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", width: "100%", height: "100%" }}>
          <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 500, fontSize: 28, color: "#8b939a" }}>{kicker}</div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontFamily: "Archivo",
              fontWeight: 800,
              fontSize: size,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "#e6e8e3",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontFamily: "Archivo", fontWeight: 500, fontSize: 26, color: "#e6e8e3" }}>{footer}</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Archivo", data: bold, weight: 800, style: "normal" },
        { name: "Archivo", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}

import { createHash } from "node:crypto";

/** Daily, irreversible visitor id: hash of IP + user agent + day. No raw IP is kept. */
export function visitorId(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${ua}|${day}|mg-portfolio`).digest("hex").slice(0, 16);
}

export function cityOf(request: Request) {
  const v = request.headers.get("x-vercel-ip-city");
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

import { rpc } from "@/lib/supabase-public";
import { trackEvents, type TrackEvent } from "@/lib/track-events";
import { cityOf, visitorId } from "@/lib/visitor";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|vercel-screenshot|python|curl|wget/i;

function clip(v: unknown, max: number): string | null {
  return typeof v === "string" && v.length ? v.slice(0, max) : null;
}

function device(ua: string): string {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function browser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Outro";
}


/**
 * Records one event. No cookies and no raw IP are stored: the visitor id is a
 * hash of IP + browser + day, so it changes every day and can't be reversed.
 * City/region/country come from Vercel's edge headers.
 */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const name = body.name as TrackEvent;
  if (!trackEvents.includes(name)) return new Response(null, { status: 400 });

  const visitor = visitorId(request);

  let referrerHost: string | null = null;
  const ref = clip(body.referrer, 500);
  if (ref) {
    try {
      const host = new URL(ref).hostname.replace(/^www\./, "");
      if (!host.endsWith("mauriciogedrat.vercel.app") && host !== "localhost") referrerHost = host;
    } catch {}
  }

  await rpc("track_event", {
    p_name: name,
    p_path: clip(body.path, 200),
    p_target: clip(body.target, 200),
    p_locale: clip(body.locale, 5),
    p_referrer: referrerHost,
    p_country: request.headers.get("x-vercel-ip-country"),
    p_region: request.headers.get("x-vercel-ip-country-region"),
    p_city: cityOf(request),
    p_device: device(ua),
    p_browser: browser(ua),
    p_visitor: visitor,
  });

  return new Response(null, { status: 204 });
}

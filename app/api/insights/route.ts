import { rpc } from "@/lib/supabase-public";

/** Proxies the password-checked insights query. The password check happens in Postgres. */
export async function POST(request: Request) {
  let body: { key?: unknown; days?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const key = typeof body.key === "string" ? body.key.slice(0, 200) : "";
  const days = Math.min(365, Math.max(1, Number(body.days) || 30));
  if (!key) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await rpc<Record<string, unknown> | null>("get_insights", { p_key: key, p_days: days });
  if (!data) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}

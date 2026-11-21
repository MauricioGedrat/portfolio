import { rpc } from "@/lib/supabase-public";

/** Password-checked inbox for the /insights page. */
export async function POST(request: Request) {
  let key = "";
  try {
    const b = await request.json();
    key = typeof b.key === "string" ? b.key.slice(0, 200) : "";
  } catch {}
  if (!key) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { data } = await rpc<unknown[] | null>("get_messages", { p_key: key });
  if (!data) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}

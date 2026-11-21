/**
 * Public Supabase coordinates. The publishable key is safe to ship: the
 * events table has RLS on with no policies, so the only way in is through
 * the two SECURITY DEFINER functions (track_event, get_insights).
 */
export const SUPABASE_URL = "https://brczkncaqyhuxkmhczfx.supabase.co";
export const SUPABASE_KEY = "sb_publishable_sF-lz0QAdNiGP0DBjuYHSQ_9F69b4kw";

export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: T | null }> {
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, status: 0, data: null };
  }
  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {}
  return { ok: res.ok, status: res.status, data };
}

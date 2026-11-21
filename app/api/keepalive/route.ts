import { connection } from "next/server";
import { rpc } from "@/lib/supabase-public";

/** Daily Vercel cron: one tiny query so the free Supabase project never pauses. */
export async function GET() {
  await connection();
  const { ok } = await rpc("keepalive", {});
  return Response.json({ ok });
}

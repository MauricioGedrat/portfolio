import { after } from "next/server";
import { notifyContact } from "@/lib/notify";
import { rpc } from "@/lib/supabase-public";
import { cityOf, visitorId } from "@/lib/visitor";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Contact form. Spam guards: a hidden honeypot field, a minimum fill time,
 * length/format checks here and again in Postgres, and 5 messages per visitor per day.
 */
export async function POST(request: Request) {
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return Response.json({ status: "invalid" }, { status: 400 });
  }
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(b.name);
  const email = str(b.email);
  const message = str(b.message);
  const locale = str(b.locale).slice(0, 5);

  // Bots fill every field and submit instantly: pretend it worked.
  const startedAt = Number(b.startedAt) || 0;
  if (str(b.company) || Date.now() - startedAt < 2500) return Response.json({ status: "ok" });

  if (!name || name.length > 80 || !EMAIL.test(email) || email.length > 120 || message.length < 10 || message.length > 2000) {
    return Response.json({ status: "invalid" }, { status: 400 });
  }

  const city = cityOf(request);
  const { ok, data } = await rpc<string>("submit_message", {
    p_name: name,
    p_email: email,
    p_body: message,
    p_locale: locale,
    p_city: city,
    p_visitor: visitorId(request),
  });
  if (!ok) return Response.json({ status: "error" }, { status: 502 });
  if (data === "limited") return Response.json({ status: "limited" }, { status: 429 });
  if (data !== "ok") return Response.json({ status: "invalid" }, { status: 400 });
  // Saved. The e-mail notice goes out after the response, so the visitor never waits on it.
  after(() => notifyContact({ name, email, message, locale, city }));
  return Response.json({ status: "ok" });
}

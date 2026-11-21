import { profile } from "@/content/profile";

/**
 * E-mail notice for each contact-form message, via Resend's free plan.
 *
 * Without a verified domain Resend only sends from onboarding@resend.dev and
 * only to the address the Resend account was created with, which is all we need
 * here: a notice to the site owner. Set in Vercel:
 *   RESEND_API_KEY  (required)   re_... key with "Sending access"
 *   CONTACT_TO      (optional)   inbox for the notices; defaults to the profile e-mail
 * The message is always saved in Supabase first, so a failed e-mail loses nothing:
 * it still shows up in /insights.
 */
export const emailNotifyOn = () => Boolean(process.env.RESEND_API_KEY);

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export async function notifyContact(m: { name: string; email: string; message: string; locale: string; city: string | null }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "no-key" as const };
  const to = process.env.CONTACT_TO || profile.email;
  const site = "https://mauriciogedrat.vercel.app";
  const where = [m.city, m.locale === "en" ? "site em inglês" : "site em português"].filter(Boolean).join(" · ");
  const text = `${m.name} <${m.email}> escreveu pelo formulário do portfólio (${where}):\n\n${m.message}\n\nResponda direto a este e-mail para falar com ${m.name}.\nTodas as mensagens: ${site}/pt/insights`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
<p style="margin:0 0 4px"><strong>${esc(m.name)}</strong> &lt;${esc(m.email)}&gt;</p>
<p style="margin:0 0 16px;color:#666;font-size:13px">${esc(where)}</p>
<p style="margin:0 0 20px;white-space:pre-wrap">${esc(m.message)}</p>
<p style="margin:0;color:#666;font-size:13px">Responda direto a este e-mail para falar com ${esc(m.name)}. Todas as mensagens ficam em <a href="${site}/pt/insights">${site}/pt/insights</a>.</p>
</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Portfólio <onboarding@resend.dev>",
        to: [to],
        reply_to: m.email,
        subject: `Nova mensagem no portfólio: ${m.name}`.slice(0, 120),
        text,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[contact] resend", res.status, (await res.text()).slice(0, 300));
    return { sent: res.ok, reason: res.ok ? null : (`http-${res.status}` as const) };
  } catch (e) {
    console.error("[contact] resend failed", e);
    return { sent: false, reason: "network" as const };
  }
}

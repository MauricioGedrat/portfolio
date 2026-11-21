import { profile } from "@/content/profile";
import { hasLocale } from "@/lib/i18n";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Maurício Gedrat — Eletrônica × Software";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "pt";
  return ogCard({
    title: profile.name,
    kicker: profile.role[l],
    footer: l === "pt" ? "Portfólio · mauriciogedrat.vercel.app" : "Portfolio · mauriciogedrat.vercel.app",
  });
}

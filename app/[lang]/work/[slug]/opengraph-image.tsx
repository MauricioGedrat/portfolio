import { getProject } from "@/content/projects";
import { hasLocale, t } from "@/lib/i18n";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Projeto de Maurício Gedrat";

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const l = hasLocale(lang) ? lang : "pt";
  const p = getProject(slug);
  return ogCard({
    title: p ? p.title.split(":")[0] : "Maurício Gedrat",
    kicker: p?.award ? t(p.award, l) : `Maurício Gedrat · ${p?.year ?? ""}`,
    footer: p ? t(p.subtitle, l) : "mauriciogedrat.vercel.app",
  });
}

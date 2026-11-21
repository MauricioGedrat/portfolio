import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pair = (path: string, priority: number) => ({
    url: `${SITE_URL}/pt${path}`,
    priority,
    alternates: { languages: { "pt-BR": `${SITE_URL}/pt${path}`, en: `${SITE_URL}/en${path}` } },
  });
  return [pair("", 1), pair("/resume", 0.8), ...projects.map((p) => pair(`/work/${p.slug}`, p.featured ? 0.7 : 0.5))];
}

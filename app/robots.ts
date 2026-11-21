import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/pt/insights", "/en/insights", "/pt/studio", "/en/studio"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightsApp } from "@/components/insights-app";
import { hasLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Insights",
  robots: { index: false, follow: false },
};

export default async function InsightsPage({ params }: PageProps<"/[lang]/insights">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <InsightsApp lang={lang} />;
}

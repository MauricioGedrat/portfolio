import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioApp } from "@/components/studio-app";
import { projects } from "@/content/projects";
import { hasLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false } };

export default async function StudioPage({ params }: PageProps<"/[lang]/studio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <StudioApp lang={lang} base={projects} />;
}

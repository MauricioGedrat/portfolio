import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { Analytics } from "@/components/analytics";
import { RevealObserver } from "@/components/reveal-observer";
import { revealBootScript } from "@/lib/reveal-boot";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getDictionary, hasLocale, locales } from "@/lib/i18n";
import { profile } from "@/content/profile";

const archivo = localFont({
  src: [
    { path: "../fonts/archivo-latin-wdth-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/archivo-latin-ext-wdth-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: { default: `${profile.name} — ${profile.role[lang]}`, template: `%s — ${profile.name}` },
    description: profile.statement[lang],
    alternates: { languages: { "pt-BR": "/pt", en: "/en" } },
  };
}

export const viewport: Viewport = { themeColor: "#0f1215" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);

  return (
    <html lang={lang === "pt" ? "pt-BR" : "en"} className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootScript }} />
      </head>
      <body className="font-sans">
        <RevealObserver />
        <Analytics />
        <a
          href="#main"
          className="sr-only z-50 bg-ch1 px-4 py-2 text-screen focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {d.nav.skip}
        </a>
        <Nav lang={lang} d={d} />
        <main id="main">{children}</main>
        <Footer lang={lang} d={d} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignalChain } from "@/components/signal-chain";
import { getProject, projects } from "@/content/projects";
import { getDictionary, hasLocale, locales, t } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getProject(slug);
  if (!p || !hasLocale(lang)) return {};
  return { title: p.title.split(":")[0], description: t(p.summary, lang) };
}

export default async function CaseStudy({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { lang, slug } = await params;
  const p = getProject(slug);
  if (!p || !hasLocale(lang)) notFound();
  const d = getDictionary(lang);

  const ranked = [...projects].sort((a, b) => a.order - b.order);
  const next = ranked[(ranked.findIndex((x) => x.slug === p.slug) + 1) % ranked.length];
  const [headline, subhead] = p.title.split(":");

  return (
    <article className="pt-[var(--nav-h)]">
      <header className="grid-frame pb-16 pt-12 md:pt-20">
        <Link href={`/${lang}#work`} className="col-span-12 text-sm text-dim hover:text-ink">
          ← {d.caseStudy.back}
        </Link>
        <h1 className="display condensed col-span-12 mt-10 text-[clamp(2.8rem,8vw,7.5rem)] lg:col-span-11">
          {headline}
          {subhead && <span className="mt-3 block text-[0.42em] font-semibold leading-tight text-dim">{subhead.trim()}</span>}
        </h1>
        <p className="measure col-span-12 mt-8 text-lg leading-snug md:col-span-8">{t(p.subtitle, lang)}</p>

        <dl className="col-span-12 mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-graticule pt-5 text-sm md:grid-cols-4">
          <div>
            <dt className="text-dim">{d.caseStudy.year}</dt>
            <dd className="tabular">{p.period ? t(p.period, lang) : p.year}</dd>
          </div>
          {p.context && (
            <div className="col-span-2 md:col-span-1">
              <dt className="text-dim">{d.caseStudy.context}</dt>
              <dd>{t(p.context, lang)}</dd>
            </div>
          )}
          {p.collaborators && (
            <div>
              <dt className="text-dim">{d.caseStudy.team}</dt>
              <dd>Maurício Gedrat, {p.collaborators.join(", ")}</dd>
            </div>
          )}
          {p.award && (
            <div className="col-span-2 md:col-span-1">
              <dt className="text-dim">{lang === "pt" ? "Prêmio" : "Award"}</dt>
              <dd className="flex items-start gap-2">
                <span aria-hidden className="mt-2.5 inline-block h-px w-4 shrink-0 bg-ch1" />
                {t(p.award, lang)}
              </dd>
            </div>
          )}
        </dl>
      </header>

      <CaseSection title={d.caseStudy.overview}>
        <p className="measure text-lg leading-snug">{t(p.summary, lang)}</p>
      </CaseSection>

      <CaseSection title={d.caseStudy.problem}>
        <p className="measure">{t(p.problem, lang)}</p>
      </CaseSection>

      <CaseSection title={d.caseStudy.approach}>
        <ol className="measure space-y-4">
          {p.approach.map((step, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_1fr]">
              <span className="tabular text-sm text-dim">{String(i + 1).padStart(2, "0")}</span>
              <span>{t(step, lang)}</span>
            </li>
          ))}
        </ol>
      </CaseSection>

      <section className="grid-frame py-12">
        <h2 className="col-span-12 mb-6 text-sm text-dim">{d.caseStudy.architecture}</h2>
        <div className="col-span-12">
          <SignalChain nodes={p.chain} lang={lang} />
        </div>
      </section>

      {p.implementation.length > 0 && (
        <CaseSection title={d.caseStudy.implementation}>
          <ul className="measure space-y-3">
            {p.implementation.map((line, i) => (
              <li key={i}>{t(line, lang)}</li>
            ))}
          </ul>
        </CaseSection>
      )}

      <CaseSection title={d.caseStudy.result}>
        <p className="measure text-lg leading-snug">{t(p.result, lang)}</p>
        {p.metrics && (
          <dl className="mt-10 grid gap-px bg-graticule sm:grid-cols-3">
            {p.metrics.map((m) => (
              <div key={m.value} className="bg-screen py-5 pr-5">
                <dd className="tabular display condensed text-[clamp(2rem,4vw,3.2rem)]">
                  {lang === "en" ? m.value.replace(/(\d),(\d)/g, "$1.$2") : m.value}
                </dd>
                <dt className="mt-2 text-sm text-dim">{t(m.label, lang)}</dt>
              </div>
            ))}
          </dl>
        )}
      </CaseSection>

      <CaseSection title={d.caseStudy.technologies}>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {p.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </CaseSection>

      {p.sources.length > 0 && (
        <CaseSection title={d.caseStudy.sources}>
          <ul className="space-y-2">
            {p.sources.map((s) => (
              <li key={s.href}>
                <a href={s.href} className="link-quiet" target="_blank" rel="noopener">
                  {t(s.label, lang)}
                </a>
              </li>
            ))}
          </ul>
        </CaseSection>
      )}

      <nav className="grid-frame border-t border-graticule py-16" aria-label={d.caseStudy.next}>
        <p className="col-span-12 text-sm text-dim">{d.caseStudy.next}</p>
        <Link
          href={`/${lang}/work/${next.slug}`}
          className="display condensed col-span-12 mt-4 text-[clamp(2rem,5vw,4.5rem)] font-bold transition-[font-stretch] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] hover:[font-stretch:96%]"
        >
          {next.title.split(":")[0]}
        </Link>
      </nav>
    </article>
  );
}

function CaseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid-frame border-t border-graticule py-12">
      <h2 className="col-span-12 mb-4 text-sm text-dim md:col-span-3 md:mb-0">{title}</h2>
      <div className="col-span-12 md:col-span-9">{children}</div>
    </section>
  );
}

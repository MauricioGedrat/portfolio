import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { PrintButton } from "@/components/print-button";
import { profile } from "@/content/profile";
import { getProjects } from "@/lib/content";
import { skillGroups, timeline } from "@/content/timeline";
import { getDictionary, hasLocale, t } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/resume">): Promise<Metadata> {
  const { lang } = await params;
  const pt = lang === "pt";
  return {
    title: pt ? "Currículo" : "Resume",
    description: pt
      ? "Currículo de Maurício Gedrat: técnico em eletrônica em formação, desenvolvimento web e projetos de eletrônica."
      : "Maurício Gedrat's resume: electronics technician student, web development and electronics projects.",
    alternates: { canonical: `/${lang}/resume`, languages: { "pt-BR": "/pt/resume", en: "/en/resume" } },
  };
}

export default async function ResumePage({ params }: PageProps<"/[lang]/resume">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const pt = lang === "pt";
  const pdf = pt ? "/cv/curriculo-mauricio-gedrat.pdf" : "/cv/resume-mauricio-gedrat.pdf";

  const education = timeline.filter((e) => e.kind === "education");
  const courses = timeline.filter((e) => e.kind === "course");
  const work = timeline.filter((e) => e.kind === "experience");
  const awards = timeline.filter((e) => e.kind === "achievement");
  const featured = (await getProjects()).filter((p) => p.featured);

  const L = {
    education: pt ? "Formação" : "Education",
    courses: pt ? "Cursos" : "Courses",
    work: pt ? "Experiência" : "Experience",
    projects: pt ? "Projetos" : "Projects",
    awards: pt ? "Prêmios" : "Awards",
    skills: pt ? "Habilidades" : "Skills",
    languages: pt ? "Idiomas" : "Languages",
    print: pt ? "Imprimir" : "Print",
    open: pt ? "Ver projeto" : "View project",
  };

  return (
    <article className="grid-frame pb-24 pt-[calc(var(--nav-h)+3rem)] print:block print:p-0 print:text-black">
      <header data-reveal className="col-span-12 flex flex-wrap items-end justify-between gap-6 print:block">
        <div>
          <h1 className="display condensed text-[clamp(2.6rem,7vw,5.5rem)] print:text-5xl">{profile.name}</h1>
          <p className="mt-3 text-lg font-semibold">{profile.role[lang]}</p>
          <p className="mt-1 text-dim print:text-neutral-600">
            {profile.location[lang]} · <a href={`mailto:${profile.email}`} className="link-quiet">{profile.email}</a>
          </p>
          <p className="mt-1 text-sm text-dim print:text-neutral-600">
            <a href={profile.links.github} className="link-quiet">github.com/MauricioGedrat</a> ·{" "}
            <a href={profile.links.linkedin} className="link-quiet">linkedin.com/in/mauricio-gedrat</a>
          </p>
        </div>
        <div className="flex gap-3 text-sm print:hidden">
          <a href={pdf} download data-track="resume_download" data-track-target={lang} className="bg-ink px-4 py-2.5 font-semibold text-screen hover:bg-ch1">
            {d.resume.download}
          </a>
          <PrintButton label={L.print} />
        </div>
      </header>

      <Block title={L.education} i={1}>
        {education.map((e) => (
          <Entry key={e.id} when={e.year} title={t(e.title, lang)} place={e.place} detail={e.detail && t(e.detail, lang)} />
        ))}
      </Block>

      <Block title={L.work} i={2}>
        {work.map((e) => (
          <Entry key={e.id} when={e.year} title={t(e.title, lang)} place={e.place} detail={e.detail && t(e.detail, lang)} />
        ))}
      </Block>

      <Block title={L.projects} i={3}>
        {featured.map((p) => (
          <div key={p.slug} className="break-inside-avoid py-3 first:pt-0">
            <p className="font-semibold leading-snug">
              <Link href={`/${lang}/work/${p.slug}`} className="link-quiet">
                {p.title.split(":")[0]}
              </Link>
              <span className="tabular ml-2 text-sm font-normal text-dim print:text-neutral-600">{p.year}</span>
            </p>
            <p className="measure mt-1 text-ink/85 print:text-black">{t(p.summary, lang)}</p>
            <p className="measure mt-1 text-sm text-dim print:text-neutral-600">{p.technologies.join(" · ")}</p>
          </div>
        ))}
      </Block>

      <Block title={L.awards} i={4}>
        {awards.map((e) => (
          <Entry key={e.id} when={e.year} title={t(e.title, lang)} place={e.place} detail={e.detail && t(e.detail, lang)} />
        ))}
      </Block>

      <Block title={L.skills} i={5}>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.id} className="break-inside-avoid">
              <dt className="font-semibold">{g.name[lang]}</dt>
              <dd className="text-ink/85 print:text-black">{g.items.map((i) => t(i.name, lang)).join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title={L.courses} i={6}>
        {courses.map((e) => (
          <Entry key={e.id} when={e.year} title={t(e.title, lang)} place={e.place} detail={e.detail && t(e.detail, lang)} />
        ))}
      </Block>

      <Block title={L.languages} i={7}>
        <ul>
          {profile.languages.map((l) => (
            <li key={t(l.name, "en")}>
              {t(l.name, lang)} <span className="text-dim print:text-neutral-600">— {t(l.level, lang)}</span>
            </li>
          ))}
        </ul>
      </Block>
    </article>
  );
}

function Block({ title, i, children }: { title: string; i: number; children: React.ReactNode }) {
  return (
    <section
      data-reveal="line"
      style={{ "--d": `${Math.min(i, 3) * 60}ms` } as CSSProperties}
      className="rule-t col-span-12 mt-12 grid grid-cols-12 gap-x-[var(--gutter)] gap-y-3 pt-5 print:mt-6 print:block"
    >
      <h2 className="col-span-12 text-sm text-dim md:col-span-3 print:mb-2 print:text-xs print:uppercase print:text-neutral-600">{title}</h2>
      <div className="col-span-12 md:col-span-9">{children}</div>
    </section>
  );
}

function Entry({ when, title, place, detail }: { when: string; title: string; place?: string; detail?: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-x-4 py-2 first:pt-0 print:break-inside-avoid">
      <span className="tabular pt-0.5 text-sm text-dim print:text-neutral-600">{when}</span>
      <div>
        <p className="font-semibold leading-snug">{title}</p>
        {place && <p className="text-dim print:text-neutral-600">{place}</p>}
        {detail && <p className="measure mt-1 text-ink/85 print:text-black">{detail}</p>}
      </div>
    </div>
  );
}

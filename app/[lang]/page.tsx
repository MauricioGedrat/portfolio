import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroName } from "@/components/hero-name";
import { ScopeTrace } from "@/components/scope-trace";
import { SectionHeading } from "@/components/section-heading";
import { WorkIndex } from "@/components/work-index";
import { about } from "@/content/about";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { skillGroups, timeline } from "@/content/timeline";
import { getDictionary, hasLocale, t } from "@/lib/i18n";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const ranked = [...projects].sort((a, b) => a.order - b.order);
  const cv = lang === "pt" ? "/cv/curriculo-mauricio-gedrat.pdf" : "/cv/resume-mauricio-gedrat.pdf";

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[var(--nav-h)]">
        {/* Desktop: the scope fills the right side, behind the name, clear of the text. */}
        <ScopeTrace className="absolute bottom-0 right-0 top-[var(--nav-h)] -z-10 hidden w-[64%] md:block [mask-image:linear-gradient(to_right,transparent,black_30%)]" />

        <div className="grid-frame w-full pt-[7vh]">
          <div className="col-span-12">
            <HeroName lines={["Maurício", "Gedrat"]} />
          </div>
        </div>

        {/* Phone: the scope sits in the flow, between the name and the text. */}
        <ScopeTrace className="relative mx-[var(--gutter)] mt-8 h-44 md:hidden" />

        <div className="grid-frame mt-auto w-full gap-y-6 pb-10 pt-10">
          <div className="col-span-12 md:col-span-7 lg:col-span-5">
            <p className="text-lg font-semibold">{profile.role[lang]}</p>
            <p className="measure mt-3 text-ink/85">{profile.statement[lang]}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="#work" className="bg-ink px-4 py-2.5 font-semibold text-screen transition-colors hover:bg-ch1">
                {d.hero.seeWork}
              </a>
              <a href={cv} download className="border border-rule px-4 py-2.5 transition-colors hover:border-ink">
                {d.hero.download}
              </a>
            </div>
          </div>
          <dl className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-3 self-end text-sm md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
            <div>
              <dt className="text-dim">{lang === "pt" ? "Onde" : "Where"}</dt>
              <dd>{profile.location[lang]}</dd>
            </div>
            <div>
              <dt className="text-dim">{lang === "pt" ? "Disponível" : "Available"}</dt>
              <dd>{lang === "pt" ? "Estágio, 2027" : "Internship, 2027"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-dim">{lang === "pt" ? "Destaque" : "Highlight"}</dt>
              <dd>
                <Link href={`/${lang}/work/sentimento-retorno-b3`} className="link-quiet">
                  {d.hero.award}
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ───────────── 01 Work ───────────── */}
      <section id="work" aria-labelledby="work-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="work" title={d.work.title} intro={d.work.intro} />
        <WorkIndex items={ranked} lang={lang} d={d} />
      </section>

      {/* ───────────── 02 About ───────────── */}
      <section id="about" aria-labelledby="about-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="about" title={d.about.title} />
        <dl className="col-span-12 mt-10 md:col-span-11 md:col-start-2">
          {about.map(({ key, text }) => (
            <div key={key} className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-2 border-b border-graticule py-7">
              <dt className="col-span-12 text-sm text-dim md:col-span-3">{d.about[key]}</dt>
              <dd className="measure col-span-12 text-lg leading-snug md:col-span-9">{t(text, lang)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────────── 03 Lab ───────────── */}
      <section id="lab" aria-labelledby="lab-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="lab" title={d.lab.title} intro={d.lab.intro} />
      </section>

      {/* ───────────── 04 Experience ───────────── */}
      <section id="experience" aria-labelledby="experience-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="experience" title={d.experience.title} />
        <ol className="col-span-12 mt-10 md:col-span-11 md:col-start-2">
          {timeline.map((e) => (
            <li key={e.id} className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-1 border-b border-graticule py-6">
              <span className="tabular col-span-12 text-sm text-dim md:col-span-3">{e.year}</span>
              <div className="col-span-12 md:col-span-9">
                <p className="text-lg font-semibold leading-snug">
                  {e.project ? (
                    <Link href={`/${lang}/work/${e.project}`} className="link-quiet">
                      {t(e.title, lang)}
                    </Link>
                  ) : (
                    t(e.title, lang)
                  )}
                </p>
                {e.place && <p className="text-dim">{e.place}</p>}
                {e.detail && <p className="measure mt-2 text-ink/80">{t(e.detail, lang)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────────── 05 Skills ───────────── */}
      <section id="skills" aria-labelledby="skills-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="skills" title={d.skills.title} intro={d.skills.intro} />
        <div className="col-span-12 mt-10 md:col-span-11 md:col-start-2">
          {skillGroups.map((g) => (
            <div key={g.id} className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-3 border-b border-graticule py-7">
              <div className="col-span-12 md:col-span-3">
                <h3 className="text-lg font-semibold">{g.name[lang]}</h3>
                <p className="mt-1 text-sm text-dim">{g.role[lang]}</p>
              </div>
              <ul className="col-span-12 flex flex-wrap gap-x-5 gap-y-1 md:col-span-5">
                {g.items.map((it) => (
                  <li key={t(it.name, "en")}>{t(it.name, lang)}</li>
                ))}
              </ul>
              <div className="col-span-12 text-sm md:col-span-4">
                <p className="text-dim">{d.skills.proof}</p>
                <ul className="mt-1">
                  {g.proof.map((slug) => {
                    const p = projects.find((x) => x.slug === slug);
                    return p ? (
                      <li key={slug}>
                        <Link href={`/${lang}/work/${slug}`} className="link-quiet">
                          {p.title.split(":")[0]}
                        </Link>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── 06 Resume ───────────── */}
      <section id="resume" aria-labelledby="resume-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="resume" title={d.resume.title} />
        <div className="col-span-12 mt-10 flex flex-wrap gap-3 text-sm md:col-span-11 md:col-start-2">
          <a href={cv} download className="bg-ink px-4 py-2.5 font-semibold text-screen transition-colors hover:bg-ch1">
            {d.resume.download}
          </a>
        </div>
      </section>

      {/* ───────────── 07 Contact ───────────── */}
      <section id="contact" aria-labelledby="contact-title" className="grid-frame py-24 md:py-40">
        <SectionHeading id="contact" title={d.contact.title} intro={d.contact.intro} />
        <div className="col-span-12 mt-10 md:col-span-11 md:col-start-2">
          <a href={`mailto:${profile.email}`} className="display condensed link-quiet text-[clamp(1.8rem,5vw,4.2rem)] font-bold">
            {profile.email}
          </a>
          <p className="mt-6 text-dim">{profile.seeking[lang]}</p>
        </div>
      </section>
    </>
  );
}

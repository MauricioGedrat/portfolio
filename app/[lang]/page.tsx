import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { HeroName } from "@/components/hero-name";
import { HeroScope } from "@/components/hero-scope";
import { LabGenerator } from "@/components/lab-generator";
import { PcbPulse } from "@/components/pcb-pulse";
import { ScopeTrace } from "@/components/scope-trace";
import { SectionHeading } from "@/components/section-heading";
import { SkillsBoard } from "@/components/skills-board";
import { TimelineRail } from "@/components/timeline-rail";
import { WorkIndex } from "@/components/work-index";
import { about } from "@/content/about";
import { profile } from "@/content/profile";
import { getProjects } from "@/lib/content";
import { skillGroups, timeline } from "@/content/timeline";
import { getDictionary, hasLocale, t } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const projects = await getProjects();
  const ranked = projects;
  const cv = lang === "pt" ? "/cv/curriculo-mauricio-gedrat.pdf" : "/cv/resume-mauricio-gedrat.pdf";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: `${SITE_URL}/${lang}`,
    email: `mailto:${profile.email}`,
    jobTitle: profile.role[lang],
    description: profile.statement[lang],
    address: { "@type": "PostalAddress", addressLocality: "Ivoti", addressRegion: "RS", addressCountry: "BR" },
    alumniOf: { "@type": "EducationalOrganization", name: "Fundação Escola Técnica Liberato Salzano Vieira da Cunha" },
    award: "2º lugar em Ciências da Computação — 41ª MOSTRATEC-Liberato",
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsLanguage: ["pt-BR", "en"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {/* ───────────── Hero ───────────── */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[var(--nav-h)]">
        {/* Desktop: the scope fills the right side, behind the name, clear of the text. */}
        <div data-intro="fade" style={{ "--d": "250ms" } as React.CSSProperties} className="absolute bottom-0 right-0 top-[var(--nav-h)] -z-10 hidden w-[64%] md:block">
          <HeroScope className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_30%)]" />
        </div>

        <div className="grid-frame w-full pt-[7vh]">
          <div className="col-span-12">
            <HeroName lines={["Maurício", "Gedrat"]} />
          </div>
        </div>

        {/* Phone: the scope sits in the flow, between the name and the text. */}
        <ScopeTrace className="relative mx-[var(--gutter)] mt-8 h-44 md:hidden" />

        <div className="grid-frame mt-auto w-full gap-y-6 pb-10 pt-10">
          <div data-intro style={{ "--d": "380ms" } as React.CSSProperties} className="col-span-12 md:col-span-7 lg:col-span-5">
            <p className="text-lg font-semibold">{profile.role[lang]}</p>
            <p className="measure mt-3 text-ink/85">{profile.statement[lang]}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="#work" data-track="cta_click" data-track-target="see-work" className="bg-ink px-4 py-2.5 font-semibold text-screen transition-colors hover:bg-ch1">
                {d.hero.seeWork}
              </a>
              <a href={cv} download data-track="resume_download" data-track-target={lang} className="border border-rule px-4 py-2.5 transition-colors hover:border-ink">
                {d.hero.download}
              </a>
            </div>
          </div>
          <dl data-intro style={{ "--d": "520ms" } as React.CSSProperties} className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-3 self-end text-sm md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
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
          {about.map(({ key, text }, i) => (
            <div
              key={key}
              data-reveal="line"
              style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
              className="rule-b grid grid-cols-12 gap-x-[var(--gutter)] gap-y-2 py-7"
            >
              <dt className="col-span-12 text-sm text-dim md:col-span-3">{d.about[key]}</dt>
              <dd className="measure col-span-12 text-lg leading-snug md:col-span-9">{t(text, lang)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────────── 03 Lab ───────────── */}
      <section id="lab" aria-labelledby="lab-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="lab" title={d.lab.title} intro={d.lab.intro} />
        <LabGenerator lang={lang} />
      </section>

      {/* ───────────── 04 Experience ───────────── */}
      <section id="experience" aria-labelledby="experience-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="experience" title={d.experience.title} />
        <TimelineRail className="col-span-12 mt-10 md:col-span-11 md:col-start-2">
          {timeline.map((e, i) => (
            <li
              key={e.id}
              data-reveal="line"
              data-row
              style={{ "--d": `${Math.min(i, 5) * 70}ms` } as React.CSSProperties}
              className="group rule-b relative grid grid-cols-12 gap-x-[var(--gutter)] gap-y-1 py-6 pl-6"
            >
              <span
                aria-hidden
                className="absolute left-0 top-[2.1rem] size-[7px] -translate-x-1/2 rounded-full border border-rule bg-screen transition-colors duration-[var(--dur-base)] group-data-[lit]:border-ch1 group-data-[lit]:bg-ch1"
              />
              <span className="tabular col-span-12 text-sm text-dim transition-colors group-data-[lit]:text-ink md:col-span-3">{e.year}</span>
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
        </TimelineRail>
      </section>

      {/* ───────────── 05 Skills ───────────── */}
      <section id="skills" aria-labelledby="skills-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="skills" title={d.skills.title} intro={d.skills.intro} />
        <SkillsBoard
          groups={skillGroups}
          titles={Object.fromEntries(projects.map((p) => [p.slug, p.title.split(":")[0]]))}
          lang={lang}
          labels={{ proof: d.skills.proof, usedIn: d.skills.usedIn, noProject: d.skills.noProject }}
        />
      </section>

      {/* ───────────── 06 Resume ───────────── */}
      <section id="resume" aria-labelledby="resume-title" className="grid-frame py-24 md:py-32">
        <SectionHeading id="resume" title={d.resume.title} />
        <div data-reveal className="col-span-12 mt-10 flex flex-wrap gap-3 text-sm md:col-span-11 md:col-start-2">
          <a href={cv} download data-track="resume_download" data-track-target={lang} className="bg-ink px-4 py-2.5 font-semibold text-screen transition-colors hover:bg-ch1">
            {d.resume.download}
          </a>
          <Link href={`/${lang}/resume`} className="border border-rule px-4 py-2.5 transition-colors hover:border-ink">
            {d.resume.view}
          </Link>
        </div>
      </section>

      {/* ───────────── 07 Contact ───────────── */}
      <section
        id="contact"
        aria-labelledby="contact-title"
        className="grid-frame relative isolate min-h-[88svh] content-start overflow-hidden py-24 md:py-40"
      >
        {/* Backdrop: the board sits low and dim; the signal pulse crosses it under the text. */}
        <PcbPulse className="absolute inset-0 -z-10 opacity-70">
          <div className="absolute inset-0 bg-gradient-to-b from-screen via-screen/70 to-screen/20" />
        </PcbPulse>
        <SectionHeading id="contact" title={d.contact.title} intro={d.contact.intro} />
        <div data-reveal style={{ "--d": "160ms" } as React.CSSProperties} className="col-span-12 mt-10 md:col-span-11 md:col-start-2">
          <a href={`mailto:${profile.email}`} className="display condensed link-quiet text-[clamp(1.8rem,5vw,4.2rem)] font-bold">
            {profile.email}
          </a>
          <p className="mt-6 text-dim">{profile.seeking[lang]}</p>
        </div>
        <div data-reveal style={{ "--d": "260ms" } as React.CSSProperties} className="col-span-12 mt-12 md:col-span-8 md:col-start-2 lg:col-span-6 lg:col-start-2">
          <ContactForm lang={lang} />
        </div>
      </section>
    </>
  );
}

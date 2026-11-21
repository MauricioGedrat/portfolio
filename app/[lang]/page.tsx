import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { HeroName } from "@/components/hero-name";
import { HeroScope } from "@/components/hero-scope";
import { HeroWaveSwitch } from "@/components/hero-wave-switch";
import { LabGenerator } from "@/components/lab-generator";
import { PcbPulse } from "@/components/pcb-pulse";
import { ScopeTrace } from "@/components/scope-trace";
import { SectionHeading } from "@/components/section-heading";
import { FocusRows } from "@/components/focus-rows";
import { Photo } from "@/components/photo";
import { SkillsBoard } from "@/components/skills-board";
import { StatsBand } from "@/components/stats-band";
import { TechMarquee } from "@/components/tech-marquee";
import { TimelineRail } from "@/components/timeline-rail";
import { WorkIndex } from "@/components/work-index";
import { about } from "@/content/about";
import { profile } from "@/content/profile";
import { getProjects } from "@/lib/content";
import { skillGroups, timeline } from "@/content/timeline";
import { getDictionary, hasLocale, t } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { accent, cssVar, sectionChannel, type Channel } from "@/lib/accent";

const kindChannel: Record<string, Channel> = { achievement: "ch1", project: "ch2", experience: "ch3", education: "ch4", course: "copper" };

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
              <a href="#work" data-track="cta_click" data-track-target="see-work" className="bg-ch1 px-4 py-2.5 font-semibold text-screen shadow-[0_0_24px_-6px_var(--color-ch1)] transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_0_32px_-4px_var(--color-ch1)]">
                {d.hero.seeWork}
              </a>
              <a href={cv} download data-track="resume_download" data-track-target={lang} className="border border-ch2/60 px-4 py-2.5 transition-colors hover:border-ch2 hover:bg-ch2/10">
                {d.hero.download}
              </a>
            </div>
            <HeroWaveSwitch lang={lang} />
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

      <StatsBand lang={lang} projects={projects.length} />

      {/* ───────────── 01 Work ───────────── */}
      <section id="work" aria-labelledby="work-title" style={accent(sectionChannel.work)} className="glow grid-frame py-24 md:py-32">
        <SectionHeading id="work" title={d.work.title} intro={d.work.intro} />
        <WorkIndex items={ranked} lang={lang} d={d} />
      </section>

      {/* ───────────── 02 About ───────────── */}
      <section id="about" aria-labelledby="about-title" style={accent(sectionChannel.about)} className="glow glow-left grid-frame py-24 md:py-32">
        <SectionHeading id="about" title={d.about.title} />
        <div className="col-span-12 mt-10 grid grid-cols-12 gap-x-[var(--gutter)] gap-y-10 md:col-span-11 md:col-start-2">
          {/* the bench: stays in view while the answers scroll past */}
          <figure className="col-span-12 md:col-span-5 lg:col-span-4">
            <div className="relative overflow-hidden md:sticky md:top-[calc(var(--nav-h)+2rem)]">
              <div className="relative aspect-[16/10] overflow-hidden md:aspect-[4/5]">
                <div data-parallax="0.08" className="absolute inset-x-0 -inset-y-[10%]">
                  <Photo name="scope" lang={lang} sizes="(min-width: 768px) 33vw, 100vw" className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-screen via-transparent to-transparent" />
                <div className="absolute inset-0 mix-blend-color" style={{ background: "color-mix(in oklab, var(--accent) 22%, transparent)" }} />
              </div>
              <figcaption className="mt-3 flex items-center gap-2 text-xs text-dim">
                <span aria-hidden className="bg-accent inline-block h-px w-5" />
                {lang === "pt" ? "Na bancada, é o osciloscópio que diz se o circuito funciona." : "At the bench, the oscilloscope is what tells you whether the circuit works."}
              </figcaption>
            </div>
          </figure>
          <FocusRows className="col-span-12 md:col-span-7 lg:col-span-8">
            {about.map(({ key, text }, i) => (
              <div
                key={key}
                data-reveal="line"
                data-focus-row
                style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
                className="group rule-b py-7 first:pt-0"
              >
                <dt className="text-accent flex items-center gap-2 text-sm">
                  <span className="tabular">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-dim transition-colors group-data-[active]:text-ink">{d.about[key]}</span>
                </dt>
                <dd className="measure mt-2 text-lg leading-snug text-ink/60 transition-colors duration-[var(--dur-slow)] group-data-[active]:text-ink">
                  {t(text, lang)}
                </dd>
              </div>
            ))}
          </FocusRows>
        </div>
      </section>

      {/* ───────────── 03 Lab ───────────── */}
      <section id="lab" aria-labelledby="lab-title" style={accent(sectionChannel.lab)} className="grid-frame relative isolate overflow-hidden py-24 md:py-32">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]">
          <div data-parallax="0.2" className="absolute inset-x-0 -inset-y-[15%]">
            <Photo name="yellowSine" lang={lang} sizes="100vw" className="h-full w-full object-cover opacity-45" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-screen via-screen/60 to-transparent" />
        </div>
        <SectionHeading id="lab" title={d.lab.title} intro={d.lab.intro} />
        <LabGenerator lang={lang} />
      </section>

      {/* ───────────── 04 Experience ───────────── */}
      <section id="experience" aria-labelledby="experience-title" style={accent(sectionChannel.experience)} className="grid-frame relative isolate overflow-hidden py-24 md:py-32">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[30rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_30%,transparent)]">
          <div data-parallax="0.22" className="absolute inset-x-0 -inset-y-[15%]">
            <Photo name="bluePcb" lang={lang} sizes="100vw" className="h-full w-full object-cover opacity-50" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-screen via-screen/70 to-screen/10" />
        </div>
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
                style={{ "--dot": cssVar(kindChannel[e.kind] ?? "ch1") } as React.CSSProperties}
                className="absolute left-0 top-[2.1rem] size-[9px] -translate-x-1/2 rounded-full border border-[var(--dot)] bg-screen transition-[background-color,box-shadow] duration-[var(--dur-base)] group-data-[lit]:bg-[var(--dot)] group-data-[lit]:shadow-[0_0_10px_var(--dot)]"
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
      <section id="skills" aria-labelledby="skills-title" style={accent(sectionChannel.skills)} className="glow grid-frame py-24 md:py-32">
        <SectionHeading id="skills" title={d.skills.title} intro={d.skills.intro} />
        <SkillsBoard
          groups={skillGroups}
          titles={Object.fromEntries(projects.map((p) => [p.slug, p.title.split(":")[0]]))}
          lang={lang}
          labels={{ proof: d.skills.proof, usedIn: d.skills.usedIn, noProject: d.skills.noProject }}
        />
      </section>

      <TechMarquee groups={skillGroups} lang={lang} />

      {/* ───────────── 06 Resume ───────────── */}
      <section id="resume" aria-labelledby="resume-title" style={accent(sectionChannel.resume)} className="glow glow-left grid-frame py-24 md:py-32">
        <SectionHeading id="resume" title={d.resume.title} />
        <div data-reveal className="col-span-12 mt-10 flex flex-wrap gap-3 text-sm md:col-span-11 md:col-start-2">
          <a href={cv} download data-track="resume_download" data-track-target={lang} className="bg-ch2 px-4 py-2.5 font-semibold text-screen shadow-[0_0_24px_-6px_var(--color-ch2)] transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_0_32px_-4px_var(--color-ch2)]">
            {d.resume.download}
          </a>
          <Link href={`/${lang}/resume`} className="border border-rule px-4 py-2.5 transition-colors hover:border-ch2">
            {d.resume.view}
          </Link>
        </div>
      </section>

      {/* ───────────── 07 Contact ───────────── */}
      <section
        id="contact"
        aria-labelledby="contact-title"
        style={accent(sectionChannel.contact)}
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useRef, useState, ViewTransition, type CSSProperties } from "react";
import type { Discipline, Locale, Project } from "@/content/types";
import { accent, cssVar, disciplineChannel, disciplineLabel } from "@/lib/accent";
import { t, type Dictionary } from "@/lib/i18n";
import { projectBanner } from "@/lib/photos";
import { Photo } from "./photo";
import { SignalChain } from "./signal-chain";

type Filter = Discipline | "all";

/**
 * The work list, ranked. Full-width rows on the graticule, each in the colour
 * of its main area. Filter chips narrow it down (rows animate in and out),
 * a soft light follows the pointer inside the row, and on desktops a preview
 * picture floats next to the cursor. On touch screens the thumbnail and the
 * system chain are always shown, so nothing depends on hovering.
 */
export function WorkIndex({ items, lang, d }: { items: Project[]; lang: Locale; d: Dictionary }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [hover, setHover] = useState<string | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const order: Discipline[] = ["electronics", "software", "data", "embedded", "power"];
  const counts = Object.fromEntries(order.map((k) => [k, items.filter((p) => p.disciplines.includes(k)).length])) as Record<
    Discipline,
    number
  >;
  const shown = filter === "all" ? items : items.filter((p) => p.disciplines.includes(filter));
  const pick = (f: Filter) => startTransition(() => setFilter(f));

  const movePreview = (e: React.PointerEvent) => {
    const el = preview.current;
    if (!el) return;
    el.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 120}px, 0)`;
  };

  const chip = (f: Filter, label: string, n: number, color: string) => (
    <button
      key={f}
      type="button"
      aria-pressed={filter === f}
      onClick={() => pick(f)}
      className={`group/chip flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors duration-[var(--dur-fast)] ${
        filter === f ? "border-ink bg-ink text-screen" : "border-rule text-dim hover:border-ink hover:text-ink"
      }`}
    >
      <span aria-hidden className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
      <span className={`tabular text-xs ${filter === f ? "text-screen/70" : "text-dim"}`}>{n}</span>
    </button>
  );

  return (
    <div className="col-span-12 mt-10">
      <div role="group" aria-label={lang === "pt" ? "Filtrar por área" : "Filter by area"} className="mb-8 flex flex-wrap gap-2">
        {chip("all", lang === "pt" ? "Todos" : "All", items.length, "var(--color-ink)")}
        {order.filter((k) => counts[k] > 0).map((k) => chip(k, t(disciplineLabel[k], lang), counts[k], cssVar(disciplineChannel[k])))}
      </div>

      <ol onPointerMove={movePreview} onPointerLeave={() => setHover(null)}>
        {shown.map((p, i) => {
          const main = disciplineChannel[p.disciplines[0]];
          const cover = p.media?.[0];
          const banner = projectBanner[p.slug];
          return (
            <ViewTransition key={p.slug}>
              <li
                data-reveal="line"
                style={{ ...accent(main), "--d": `${Math.min(i, 5) * 80}ms` } as CSSProperties}
                className="rule-b first:rule-y"
              >
                <Link
                  href={`/${lang}/work/${p.slug}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setHover(p.slug);
                  }}
                  onPointerMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                  }}
                  className="group relative isolate grid grid-cols-12 gap-x-[var(--gutter)] gap-y-3 overflow-hidden py-7 outline-offset-[-2px] md:py-9"
                  aria-label={`${d.work.open}: ${p.title}`}
                >
                  {/* light that follows the pointer, in the row's colour */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-[var(--dur-base)] group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)",
                    }}
                  />
                  {/* accent bar on the left edge */}
                  <span
                    aria-hidden
                    className="bg-accent absolute bottom-3 left-0 top-3 w-[2px] origin-top scale-y-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
                  />

                  <span className="tabular text-accent col-span-2 pl-3 pt-2 text-sm md:col-span-1">{String(items.indexOf(p) + 1).padStart(2, "0")}</span>

                  <div className="col-span-10 md:col-span-8">
                    <h3
                      className={`display font-bold transition-[font-stretch,color] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] [font-stretch:80%] group-hover:[font-stretch:96%] group-focus-visible:[font-stretch:96%] ${
                        items.indexOf(p) < 2 ? "text-[clamp(1.9rem,4.6vw,4rem)]" : "text-[clamp(1.6rem,3.4vw,2.9rem)]"
                      } leading-[0.95]`}
                    >
                      <ViewTransition name={`title-${p.slug}`} share="morph" default="none">
                        <span className="inline-block">{p.title.split(":")[0]}</span>
                      </ViewTransition>
                    </h3>
                    <p className="measure mt-3 text-dim">{t(p.subtitle, lang)}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {p.disciplines.map((k) => (
                        <li key={k} className="flex items-center gap-1.5 text-ink/80">
                          <span aria-hidden className="size-1.5 rounded-full" style={{ background: cssVar(disciplineChannel[k]) }} />
                          {t(disciplineLabel[k], lang)}
                        </li>
                      ))}
                    </ul>
                    {p.award && (
                      <p className="mt-3 flex items-center gap-2 text-sm">
                        <span aria-hidden className="bg-accent inline-block h-px w-5" />
                        {t(p.award, lang)}
                      </p>
                    )}
                    <div className="mt-5 max-h-40 overflow-hidden transition-[max-height,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:max-h-40 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:max-h-40 [@media(hover:hover)]:group-focus-visible:opacity-100">
                      <SignalChain nodes={p.chain} lang={lang} compact />
                    </div>
                  </div>

                  {/* touch screens: a thumbnail, since there is no hover preview */}
                  <div className="col-span-10 col-start-3 overflow-hidden bg-panel [@media(hover:hover)]:hidden">
                    {cover ? (
                      <Image src={cover.src} width={cover.width} height={cover.height} alt="" sizes="80vw" className="aspect-[16/9] h-auto w-full object-cover" />
                    ) : banner ? (
                      <Photo name={banner} lang={lang} sizes="80vw" className="aspect-[16/9] h-auto w-full object-cover" />
                    ) : null}
                  </div>

                  <dl className="col-span-10 col-start-3 flex gap-6 text-sm text-dim md:col-span-3 md:col-start-auto md:flex-col md:items-end md:gap-1 md:pt-2 md:text-right">
                    <div>
                      <dt className="sr-only">{d.caseStudy.year}</dt>
                      <dd className="tabular text-ink">{p.year}</dd>
                    </div>
                    {p.collaborators && (
                      <div>
                        <dt className="sr-only">{d.caseStudy.team}</dt>
                        <dd>
                          {d.work.with} {p.collaborators.join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                </Link>
              </li>
            </ViewTransition>
          );
        })}
      </ol>

      {/* desktop: picture that floats beside the cursor while a row is hovered */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden w-72 [@media(hover:hover)]:block"
        style={{ transform: "translate3d(-9999px,0,0)" }}
      >
        {items.map((p) => {
          const cover = p.media?.[0];
          const banner = projectBanner[p.slug];
          const on = hover === p.slug;
          return (
            <div
              key={p.slug}
              className={`absolute inset-x-0 top-0 overflow-hidden border border-rule bg-panel shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] ${
                on ? "rotate-[-2deg] scale-100 opacity-100" : "rotate-0 scale-90 opacity-0"
              }`}
              style={{ borderTop: `2px solid ${cssVar(disciplineChannel[p.disciplines[0]])}` }}
            >
              {cover ? (
                <Image src={cover.src} width={cover.width} height={cover.height} alt="" sizes="288px" className="aspect-[4/3] h-auto w-full object-cover" />
              ) : banner ? (
                <Photo name={banner} lang={lang} sizes="288px" className="aspect-[4/3] h-auto w-full object-cover" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

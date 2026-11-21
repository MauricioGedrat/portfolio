import Link from "next/link";
import type { Locale, Project } from "@/content/types";
import { t, type Dictionary } from "@/lib/i18n";
import { SignalChain } from "./signal-chain";

/**
 * The work list, ranked. Not cards: full-width rows on the graticule.
 * Hover or focus reveals the project's system; on touch screens the
 * system is always shown, so nothing depends on hovering.
 */
export function WorkIndex({ items, lang, d }: { items: Project[]; lang: Locale; d: Dictionary }) {
  return (
    <ol className="col-span-12 mt-10">
      {items.map((p, i) => (
        <li
          key={p.slug}
          data-reveal="line"
          style={{ "--d": `${Math.min(i, 5) * 80}ms` } as React.CSSProperties}
          className="rule-b first:rule-y"
        >
          <Link
            href={`/${lang}/work/${p.slug}`}
            className="group grid grid-cols-12 gap-x-[var(--gutter)] gap-y-3 py-7 outline-offset-[-2px] md:py-9"
            aria-label={`${d.work.open}: ${p.title}`}
          >
            <span className="tabular col-span-2 pt-2 text-sm text-dim md:col-span-1">{String(i + 1).padStart(2, "0")}</span>

            <div className="col-span-10 md:col-span-8">
              <h3
                className={`display font-bold transition-[font-stretch,color] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] [font-stretch:80%] group-hover:[font-stretch:96%] group-focus-visible:[font-stretch:96%] ${
                  i < 2 ? "text-[clamp(1.9rem,4.6vw,4rem)]" : "text-[clamp(1.6rem,3.4vw,2.9rem)]"
                } leading-[0.95]`}
              >
                {p.title.split(":")[0]}
              </h3>
              <p className="measure mt-3 text-dim">{t(p.subtitle, lang)}</p>
              {p.award && (
                <p className="mt-3 flex items-center gap-2 text-sm">
                  <span aria-hidden className="inline-block h-px w-5 bg-ch1" />
                  {t(p.award, lang)}
                </p>
              )}
              <div className="mt-5 max-h-40 overflow-hidden transition-[max-height,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:max-h-40 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:max-h-40 [@media(hover:hover)]:group-focus-visible:opacity-100">
                <SignalChain nodes={p.chain} lang={lang} compact />
              </div>
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
      ))}
    </ol>
  );
}

"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { Locale, SkillGroup } from "@/content/types";
import { accent, skillGroupChannel } from "@/lib/accent";
import { t } from "@/lib/i18n";

type Titles = Record<string, string>;

/**
 * Skills grouped by area. Each skill that a project actually uses is a
 * button: pointing at it (or focusing / tapping it) swaps the right column
 * from the area's projects to the projects that use that exact skill.
 */
export function SkillsBoard({
  groups,
  titles,
  lang,
  labels,
}: {
  groups: SkillGroup[];
  titles: Titles;
  lang: Locale;
  labels: { proof: string; usedIn: string; noProject: string };
}) {
  const [sel, setSel] = useState<{ group: string; skill: string; label: string; projects: string[] } | null>(null);

  return (
    <div className="col-span-12 mt-10 md:col-span-11 md:col-start-2" onMouseLeave={() => setSel(null)}>
      {groups.map((g, gi) => {
        const active = sel?.group === g.id ? sel : null;
        const list = active ? active.projects : g.proof;
        return (
          <div
            key={g.id}
            data-reveal="line"
            style={{ ...accent(skillGroupChannel(g.id)), "--d": `${gi * 70}ms` } as CSSProperties}
            className="rule-b grid grid-cols-12 gap-x-[var(--gutter)] gap-y-3 py-7"
          >
            <div className="col-span-12 md:col-span-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <span aria-hidden className="bg-accent size-2 rounded-full shadow-[0_0_8px_var(--accent)]" />
                {g.name[lang]}
              </h3>
              <p className="mt-1 text-sm text-dim">{g.role[lang]}</p>
            </div>
            <ul className="col-span-12 flex flex-wrap gap-x-1 gap-y-1 md:col-span-5">
              {g.items.map((it) => {
                const name = t(it.name, lang);
                const key = t(it.name, "en");
                const on = active?.skill === key;
                const pick = () => setSel({ group: g.id, skill: key, label: name, projects: it.projects ?? [] });
                return (
                  <li key={key}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onMouseEnter={pick}
                      onFocus={pick}
                      onClick={pick}
                      className={`relative px-2 py-1 transition-colors duration-[var(--dur-fast)] ${
                        on ? "text-accent" : it.projects?.length ? "text-ink hover:text-[var(--accent)]" : "text-ink/70"
                      }`}
                    >
                      {name}
                      <span
                        aria-hidden
                        className={`bg-accent absolute inset-x-2 -bottom-px h-px origin-left transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] ${
                          on ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="col-span-12 text-sm md:col-span-4" aria-live="polite">
              <p className="text-dim">{active ? `${labels.usedIn} ${active.label}` : labels.proof}</p>
              {list.length === 0 ? (
                <p className="mt-1 text-ink/70">{labels.noProject}</p>
              ) : (
                <ul className="mt-1">
                  {list.map((slug) => (
                    <li key={slug}>
                      <Link href={`/${lang}/work/${slug}`} className="link-quiet">
                        {titles[slug] ?? slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

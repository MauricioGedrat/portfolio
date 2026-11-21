import type { Locale, SkillGroup } from "@/content/types";
import { cssVar, skillGroupChannel } from "@/lib/accent";
import { t } from "@/lib/i18n";

/** Two rows of technologies drifting in opposite directions; faster when you scroll fast. */
export function TechMarquee({ groups, lang }: { groups: SkillGroup[]; lang: Locale }) {
  const all = groups.flatMap((g) => g.items.map((it) => ({ name: t(it.name, lang), ch: skillGroupChannel(g.id) })));
  const half = Math.ceil(all.length / 2);
  const rows = [all.slice(0, half), all.slice(half)];
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-graticule py-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} data-marquee className="marquee-track flex w-max gap-10 py-2" {...(r === 1 ? { "data-reverse": "" } : {})}>
          {[...row, ...row].map((it, i) => (
            <span key={i} className="display flex items-center gap-3 whitespace-nowrap text-[clamp(1.6rem,3.6vw,3rem)] [font-stretch:78%]">
              <span className="size-2.5 rounded-full" style={{ background: cssVar(it.ch), boxShadow: `0 0 10px ${cssVar(it.ch)}` }} />
              <span className={i % 3 === 1 ? "text-transparent [-webkit-text-stroke:1px_var(--color-ink)]" : "text-ink/90"}>{it.name}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

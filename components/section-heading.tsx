import { cssVar, sectionChannel } from "@/lib/accent";
import { sectionNumber, type SectionId } from "@/lib/sections";

/** Section opener: position number on the hairline, title in condensed display type. */
export function SectionHeading({ id, title, intro }: { id: SectionId; title: string; intro?: string }) {
  return (
    <div data-reveal="line" className="rule-t col-span-12 grid grid-cols-12 gap-x-[var(--gutter)] pt-5">
      <span className="tabular col-span-2 flex items-center gap-2 text-sm md:col-span-1" style={{ color: cssVar(sectionChannel[id]) }}>
        <span aria-hidden className="inline-block size-1.5 rounded-full" style={{ background: cssVar(sectionChannel[id]), boxShadow: `0 0 8px ${cssVar(sectionChannel[id])}` }} />
        {sectionNumber(id)}
      </span>
      <div className="col-span-10 md:col-span-11">
        <h2 id={`${id}-title`} data-reveal="clip" style={{ "--d": "140ms" } as React.CSSProperties} className="display velo text-[clamp(2.6rem,7vw,6rem)]">
          {title}
        </h2>
        {intro && <p className="measure mt-5 text-dim">{intro}</p>}
      </div>
    </div>
  );
}
